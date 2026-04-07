import { NextRequest, NextResponse } from "next/server";
import { publicSupabase } from "@/lib/supabase/public";
import { mapProductFeedRows } from "@/lib/supabase/productFeed";

const PRICE_RANGE_VALUES = ["0-99", "100-199", "200-299", "300-399", "400+"] as const;

const matchesAnyPriceRange = (price: number, ranges: string[]) => {
  if (ranges.includes("all")) return true;
  if (ranges.length === 0) return false;

  return ranges.some((range) => {
    if (range === "0-99") return price >= 0 && price <= 99;
    if (range === "100-199") return price >= 100 && price <= 199;
    if (range === "200-299") return price >= 200 && price <= 299;
    if (range === "300-399") return price >= 300 && price <= 399;
    if (range === "400+") return price >= 400;
    return false;
  });
};

const normalizeSelectedPrice = (ranges: string[]) => {
  if (ranges.includes("all")) {
    return ["all", ...PRICE_RANGE_VALUES];
  }

  const validRanges = ranges.filter((range) => PRICE_RANGE_VALUES.includes(range as any));
  if (validRanges.length === 0) {
    return [];
  }

  if (validRanges.length === PRICE_RANGE_VALUES.length) {
    return ["all", ...PRICE_RANGE_VALUES];
  }

  return validRanges;
};

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const category = params.get("category") || "All Rooms";
    const sort = params.get("sort") || "default";
    const offset = Number(params.get("offset") || 0);
    const limit = Math.max(1, Math.min(50, Number(params.get("limit") || 12)));
    const rangesParam = params.get("ranges") || "all";
    const selectedRanges = normalizeSelectedPrice(
      rangesParam
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );

    let query = publicSupabase
      .from("product_variant")
      .select(
        `
          id, color, price, old_price, stock, thumbnails, color_images,
          products!inner (
            id, name, category, image, measurements, is_new, created_at, description, is_deleted, validation_till
          )
        `
      )
      .eq("products.is_deleted", false);

    if (category !== "All Rooms") {
      query = query.eq("products.category", category);
    }

    if (sort === "newest") {
      query = query.order("created_at", { foreignTable: "products", ascending: false });
    } else {
      query = query.order("id", { ascending: false });
    }

    const { data: variantsData, error: variantError } = await query;
    if (variantError) throw variantError;

    const rows = variantsData || [];
    const productIds = Array.from(new Set(rows.map((v: any) => v.products?.id).filter(Boolean)));

    const { data: reviewsData, error: reviewsError } = productIds.length > 0
      ? await publicSupabase
          .from("reviews")
          .select("product_id, rating")
          .in("product_id", productIds)
      : { data: [], error: null };

    if (reviewsError) {
      throw reviewsError;
    }

    const mappedItems = mapProductFeedRows(rows as any[], (reviewsData || []) as any[]);
    let filteredItems = mappedItems.filter((item: any) => matchesAnyPriceRange(Number(item.price), selectedRanges));

    if (sort === "low") {
      filteredItems = filteredItems.slice().sort((a: any, b: any) => Number(a.price) - Number(b.price));
    }

    if (sort === "high") {
      filteredItems = filteredItems.slice().sort((a: any, b: any) => Number(b.price) - Number(a.price));
    }

    const pagedItems = filteredItems.slice(offset, offset + limit);
    const nextOffset = offset + pagedItems.length;
    const hasMoreInDB = nextOffset < filteredItems.length;

    return NextResponse.json({
      items: pagedItems,
      sourceOffset: nextOffset,
      hasMoreInDB,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        items: [],
        sourceOffset: 0,
        hasMoreInDB: false,
        error: error?.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
