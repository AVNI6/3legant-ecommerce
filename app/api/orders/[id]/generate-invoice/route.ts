import { NextResponse } from "next/server";
import {
  generateInvoiceForOrder,
  OrderNotFoundError,
} from "@/lib/server/invoice-service";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const orderId = Number(id);

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const { invoiceUrl } = await generateInvoiceForOrder(orderId);

    return NextResponse.json({ invoice_url: invoiceUrl });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.error("Generate invoice error:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
