"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { mapProducts } from "@/lib/supabase/productMapping";

export async function fetchPaginatedProducts(limit: number, offset: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
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
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching paginated products:", error);
    return [];
  }

  return mapProducts(data || []);
}
