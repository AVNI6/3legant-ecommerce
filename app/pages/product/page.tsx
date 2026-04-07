import { Suspense } from "react";
import ProductPageContent from "./ProductPageContent";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { publicSupabase } from "@/lib/supabase/public";
import { mapProductFeedRows } from "@/lib/supabase/productFeed";

export const revalidate = 60;

export default async function ProductPage() {
  const { data: variantsData } = await publicSupabase
    .from("product_variant")
    .select(`
      id, color, price, old_price, stock, thumbnails, color_images,
      products!inner (
        id, name, category, image, measurements, is_new, created_at, description, is_deleted, validation_till
      )
    `)
    .eq("products.is_deleted", false)
    .order("id", { ascending: false })
    .range(0, 11);

  const productIds = Array.from(new Set((variantsData ?? []).map((variant: any) => variant.products?.id).filter(Boolean)));

  const { data: reviewsData } = productIds.length > 0
    ? await publicSupabase
      .from("reviews")
      .select("product_id, rating")
      .in("product_id", productIds)
    : { data: [] };

  const initialItems = mapProductFeedRows((variantsData ?? []) as any[], (reviewsData ?? []) as any[]);

  return (
    <div className="pb-7">
      <Suspense fallback={<div className="container mx-auto px-4"><ProductGridSkeleton count={8} /></div>}>
        <ProductPageContent initialItems={initialItems} />
      </Suspense>
    </div>
  );
}