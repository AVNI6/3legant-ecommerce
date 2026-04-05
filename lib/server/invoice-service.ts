import { createClient } from "@supabase/supabase-js";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React from "react";
import InvoiceDocument, {
  type InvoiceAddress,
  type InvoiceItem,
  type InvoiceOrder,
} from "@/components/invoice/InvoiceDocument";
import { sendInvoiceEmail } from "@/lib/server/invoice-email";

type OrderRow = {
  id: number;
  user_id: string;
  order_date: string;
  total_price: number;
  shipping_address: Record<string, unknown> | null;
  invoice_url?: string | null;
  invoice_sent_at?: string | null;
  items_snapshot?: any[] | null;
};

type OrderItemRow = {
  quantity?: number;
  price?: number;
  color?: string;
  image?: string;
  products?: { name?: string; image?: string } | null;
  product_variant?: { color_images?: string[] | null } | null;
};

export class OrderNotFoundError extends Error {
  constructor(orderId: number) {
    super(`Order ${orderId} not found`);
    this.name = "OrderNotFoundError";
  }
}

const toText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const toAddress = (address: Record<string, unknown> | null | undefined): InvoiceAddress => ({
  firstName: toText(address?.firstName),
  lastName: toText(address?.lastName),
  phone: toText(address?.phone),
  street: toText(address?.street),
  city: toText(address?.city),
  state: toText(address?.state),
  zip: toText(address?.zip),
  country: toText(address?.country),
});

const resolveItemImage = (item: OrderItemRow) => {
  // 1. Check if image is already flattened in the row (e.g. from items_snapshot)
  if (item.image) return item.image;

  // 2. Check if we have variant-specific color images from the query
  const variantImages = item.product_variant?.color_images;
  if (Array.isArray(variantImages) && variantImages.length > 0) {
    return variantImages[0];
  }

  // 3. Fallback to base product image
  return item.products?.image || "";
};

const toInvoiceItems = (items: OrderItemRow[] | null | undefined): InvoiceItem[] =>
  (items || []).map((item, index) => ({
    name: item.products?.name || (item as any).name || `Item ${index + 1}`,
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
    color: item.color || "",
    image: resolveItemImage(item),
  }));

const getSupabaseServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase service credentials for invoice generation");
  }

  return createClient(url, key);
};

const uploadWithRetry = async (
  uploader: () => Promise<{ error: { message: string } | null }>,
  retries = 1
): Promise<void> => {
  const result = await uploader();
  if (!result.error) return;

  if (retries <= 0) {
    throw new Error(`Invoice upload failed: ${result.error.message}`);
  }

  await uploadWithRetry(uploader, retries - 1);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateInvoiceForOrder(orderId: number): Promise<{ invoiceUrl: string }> {
  if (!Number.isFinite(orderId) || orderId <= 0) {
    throw new Error("Invalid order id");
  }

  const supabase = getSupabaseServiceClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
        id,
        user_id,
        order_date,
        total_price,
        shipping_address,
        invoice_url,
        invoice_sent_at,
        items_snapshot
      `
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new OrderNotFoundError(orderId);
  }

  const typedOrder = order as unknown as OrderRow;

  if (typedOrder.invoice_url) {
    return { invoiceUrl: typedOrder.invoice_url };
  }

  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select(
      `
        quantity,
        price,
        color,
        products (name, image),
        product_variant (color_images)
      `
    )
    .eq("order_id", orderId);

  if (orderItemsError) {
    console.warn("Generate invoice: order_items lookup failed", {
      orderId,
      message: orderItemsError.message,
    });
  }

  const customerNameFromShipping = [
    toText(typedOrder.shipping_address?.firstName),
    toText(typedOrder.shipping_address?.lastName),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const customerName = customerNameFromShipping || "Valued Customer";

  const snapshot = typedOrder.items_snapshot as any;
  const itemsFromSnapshot = Array.isArray(snapshot) ? snapshot : (snapshot?.items || []);

  const invoiceOrder: InvoiceOrder = {
    id: typedOrder.id,
    customer_name: customerName,
    order_date: typedOrder.order_date,
    shipping_address: toAddress(typedOrder.shipping_address),
    items: toInvoiceItems((itemsFromSnapshot.length > 0 ? itemsFromSnapshot : orderItems || []) as OrderItemRow[]),
    total_price: Number(typedOrder.total_price || 0),
  };

  const invoiceElement = React.createElement(InvoiceDocument, {
    order: invoiceOrder,
  }) as unknown as React.ReactElement<DocumentProps>;

  const pdfBuffer = await renderToBuffer(invoiceElement);
  const filePath = `orders/${typedOrder.id}/invoice-${typedOrder.id}.pdf`;

  await uploadWithRetry(() =>
    supabase.storage.from("invoices").upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "31536000",
    })
  );

  const { data: publicUrlData } = supabase.storage.from("invoices").getPublicUrl(filePath);
  const invoiceUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      invoice_url: invoiceUrl,
      invoice_sent_at: new Date().toISOString(),
    })
    .eq("id", typedOrder.id);

  if (updateError) {
    throw new Error("Failed to update order invoice details");
  }

  const toEmail = toText(typedOrder.shipping_address?.email);
  if (toEmail) {
    const subtotal = invoiceOrder.items?.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0) || 0;
    const shipping = Math.max(0, (invoiceOrder.total_price || 0) - subtotal);

    void sendInvoiceEmail({
      toEmail,
      customerName,
      orderId: typedOrder.id,
      total: Number(typedOrder.total_price || 0),
      shipping,
      invoiceUrl,
      items: invoiceOrder.items || [],
    }).catch((error) => {
      console.warn("Invoice email failed:", error);
    });
  }

  return { invoiceUrl };
}

export async function generateInvoiceForOrderWithRetry(
  orderId: number,
  attempts = 4,
  delayMs = 1200
): Promise<{ invoiceUrl: string }> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i += 1) {
    try {
      return await generateInvoiceForOrder(orderId);
    } catch (error) {
      lastError = error;

      const shouldRetry = error instanceof OrderNotFoundError;
      const hasNextAttempt = i < attempts - 1;

      if (!shouldRetry || !hasNextAttempt) {
        throw error;
      }

      await sleep(delayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Invoice generation failed");
}
