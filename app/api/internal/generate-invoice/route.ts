import { NextResponse } from "next/server";
import { generateInvoiceForOrderWithRetry } from "@/lib/server/invoice-service";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const internalSecret = req.headers.get("x-internal-secret");
    const configuredSecret = process.env.INTERNAL_SECRET;

    // Security: Only allow requests with the correct internal secret
    if (!configuredSecret || internalSecret !== configuredSecret) {
      console.warn(`[INTERNAL API] Unauthorized access attempt for order ${orderId}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    console.log(`[INTERNAL API] Triggering invoice generation for order: ${orderId}`);
    
    // Perform the heavy React-PDF/Email logic here (Node.js native)
    await generateInvoiceForOrderWithRetry(Number(orderId), 3, 1500);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(`[INTERNAL API] Error generating invoice:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
