import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status") || "all";

    const supabase = createAdminClient();
    
    let query = supabase
      .from("reviews")
      .select("*, products(name, image)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status !== "all") {
      query = query.ilike("status", status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // Map products to ensure it matches the hook's expected format
    const mapped = (data || []).map((r: any) => ({
      ...r,
      products: Array.isArray(r.products) ? r.products[0] : (r.products || r.product || null)
    }));

    return NextResponse.json({ data: mapped, count: count || 0 });
  } catch (err: any) {
    console.error("Admin Review Fetch Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function PATCH(req: Request) {
  try {
    const { reviewId, status } = await req.json();
    
    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // 1. Fetch product_id to revalidate cache
    const { data: review } = await supabase
      .from("reviews")
      .select("product_id")
      .eq("id", reviewId)
      .single();

    // 2. Update status
    const { error } = await supabase
      .from("reviews")
      .update({ status })
      .eq("id", reviewId);

    if (error) throw error;

    // 3. Revalidate the product page if we have the product_id
    if (review?.product_id) {
      revalidatePath(`/pages/product/${review.product_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin Review Update Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch product_id for cache clearing
    const { data: review } = await supabase
      .from("reviews")
      .select("product_id")
      .eq("id", reviewId)
      .single();

    // 2. Delete
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;

    // 3. Revalidate
    if (review?.product_id) {
      revalidatePath(`/pages/product/${review.product_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin Review Delete Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
