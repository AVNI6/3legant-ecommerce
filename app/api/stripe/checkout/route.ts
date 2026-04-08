import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { OrderStatus, PaymentStatus } from "@/types/enums";

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const getSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseKey) {
    throw new Error("Missing Supabase key for checkout route");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey);
};

// Authenticated client using the user's JWT — satisfies RLS auth.uid() checks
const getAuthenticatedSupabaseClient = (accessToken: string) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!anonKey) throw new Error("Missing Supabase anon key");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
};

type CheckoutItem = {
  productId: number;
  variantId: number;
  quantity: number;
};

type CartSnapshotItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  image: string;
};

type CheckoutAddress = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type CheckoutRequestBody = {
  items: CheckoutItem[];
  cartSnapshot?: CartSnapshotItem[];
  successUrl: string;
  cancelUrl: string;
  paymentMethod?: "card" | "upi";
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  country?: string;
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  couponCode?: string;
  shippingMethod?: string;
  metadata?: Record<string, string>;
  details?: {
    cartSnapshot?: CartSnapshotItem[];
  };
};

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get("Authorization") ?? "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const authedSupabase = accessToken ? getAuthenticatedSupabaseClient(accessToken) : supabase;
    const body = (await request.json()) as CheckoutRequestBody;
    const {
      items,
      cartSnapshot,
      successUrl,
      cancelUrl,
      paymentMethod = "card",
      shippingAmount = 0,
      discountAmount = 0,
      totalAmount,
      country,
      shippingAddress,
      billingAddress,
      couponCode,
      shippingMethod,
      metadata,
      details,
    } = body;

    const rawSnapshot = cartSnapshot ?? details?.cartSnapshot ?? [];
    // Normalize snapshot to ensure variant_id (snake_case) is always present for the webhook
    const resolvedCartSnapshot = rawSnapshot.map((item: any) => ({
      ...item,
      variant_id: item.variant_id || item.variantId || null
    }));

    const orderSnapshot = {
      items: resolvedCartSnapshot,
      shipping_method: shippingMethod,
      shipping_cost: shippingAmount,
      shipping_address: shippingAddress || {},
      billing_address: billingAddress || null,
    };

    if (!items || items.length === 0 || !successUrl || !cancelUrl || !resolvedCartSnapshot.length) {
      return NextResponse.json({ error: "Missing checkout payload" }, { status: 400 });
    }

    if (!metadata?.userId) {
      return NextResponse.json({ error: "Missing user context" }, { status: 400 });
    }

    if (paymentMethod === "upi" && country?.toLowerCase() !== "india") {
      return NextResponse.json(
        { error: "UPI is supported only for India checkout addresses." },
        { status: 400 }
      );
    }

    const currency = paymentMethod === "upi" ? "inr" : "usd";

    // Get price from product_variant (price lives there, not on products)
    const { data: variants, error: variantsError } = await supabase
      .from("product_variant")
      .select("id, product_id, price, old_price, color_images, products(name, validation_till, image)")
      .in(
        "id",
        items.map((i) => i.variantId)
      );

    if (variantsError) {
      console.error("Supabase variants error:", variantsError);
      return NextResponse.json(
        { error: "Database error fetching variant prices" },
        { status: 500 }
      );
    }

    if (!variants || variants.length === 0) {
      return NextResponse.json(
        { error: "Product variants not found" },
        { status: 400 }
      );
    }

    const expandedUnitEntries: Array<{ name: string; amount: number; image?: string }> = [];

    items.forEach((item) => {
      const variant = variants.find((v) => v.id === item.variantId);

      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found`);
      }

      const productName = (variant.products as any)?.name ?? `Product #${item.productId}`;

      // Calculate effective price server-side using the same rules as UI pricing.
      const basePrice = Number(variant.price ?? 0);
      const oldPrice = Number(variant.old_price ?? 0);
      const validationTill = (variant.products as any)?.validation_till;

      const hasPotentialDiscount = oldPrice > basePrice && basePrice > 0;
      let isOfferExpired = false;

      if (validationTill && validationTill !== "" && validationTill !== "null") {
        let cleanDate = validationTill;

        const dmyMatch = String(validationTill).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (dmyMatch) {
          const [, d, m, y] = dmyMatch;
          cleanDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }

        const offerEndTs = new Date(cleanDate).getTime();
        if (Number.isFinite(offerEndTs)) {
          isOfferExpired = offerEndTs <= Date.now();
        }
      }

      const effectivePrice = hasPotentialDiscount
        ? (isOfferExpired ? oldPrice : basePrice)
        : (oldPrice || basePrice);

      const unitAmount = Math.round(effectivePrice * 100);

      // Resolve Image: Use variant specific image if available, fallback to product image
      const imageUrl = (Array.isArray(variant.color_images) && variant.color_images.length > 0)
        ? variant.color_images[0]
        : (variant.products as any)?.image;

      // Extract color from snapshot for the label
      const snapshotItem = resolvedCartSnapshot.find((s: any) => (s.variant_id || s.variantId) === item.variantId);
      const colorLabel = snapshotItem?.color ? ` - ${snapshotItem.color}` : "";

      for (let index = 0; index < item.quantity; index += 1) {
        expandedUnitEntries.push({
          name: `${productName}${colorLabel}`,
          amount: unitAmount,
          image: imageUrl || undefined,
        });
      }
    });

    const baseSubtotal = expandedUnitEntries.reduce((sum, item) => sum + item.amount, 0);
    let effectiveDiscountMinor = Math.max(0, Math.round(discountAmount * 100));

    if (couponCode) {
      const { data: alreadyUsedOrders, error: alreadyUsedError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", metadata.userId)
        .eq("coupon_code", couponCode.toUpperCase())
        .in("status", [
          OrderStatus.CONFIRMED,
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
        ])
        .limit(1);

      if (alreadyUsedError) {
        return NextResponse.json({ error: "Failed to validate coupon history" }, { status: 500 });
      }

      if (alreadyUsedOrders && alreadyUsedOrders.length > 0) {
        return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
      }

      const { data: couponRow, error: couponError } = await supabase
        .from("coupons")
        .select("code, active, discount_type, discount_value, min_order, expires_at, usage_limit, usage_count")
        .eq("code", couponCode.toUpperCase())
        .maybeSingle();

      if (couponError || !couponRow) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      if (!couponRow.active) {
        return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 });
      }

      if (couponRow.expires_at && new Date(couponRow.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ error: "Coupon got expired" }, { status: 400 });
      }

      if (
        couponRow.usage_limit !== null &&
        Number(couponRow.usage_count ?? 0) >= Number(couponRow.usage_limit)
      ) {
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
      }

      if (baseSubtotal / 100 < Number(couponRow.min_order ?? 0)) {
        return NextResponse.json(
          { error: `Coupon requires minimum order of ${couponRow.min_order}` },
          { status: 400 }
        );
      }

      if (couponRow.discount_type === "percentage") {
        effectiveDiscountMinor = Math.max(
          0,
          Math.round(baseSubtotal * (Number(couponRow.discount_value) / 100))
        );
      } else if (couponRow.discount_type === "fixed") {
        effectiveDiscountMinor = Math.max(0, Math.round(Number(couponRow.discount_value) * 100));
      }
    }

    const discountInMinorUnit = Math.min(effectiveDiscountMinor, baseSubtotal);
    const shippingInMinorUnit = Math.max(0, Math.round(shippingAmount * 100));

    const distributedDiscounts = expandedUnitEntries.map((item) =>
      Math.min(item.amount, Math.floor((discountInMinorUnit * item.amount) / Math.max(baseSubtotal, 1)))
    );

    let allocatedDiscount = distributedDiscounts.reduce((sum, item) => sum + item, 0);
    let discountRemainder = Math.min(discountInMinorUnit, baseSubtotal) - allocatedDiscount;

    for (let index = 0; index < expandedUnitEntries.length && discountRemainder > 0; index += 1) {
      const remainingCapacity = expandedUnitEntries[index].amount - distributedDiscounts[index];

      if (remainingCapacity > 0) {
        distributedDiscounts[index] += 1;
        discountRemainder -= 1;
      }
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = expandedUnitEntries.map((item, index) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.max(0, item.amount - distributedDiscounts[index]),
      },
      quantity: 1,
    }));

    if (shippingInMinorUnit > 0) {
      line_items.push({
        price_data: {
          currency,
          product_data: {
            name: "Shipping",
          },
          unit_amount: shippingInMinorUnit,
        },
        quantity: 1,
      });
    }

    const stripeTotal = line_items.reduce(
      (sum, lineItem) => sum + ((lineItem.price_data?.unit_amount || 0) * (lineItem.quantity || 0)),
      0
    );

    if (stripeTotal <= 0) {
      return NextResponse.json(
        { error: "Payable amount must be greater than zero after discounts." },
        { status: 400 }
      );
    }

    // Stripe requires at least ~USD 0.50 equivalent. For INR this is roughly Rs 50.
    // stripeTotal is in minor units, so Rs 50 == 5000 paise.
    if (paymentMethod === "upi" && stripeTotal < 5000) {
      return NextResponse.json(
        { error: "UPI checkout requires a minimum payable amount of Rs 50. Please increase cart total or reduce discount." },
        { status: 400 }
      );
    }

    if (typeof totalAmount === "number") {
      const expectedTotal = Math.max(0, Math.round(totalAmount * 100));

      if (stripeTotal !== expectedTotal) {
        return NextResponse.json(
          { error: "Stripe total mismatch with discounted checkout amount." },
          { status: 400 }
        );
      }
    }

    const paymentMethodTypes = (
      paymentMethod === "upi" ? ["upi"] : ["card"]
    ) as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

    // 1. Check for an existing PENDING order for this user to avoid duplications
    const { data: existingOrder } = await authedSupabase
      .from("orders")
      .select("id")
      .eq("user_id", metadata.userId)
      .eq("status", OrderStatus.PENDING)
      .order("order_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    let orderId: number;
    const finalTotalPrice = typeof totalAmount === "number" ? totalAmount : stripeTotal / 100;

    if (existingOrder) {
      // Reuse the existing order ID
      orderId = existingOrder.id;
      console.log(`[CHECKOUT] Reusing existing PENDING order: ${orderId}`);

      const { error: orderUpdateError } = await authedSupabase
        .from("orders")
        .update({
          total_price: finalTotalPrice,
          items_snapshot: orderSnapshot,
          shipping_address: shippingAddress || {},
          billing_address: billingAddress || null,
          payment_method: paymentMethod,
          order_date: new Date().toISOString(),
          coupon_code: couponCode || null,
          discount_amount: discountAmount || 0,
        })
        .eq("id", orderId);

      if (orderUpdateError) {
        console.error("Failed to update existing order:", orderUpdateError);
        return NextResponse.json({ error: "Failed to update pending order" }, { status: 500 });
      }
    } else {
      // Create a brand new PENDING order
      const { data: orderRow, error: orderInsertError } = await authedSupabase
        .from("orders")
        .insert({
          user_id: metadata.userId,
          total_price: finalTotalPrice,
          status: OrderStatus.PENDING,
          items_snapshot: orderSnapshot,
          shipping_address: shippingAddress || {},
          billing_address: billingAddress || null,
          payment_method: paymentMethod,
          order_date: new Date().toISOString(),
          coupon_code: couponCode || null,
          discount_amount: discountAmount || 0,
        })
        .select("id")
        .single();

      if (orderInsertError || !orderRow) {
        console.error("Failed to create pending order:", orderInsertError);
        return NextResponse.json({ error: "Failed to initialize order tracking" }, { status: 500 });
      }
      orderId = orderRow.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: paymentMethodTypes,
      line_items,
      success_url: successUrl,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
      cancel_url: cancelUrl,
      payment_intent_data: {
        metadata: {
          orderId: String(orderId),
          userId: metadata.userId,
        },
      },
      metadata: {
        ...metadata,
        orderId: String(orderId),
        country: country || "",
        couponCode: couponCode || "",
      },
    });

    // Clean up any old PENDING payments to avoid confusion
    // (We keep the orderId stable now, so we just expire previous session records)
    await authedSupabase
      .from("payments")
      .update({ status: PaymentStatus.EXPIRED })
      .eq("user_id", metadata.userId)
      .eq("status", PaymentStatus.PENDING)
      .neq("payment_id", session.id);

    const { error: paymentInsertError } = await authedSupabase.from("payments").insert({
      payment_id: session.id,
      order_id: orderId, // Link to the order we just created
      transaction_id: (session.payment_intent as string) || null,
      method: paymentMethod,
      status: PaymentStatus.PENDING,
      user_id: metadata.userId,
      amount: stripeTotal / 100,
      currency: currency,
      details: {
        items,
        cartSnapshot: resolvedCartSnapshot,
        shippingAmount,
        discountAmount,
        totalAmount: typeof totalAmount === "number" ? totalAmount : stripeTotal / 100,
        country,
        shippingAddress,
        billingAddress,
        couponCode,
        shippingMethod,
        orderSnapshot,
      },
    });

    if (paymentInsertError) {
      console.error("Failed to create payment record:", paymentInsertError);
      // Since order is already pending, we just log this but the webhook can still work if it finds by metadata
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Stripe checkout failed";

    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      message.toLowerCase().includes("upi")
    ) {
      return NextResponse.json(
        { error: "UPI is not enabled in your Stripe account. Enable it in Stripe Dashboard > Payment methods." },
        { status: 400 }
      );
    }

    if (message.toLowerCase().includes("upi")) {
      return NextResponse.json(
        { error: `UPI checkout failed: ${message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Stripe checkout failed: ${message}` },
      { status: 500 }
    );
  }
}
