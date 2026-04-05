import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { sendRefundEmail } from "@/lib/server/refund-email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { order_id, amount, admin_note } = await req.json()

    console.log("🔄 Refund processing started:", { order_id, amount, admin_note })

    // Get order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, total_price, user_id, refund_status, refund_reason, shipping_address, status, payment_intent_id")
      .eq("id", order_id)
      .single()

    console.log("📋 Order fetched:", { order, orderErr })

    if (orderErr || !order) {
      console.error("❌ Order not found:", orderErr)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Resolve Stripe Payment ID (Robust Discovery)
    let stripePaymentId: string | null = null;

    // 1. Check if the order record already has the PI linked (Best fallback)
    if ((order as any).payment_intent_id) {
      stripePaymentId = (order as any).payment_intent_id;
      console.log("🎯 Found Payment Intent ID directly on Order record:", stripePaymentId);
    }

    // 2. Fallback: Search payments table if PI is missing from Order record
    if (!stripePaymentId) {
      console.log("🔍 Secondary lookup: searching payments table for order:", order_id);
      const { data: allPayments } = await supabase
        .from("payments")
        .select("payment_id, transaction_id, details, status")
        .eq("order_id", order_id)
        .order("created_at", { ascending: false });

      if (allPayments && allPayments.length > 0) {
        const payment = allPayments.find(p => p.status === "success" || p.transaction_id) || allPayments[0];
        stripePaymentId = payment.transaction_id || payment.details?.payment_intent_id || payment.payment_id;
        console.log("💳 Found Payment ID in payments table:", stripePaymentId);
      }
    }

    if (!stripePaymentId) {
      console.error("❌ No payment intent ID discovered for order:", order_id);
      return NextResponse.json({
        error: "No payment record found for this order. It might not be fully synchronized yet. Please try again in 1-2 minutes or contact support."
      }, { status: 400 });
    }

    // EXTRA RESOLUTION: Convert Session IDs (cs_...) to Refundable PIs (pi_...)
    if (stripePaymentId.startsWith("cs_")) {
      console.warn("⚠️ Warning: stripePaymentId is a Session ID (cs_), resolving PI from Stripe...");
      try {
        const session = await stripe.checkout.sessions.retrieve(stripePaymentId);
        if (session.payment_intent) {
          stripePaymentId = session.payment_intent as string;
          console.log("🔄 Resolved Payment Intent from Session:", stripePaymentId);
        } else {
          throw new Error("checkout_session_not_found_or_no_pi");
        }
      } catch (err) {
        console.error("❌ Failed to resolve PI from Session ID:", err);
        return NextResponse.json({ error: "Only captured payments can be refunded directly. If this was recent, please wait a minute for sync." }, { status: 400 });
      }
    }

    // Validate refund amount (admin decides amount)
    const refundAmount = Math.min(amount || order.total_price, order.total_price)
    console.log("💰 Refund amount:", refundAmount)

    // Process Stripe refund
    console.log("🔗 Creating Stripe refund with Payment Intent:", stripePaymentId)
    const stripeRefund = await stripe.refunds.create({
      payment_intent: stripePaymentId,
      amount: Math.round(refundAmount * 100),
      reason: "requested_by_customer"
    })

    console.log("✅ Stripe refund created:", { id: stripeRefund.id, status: stripeRefund.status })

    if (stripeRefund.status !== "succeeded" && stripeRefund.status !== "pending") {
      console.error("❌ Stripe refund failed with status:", stripeRefund.status)
      return NextResponse.json({ error: "Stripe refund failed" }, { status: 500 })
    }

    // Determine new status: pending/confirmed/processing -> cancelled, shipped/delivered -> refunded
    const isCancellable = ["pending", "confirmed", "processing"].includes(order.status);
    const newStatus = isCancellable ? "cancelled" : "refunded";

    console.log(`📝 Updating order with refund status and marking as ${newStatus}...`)
    const { error: updateErr, data: updateData } = await supabase
      .from("orders")
      .update({
        refund_amount: refundAmount,
        refund_status: "processed",
        admin_note: admin_note || "",
        status: newStatus
      })
      .eq("id", order_id)
      .select()

    console.log("📊 Update result:", { updateData, updateErr })

    if (updateErr) {
      console.error("❌ Error updating order:", updateErr)
      return NextResponse.json({ error: "Failed to update order: " + updateErr.message }, { status: 500 })
    }

    // Verify the update worked
    const { data: verifyOrder, error: verifyErr } = await supabase
      .from("orders")
      .select("id, refund_status, refund_amount, admin_note")
      .eq("id", order_id)
      .single()

    console.log("✅ Verified order after update:", { verifyOrder, verifyErr })

    // Insert refund record into payments table
    console.log("💳 Inserting payment record for refund...")
    const { error: refundPaymentErr } = await supabase.from("payments").insert({
      payment_id: stripeRefund.id,
      order_id: order_id,
      transaction_id: stripeRefund.id,
      method: "stripe",
      status: "refund",
      user_id: order.user_id,
      amount: refundAmount,
      currency: "usd",
      details: { type: "refund", original_payment: stripePaymentId },
      error_message: null
    })

    if (refundPaymentErr) {
      console.warn("⚠️ Warning: Payment record creation failed:", refundPaymentErr)
    } else {
      console.log("✅ Payment record created successfully")
    }

    console.log("🎉 Refund processed successfully for order:", order_id, "Amount:", refundAmount)

    // Send success email
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", order.user_id)
        .single();

      const customerEmail = profile?.email || order.shipping_address?.email;
      const customerName = profile?.full_name || `${order.shipping_address?.firstName} ${order.shipping_address?.lastName}`;

      if (customerEmail) {
        await sendRefundEmail({
          toEmail: customerEmail,
          customerName: customerName,
          orderId: order_id,
          amount: refundAmount,
          status: "processed",
          adminNote: admin_note
        });
      }
    } catch (emailErr) {
      console.warn("⚠️ Warning: Refund email failed:", emailErr);
    }

    return NextResponse.json({ success: true, refund: stripeRefund, updatedOrder: verifyOrder })
  } catch (error: any) {
    console.error("❌ Refund error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
