import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import ProductPageContent from "@/app/pages/product/ProductPageContent";

export default async function ProductPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: initialProducts } = await supabase
    .from("products")
    .select(`
      *,
      product_variant (*)
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <ProductPageContent initialProducts={initialProducts || []} />
  );
}