
type RefundEmailArgs = {
  toEmail: string;
  customerName: string;
  orderId: number;
  amount: number;
  status: "processed" | "rejected";
  adminNote?: string;
};

export async function sendRefundEmail(args: RefundEmailArgs) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_CONFIRMATION_TEMPLATE_ID; // Reusing the same template for simplicity or using a dedicated one if available
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.NEXT_PUBLIC_EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("Refund email skipped: EmailJS env vars are missing");
    return;
  }

  const isProcessed = args.status === "processed";
  const subject = isProcessed ? `Refund Processed for Order #${args.orderId}` : `Refund Request Rejected for Order #${args.orderId}`;
  
  const statusMessage = isProcessed 
    ? `Great news! Your refund of $${args.amount.toFixed(2)} for order #${args.orderId} has been successfully processed through Stripe.`
    : `We have reviewed your refund request for order #${args.orderId}. Unfortunately, it has been rejected at this time.`;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      email: args.toEmail,
      to_name: args.customerName || "Customer",
      order_id: String(args.orderId),
      website_link: process.env.NEXT_PUBLIC_SITE_URL || "https://3legant-ecommerce.vercel.app",
      message: `${statusMessage}${args.adminNote ? `\n\nNote from admin: ${args.adminNote}` : ""}\n\nThank you for shopping with us.`,
      subject: subject
    },
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error(`EmailJS refund email failed: ${details}`);
    // We don't throw here to avoid crashing the main refund process if just the email fails
  } else {
      console.log(`✅ Refund email sent successfully to ${args.toEmail} (${args.status})`);
  }
}
