import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "npm:stripe@^13.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

// --- HELPERS (Exactly as in Next.js webhook route) ---
const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const normalizeAddress = (address?: any): any => ({
  first_name: asText(address?.firstName || address?.first_name),
  last_name: asText(address?.lastName || address?.last_name),
  phone: asText(address?.phone),
  street: asText(address?.street),
  city: asText(address?.city),
  state: asText(address?.state),
  zip: asText(address?.zip),
  country: asText(address?.country),
});

const isSameAddress = (left: any, right: any) =>
  left.street === right.street &&
  left.city === right.city &&
  left.state === right.state &&
  left.zip === right.zip &&
  left.country === right.country;

// --- INITIALIZATION ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// --- MAIN HANDLER ---
serve(async (req) => {
  console.log(`[STRIPE-WEBHOOK] --- New Request ---`);
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error(`[STRIPE-WEBHOOK] Missing stripe-signature header.`);
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET!);
    console.log(`[STRIPE-WEBHOOK] Signature Verified. Event: ${event.type} [${event.id}]`);
  } catch (err: any) {
    console.error(`[STRIPE-WEBHOOK] Signature verification failed: ${err.message}`);
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), { status: 400 });
  }

  let sessionId: string | undefined;
  let paymentIntentId: string | undefined;
  let orderIdFromMetadata: string | undefined;

  const dataObject = event.data.object as any;

  // Resolve session and payment intent IDs based on event type
  if (event.type.startsWith("checkout.session.")) {
    sessionId = dataObject.id;
    paymentIntentId = dataObject.payment_intent;
    orderIdFromMetadata = dataObject.metadata?.orderId;
  } else if (event.type.startsWith("payment_intent.")) {
    paymentIntentId = dataObject.id;
    orderIdFromMetadata = dataObject.metadata?.orderId;
    // We'll need to look up sessionId if it's missing (later)
  }

  console.log(`[STRIPE-WEBHOOK] Processing session: ${sessionId || "N/A"}, PI: ${paymentIntentId || "N/A"}, Order: ${orderIdFromMetadata || "N/A"}`);

  // 1. Fetch current payment record from Supabase
  let paymentRow: any = null;
  if (sessionId) {
    const { data: pBySession } = await supabase.from("payments").select("*").eq("payment_id", sessionId).maybeSingle();
    paymentRow = pBySession;
  }

  if (!paymentRow && paymentIntentId) {
    const { data: pByPI } = await supabase.from("payments").select("*").eq("transaction_id", paymentIntentId).maybeSingle();
    paymentRow = pByPI;
  }

  if (paymentRow) {
    console.log(`[STRIPE-WEBHOOK] Found payment record in DB (ID: ${paymentRow.id}, Order: ${paymentRow.order_id})`);
  } else {
    console.warn(`[STRIPE-WEBHOOK] No payment record found in Supabase yet.`);
  }

  const effectiveOrderId = orderIdFromMetadata || paymentRow?.order_id;
  const effectiveSessionId = sessionId || paymentRow?.payment_id;

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "payment_intent.succeeded": {
        console.log(`[STRIPE-WEBHOOK] Payment Success Event (${event.type}). Attempting fulfillment for Order: ${effectiveOrderId}...`);

        if (!effectiveOrderId) {
          console.warn(`[STRIPE-WEBHOOK] Abandoning fulfillment: No orderId resolved for ${effectiveSessionId || paymentIntentId}.`);
          return new Response(JSON.stringify({ received: true, warning: "OrderId not found" }), { status: 200 });
        }

        // Proceed with fulfillment using metadata as the primary source of truth
        await processSuccessfulSession(dataObject, paymentRow, effectiveOrderId);
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const isExpired = event.type === "checkout.session.expired";
        const nextPaymentStatus = isExpired ? PaymentStatus.EXPIRED : PaymentStatus.FAILED;
        const nextOrderStatus = OrderStatus.CANCELLED;

        console.log(`[STRIPE-WEBHOOK] Payment/Session Failed or Expired. Status: ${nextPaymentStatus}.`);

        // Update Payment (if it exists)
        if (paymentRow) {
          const { error: paymentUpdateError } = await supabase.from("payments").update({
            status: nextPaymentStatus,
            details: {
              ...(paymentRow.details || {}),
              webhook_event: event.type,
              webhook_event_id: event.id,
              updated_at: new Date().toISOString()
            }
          }).eq("payment_id", paymentRow.payment_id);

          if (paymentUpdateError) console.error(`[STRIPE-WEBHOOK] Error updating payment status:`, paymentUpdateError.message);
          else console.log(`[STRIPE-WEBHOOK] Payment record updated to ${nextPaymentStatus}.`);
        }

        // Update Order (if we have an ID)
        if (effectiveOrderId) {
          const { error: orderUpdateError } = await supabase.from("orders").update({ status: nextOrderStatus }).eq("id", effectiveOrderId);
          if (orderUpdateError) console.error(`[STRIPE-WEBHOOK] Error updating order status:`, orderUpdateError.message);
          else console.log(`[STRIPE-WEBHOOK] Order ${effectiveOrderId} marked as ${nextOrderStatus}`);
        } else {
          console.warn(`[STRIPE-WEBHOOK] No order ID discovered to cancel for ${effectiveSessionId || paymentIntentId}.`);
        }
        break;
      }

      case "charge.refunded": {
        const nextPaymentStatus = PaymentStatus.REFUNDED;
        const nextOrderStatus = OrderStatus.REFUNDED;

        console.log(`[STRIPE-WEBHOOK] Charge Refunded. Status: ${nextPaymentStatus}.`);

        if (paymentRow) {
          await supabase.from("payments").update({
            status: nextPaymentStatus,
            details: {
              ...(paymentRow.details || {}),
              webhook_event: event.type,
              webhook_event_id: event.id,
              refunded_at: new Date().toISOString()
            }
          }).eq("payment_id", paymentRow.payment_id);
        }

        if (effectiveOrderId) {
          await supabase.from("orders").update({ status: nextOrderStatus }).eq("id", effectiveOrderId);
        }
        break;
      }

      default:
        console.log(`[STRIPE-WEBHOOK] Event type ${event.type} ignored.`);
    }
  } catch (err: any) {
    console.error(`[STRIPE-WEBHOOK] Exception during event processing:`, err.message);
    return new Response(JSON.stringify({ error: "Internal processing error" }), { status: 500 });
  }

  console.log(`[STRIPE-WEBHOOK] Request handled successfully.`);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

// --- FULFILLMENT Logic (Ported 1:1 from Next.js route.ts) ---
async function processSuccessfulSession(session: any, paymentRow: any, orderId: any) {
  const sessionId = session.id || paymentRow?.payment_id;

  if (!orderId) {
    console.error(`[STRIPE-WEBHOOK] Fatal Error: No order ID provided for session ${sessionId}.`);
    throw new Error("Missing order ID for fulfillment");
  }

  // 1. Fetch current order status to ensure idempotency
  // Cast orderId to Number to ensure DB match for integer column
  const targetOrderId = Number(orderId);
  const { data: order, error: orderFetchError } = await supabase
    .from("orders")
    .select("status, items_snapshot, coupon_code")
    .eq("id", targetOrderId)
    .single();

  if (orderFetchError || !order) {
    console.error(`[STRIPE-WEBHOOK] Order ${orderId} not found during fulfillment:`, orderFetchError);
    throw new Error("Order not found during fulfillment");
  }

  if (order.status === OrderStatus.CONFIRMED) {
    console.log(`[STRIPE-WEBHOOK] Order ${orderId} already confirmed. Skipping fulfillment.`);
    return;
  }

  console.log(`[STRIPE-WEBHOOK] Starting fulfillment task for order: ${orderId}...`);

  const details = paymentRow?.details || {};

  // SUPPORT STRUCTURED SNAPSHOT (Fixing the mapping error)
  const snapshot = order.items_snapshot as any;
  const cartSnapshot = Array.isArray(snapshot) ? snapshot : (snapshot?.items || details.cartSnapshot || []);

  // 🆔 RESTORE ADRESS PERSISTENCE (Extraction from Metadata + Fallbacks)
  const metadata = session.metadata || {};
  let shippingAddress = details.shippingAddress || {};
  let billingAddress = details.billingAddress || details.shippingAddress || {};

  try {
    if (metadata.shippingAddress) shippingAddress = JSON.parse(metadata.shippingAddress);
    if (metadata.billingAddress) billingAddress = JSON.parse(metadata.billingAddress);
  } catch (e) {
    console.warn("[STRIPE-WEBHOOK] Address parse failed, using fallback details");
  }

  const shippingAddressRow = normalizeAddress(shippingAddress);
  const billingAddressRow = normalizeAddress(billingAddress);

  // 2. Update Order Status to CONFIRMED
  const pi = (session.payment_intent as string) || session.id;
  console.log(`[STRIPE-WEBHOOK] Updating Order #${targetOrderId} to CONFIRMED...`);
  const { error: orderUpdateError } = await supabase.from("orders").update({
    status: OrderStatus.CONFIRMED,
    payment_intent_id: pi || null
  }).eq("id", targetOrderId);

  if (orderUpdateError) {
    console.error(`[STRIPE-WEBHOOK] Order status update FAILED for ${targetOrderId}:`, orderUpdateError.message);
  } else {
    console.log(`[STRIPE-WEBHOOK] Order #${targetOrderId} confirmed successfully.`);
  }

  // 3. Address Persistence Logic
  const saveAddress = async (addressData: any, addressType: AddressType) => {
    if (!addressData.street || !paymentRow?.user_id) return;

    // 🔍 SMART CHECK: Don't insert if address already exists for this user
    const { data: existingAddr } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", paymentRow.user_id)
      .eq("street", addressData.street)
      .eq("zip", addressData.zip)
      .maybeSingle();

    if (existingAddr) {
      console.log(`[STRIPE-WEBHOOK] Address already exists (ID: ${existingAddr.id}). Skipping insert.`);
      return;
    }

    const { error: addrErr } = await supabase
      .from("addresses")
      .insert({
        user_id: paymentRow.user_id,
        address_type: addressType,
        first_name: addressData.first_name,
        last_name: addressData.last_name,
        phone: addressData.phone,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        country: addressData.country,
        is_default: true,
        address_label: addressType === AddressType.SHIPPING ? "Home" : "Billing",
      });
    if (addrErr) console.warn(`[STRIPE-WEBHOOK] Address save warn: ${addrErr.message}`);
    else console.log(`[STRIPE-WEBHOOK] New address saved successfully for user: ${paymentRow.user_id}`);
  };

  await saveAddress(shippingAddressRow, AddressType.SHIPPING);
  await saveAddress(billingAddressRow, AddressType.BILLING);

  // 4. Create Order Items
  console.log(`[STRIPE-WEBHOOK] Creating order items for Order #${targetOrderId}...`);
  const orderItemsData = cartSnapshot.map((item: any) => ({
    order_id: targetOrderId,
    product_id: item.id,
    variant_id: item.variant_id ?? null,
    price: item.price,
    quantity: item.quantity,
    color: item.color,
  }));
  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsData);
  if (itemsError) {
    console.error(`[STRIPE-WEBHOOK] Order Items insert FAILED:`, itemsError.message);
  }

  // 5. Atomic Stock Update
  for (const item of cartSnapshot) {
    if (item.variant_id) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        v_id: item.variant_id,
        quantity: item.quantity
      });
      if (stockError) console.error(`[STRIPE-WEBHOOK] Stock RPC FAILED:`, stockError.message);
    }
  }

  // 6. Update Payment status
  const sessionCurrency = (session.currency || paymentRow?.currency || "usd").toLowerCase();
  const targetSessionId = session.id || paymentRow?.payment_id;

  if (targetSessionId) {
    console.log(`[STRIPE-WEBHOOK] Resolving success for Payment: ${targetSessionId}...`);
    const { error: payErr } = await supabase.from("payments").update({
      status: PaymentStatus.SUCCESS,
      order_id: targetOrderId,
      transaction_id: pi || null,
      currency: sessionCurrency,
      details: {
        ...(details || {}),
        webhook_event: "success_resolved",
        completed_at: new Date().toISOString()
      }
    }).eq("payment_id", targetSessionId);

    if (payErr) console.error(`[STRIPE-WEBHOOK] Payment update FAILED:`, payErr.message);
  }

  // 6.1 Increment coupon usage count after successful payment (if coupon was applied)
  const orderCouponCode = asText(order.coupon_code).toUpperCase();
  if (orderCouponCode) {
    console.log(`[STRIPE-WEBHOOK] Incrementing coupon usage for code: ${orderCouponCode}`);

    const { data: couponRow, error: couponFetchError } = await supabase
      .from("coupons")
      .select("code, usage_count")
      .eq("code", orderCouponCode)
      .maybeSingle();

    if (couponFetchError) {
      console.error(`[STRIPE-WEBHOOK] Coupon fetch FAILED:`, couponFetchError.message);
    } else if (!couponRow) {
      console.warn(`[STRIPE-WEBHOOK] Coupon not found for code: ${orderCouponCode}`);
    } else {
      const nextUsageCount = Number(couponRow.usage_count ?? 0) + 1;
      const { error: couponUpdateError } = await supabase
        .from("coupons")
        .update({ usage_count: nextUsageCount })
        .eq("code", orderCouponCode);

      if (couponUpdateError) {
        console.error(`[STRIPE-WEBHOOK] Coupon usage increment FAILED:`, couponUpdateError.message);
      } else {
        console.log(`[STRIPE-WEBHOOK] Coupon ${orderCouponCode} usage_count updated to ${nextUsageCount}`);
      }
    }
  }

  // 7. Clear Cart
  const targetUserId = paymentRow?.user_id || session.metadata?.userId;
  if (targetUserId) {
    console.log(`[STRIPE-WEBHOOK] Clearing Cart for user: ${targetUserId}`);
    const { error: cartError } = await supabase.from("cart").delete().eq("user_id", targetUserId);
    if (cartError) console.error(`[STRIPE-WEBHOOK] Cart clear FAILED:`, cartError.message);
  }

  console.log(`[STRIPE-WEBHOOK] Fulfillment processing complete.`);
}
