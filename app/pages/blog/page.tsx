import BlogCards from "@/sections/blog/BlogCards";
import Newsletter from "@/sections/home/newsletter";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function BlogPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: articles, error, count } = await supabase
        .from("blogs")
        .select("id, title, slug, author_name, author_image, category, status, created_at, cover_image", { count: "exact" })
        .ilike("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

    if (error) {
        console.error("Error fetching blogs on server:", error);
    }

    const { data: blogBanner } = await supabase
        .from("banners")
        .select("id, image_url, title, subtitle, link_url, category, key")
        .eq("key", "blog_banner")
        .eq("is_active", true)
        .maybeSingle();

    const bannerImg = blogBanner?.image_url || "/blog/bloghome.png";
    const bannerTitle = blogBanner?.title || "Our Blog";
    const bannerSubtitle = blogBanner?.subtitle || "Home ideas and design inspiration";

    return (
        <div className="w-full">
            <div className="mb-10">
                <div className="relative w-full h-[392px] mb-10">
                    <Image
                        src={bannerImg}
                        alt="Banner"
                        fill
                        className="object-cover w-full h-full  px-4 sm:px-10 lg:px-30"
                        priority
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-3">
                        <p className="text-sm md:text-base mb-2"><span className="text-[#605F5F]"><Link href={'/'}>Home</Link></span> &gt; &nbsp; blog</p>
                        <h1 className="text-[54px] font-semibold mb-2">{bannerTitle}</h1>
                        <h3 className="text-sm md:text-lg">
                            {bannerSubtitle}
                        </h3>
                    </div>
                </div>
                <section className="px-4 sm:px-12 md:px-10 lg:px-30">
                    <BlogCards initialArticles={articles || []} totalCount={count || 0} />
                </section>
            </div>
            <Newsletter />
        </div>
    );
}