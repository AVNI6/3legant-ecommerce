import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendRefundEmail } from "@/lib/server/refund-email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { order_id, admin_note } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch order and customer details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, shipping_address")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Update order status to rejected
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        refund_status: "rejected",
        admin_note: admin_note || "",
      })
      .eq("id", order_id);

    if (updateErr) {
      throw updateErr;
    }

    // 3. Send rejection email
    // Note: We normally get the email from the user profile, but sometimes it's in the shipping address or already known
    // Let's try to get it from the profiles table using user_id
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
        amount: order.total_price,
        status: "rejected",
        adminNote: admin_note
      });
    }

    return NextResponse.json({ success: true, message: "Refund request rejected and customer notified." });
  } catch (error: any) {
    console.error("❌ Reject refund error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
