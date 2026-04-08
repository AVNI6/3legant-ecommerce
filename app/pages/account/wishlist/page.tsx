import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "@/constants/AppRoutes";
import WishlistContent from "./WishlistContent";
import { getEffectivePrice } from "@/constants/Data";
import { resolveVariantColor, resolveVariantImage } from "@/lib/utils/variantUtils";
import { CartItem } from "@/types";

export default async function WishlistPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(APP_ROUTE.signin);
  }

  const currentPage = parseInt(sp.page || "1", 10);
  const pageSize = 10;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from("wishlist")
    .select(`
      variant_id,
      product_variant (
        id, color, color_images, price, old_price, thumbnails,
        products (id, name, image, validation_till)
      )
    `, { count: "exact" })
    .eq("user_id", user.id)
    .range(from, to);

  const initialItems = (data ?? []).map((item: any) => {
    const variant = item.product_variant;
    const product = variant?.products;
    if (!variant || !product) return null;

    const { price: effectivePrice } = getEffectivePrice({
      price: Number(variant.price ?? 0),
      old_price: Number(variant.old_price ?? 0),
      validationTill: String(product.validation_till ?? "")
    });

    return {
      id: Number(product.id),
      variant_id: Number(variant.id),
      name: String(product.name),
      color: resolveVariantColor(variant.color),
      price: effectivePrice,
      image: resolveVariantImage(variant, product),
      quantity: 1,
    } as CartItem;
  }).filter(Boolean) as CartItem[];

  return (
    <WishlistContent
      initialItems={initialItems}
      initialTotalCount={count || 0}
      initialPage={currentPage}
    />
  );
}