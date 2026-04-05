import HomeSection from "@/sections/home/homeSection";
import HomeFeatures from "@/sections/home/homeFeatures";
import NewArrival from "@/sections/home/newArrival";
import Features from "@/components/features";
import Hundreds from "@/sections/home/hundreds";
import Newsletter from "@/sections/home/newsletter";
import ArticlePage from "@/sections/home/articlepage";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { mapProducts } from "@/lib/supabase/productMapping";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const isoDate = sevenDaysAgo.toISOString();

  const [articlesRes, productsRes] = await Promise.all([
    supabase
      .from("blogs")
      .select("id, title, slug, created_at, cover_image")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("products")
      .select(`
        id, name, category, image, measurements, package, is_new, validation_till, description, created_at,
        product_variant (
          id, color, price, old_price, stock, thumbnails, color_images
        )
      `)
      .eq("is_deleted", false)
      .gte("created_at", isoDate)
      .order("created_at", { ascending: false })
      .limit(6)
  ]);

  const initialArticles = articlesRes.data || [];
  const initialProducts = mapProducts(productsRes.data || []);

  return (
    <main>
      <HomeSection />
      <HomeFeatures />
      <NewArrival initialProducts={initialProducts} />
      <Features />
      <Hundreds />
      <ArticlePage initialArticles={initialArticles} />
      <Newsletter />
    </main>
  );
}

