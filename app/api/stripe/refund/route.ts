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
      .select("id, total_price, user_id, refund_status, refund_reason, shipping_address, status")
      .eq("id", order_id)
      .single()

    console.log("📋 Order fetched:", { order, orderErr })

    if (orderErr || !order) {
      console.error("❌ Order not found:", orderErr)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Look up the payment record from payments table
    console.log("🔍 Looking up payment record for order:", order_id)

    // First, try flexible query to find ANY payment for this order
    const { data: allPayments, error: allPaymentsErr } = await supabase
      .from("payments")
      .select("payment_id, transaction_id, details, method, status")
      .eq("order_id", order_id)
      .order("created_at", { ascending: false })

    console.log("📊 All payments for order:", { allPayments, allPaymentsErr })

    if (allPaymentsErr || !allPayments || allPayments.length === 0) {
      console.error("❌ No payment records found for this order:", allPaymentsErr)
      return NextResponse.json({
        error: "No payment record found for this order. Cannot process refund without Stripe payment ID."
      }, { status: 400 })
    }

    // Use the most recent successful payment
    const payment = allPayments.find(p =>
      p.status === "success" || p.status === "paid" || p.transaction_id
    ) || allPayments[0]

    console.log("💳 Selected payment record:", { payment })

    // Get the Stripe payment intent ID from transaction_id or details
    const stripePaymentId = payment.transaction_id || payment.details?.payment_intent_id || payment.payment_id
    if (!stripePaymentId) {
      console.error("❌ No payment intent ID found in payment record:", payment)
      return NextResponse.json({ error: "No payment intent found in payment record" }, { status: 400 })
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
