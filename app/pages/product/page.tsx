import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import ProductPageContent from "./ProductPageContent";
import { mapProducts } from "@/store/slices/productSlice";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default async function ProductPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch products on the server - Optimized field selection
  const { data: initialProducts, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      category,
      image,
      measurements,
      is_new,
      created_at,
      product_variant (
        id,
        color,
        price,
        old_price,
        stock,
        thumbnails
      )
    `)
    .eq("is_deleted", false)
    .order('created_at', { ascending: false })
    .limit(50); // Reduced limit for faster initial load

  if (error) {
    console.error("Error fetching products on server:", error);
  }

  const mappedProducts = mapProducts(initialProducts || []);

  return (
    <div className="pb-7">
      <Suspense fallback={<div className="container mx-auto px-4"><ProductGridSkeleton count={8} /></div>}>
        <ProductPageContent initialProducts={mappedProducts} />
      </Suspense>
    </div>
  );
}