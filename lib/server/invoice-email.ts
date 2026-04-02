import { type InvoiceItem } from "@/components/invoice/InvoiceDocument";

type InvoiceEmailArgs = {
  toEmail: string;
  customerName: string;
  orderId: number;
  total: number;
  shipping: number;
  invoiceUrl: string;
  items: InvoiceItem[];
};

const toAmount = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);

export async function sendInvoiceEmail(args: InvoiceEmailArgs) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_CONFIRMATION_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.NEXT_PUBLIC_EMAILJS_PRIVATE_KEY; // Only available on server

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("Invoice email skipped: EmailJS env vars are missing");
    return;
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey, // Required for Strict Mode
    template_params: {
      email: args.toEmail,
      to_name: args.customerName || "Customer",
      order_id: String(args.orderId),
      website_link: process.env.NEXT_PUBLIC_SITE_URL || "https://3legant-ecommerce.vercel.app",
      invoice_url: args.invoiceUrl,
      orders: args.items.map((item) => ({
        name: item.name,
        units: item.quantity,
        price: (item.price || 0).toFixed(2),
        color: item.color,
        image_url: item.image || "",
      })),
      cost: {
        shipping: args.shipping.toFixed(2),
        tax: "0.00",
        total: args.total.toFixed(2),
      },
      message: `Your order #${args.orderId} was confirmed. Invoice: ${args.invoiceUrl}`,
    },
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`EmailJS invoice email failed: ${details}`);
  }
}
