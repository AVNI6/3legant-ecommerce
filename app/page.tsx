import HomeSection from "@/sections/home/homeSection";
import HomeFeatures from "@/sections/home/homeFeatures";
import NewArrival from "@/sections/home/newArrival";
import Features from "@/components/features";
import Hundreds from "@/sections/home/hundreds";
import Newsletter from "@/sections/home/newsletter";
import ArticlePage from "@/sections/home/articlepage";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { slides } from "@/constants/Data";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch all active banners
  const { data: banners, error: bannerError } = await supabase
    .from("banners")
    .select("id, image_url, title, subtitle, link_url, category, key, position")
    .eq("is_active", true)
    .order("position");

  if (bannerError) {
    console.error("Banner fetch error:", bannerError.message);
  }

  const heroBanners = banners?.filter(b => b.category?.toLowerCase().includes("hero")) || [];
  const dynamicHeroBanners = heroBanners.length > 0 ? [...heroBanners] : [...slides];

  const hundredsBanner = banners?.find(b => b.key === "home_hundreds");

  // Fetch New Arrivals (Newest 8 products)
  const { data: rawProducts } = await supabase
    .from("products")
    .select(`
      id, name, category, image, measurements, package, is_new, validation_till, description, created_at,
      product_variant (
        id, color, price, old_price, stock, thumbnails, color_images
      )
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(8);

  const { mapProducts } = await import("@/store/slices/productSlice");
  const initialProducts = mapProducts(rawProducts || []);

  return (
    <main>
      <HomeSection initialBanners={dynamicHeroBanners} />
      <HomeFeatures />
      <NewArrival initialProducts={initialProducts} />
      <Features />
      <Hundreds initialBanner={hundredsBanner} />
      <ArticlePage />
      <Newsletter />
    </main>
  );
}

