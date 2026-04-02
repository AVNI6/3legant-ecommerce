"use client";

import BlackShopButton from "@/components/blackbutton";
import { BlogCardSkeleton } from "@/components/ui/skeleton";
import { APP_ROUTE } from "@/constants/AppRoutes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type HomeArticle = {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  cover_image: string | null;
};

const cardWrapper = "snap-start flex-shrink-0 w-[75%] max-[353px]:w-[85%] sm:w-[60%] md:w-[45%] lg:w-[30%]";

const imageWrapper = "relative w-full overflow-hidden h-[200px] max-[353px]:h-[160px] sm:h-[240px] md:h-[260px] lg:h-[280px]";

const titleStyle = "font-poppins font-semibold uppercase line-clamp-2 text-[14px] leading-[20px] max-[353px]:text-[13px] max-[353px]:leading-[18px] sm:text-[16px] sm:leading-[22px] md:text-[18px] md:leading-[24px] lg:text-[20px] lg:leading-[28px]";

const dateStyle = "text-[#6C7275] mt-1 sm:mt-2 text-[11px] max-[353px]:text-[10px] sm:text-[12px] md:text-[13px] lg:text-[14px]";

const buttonStyle =
  "font-medium text-[12px] max-[353px]:text-[11px] sm:text-[14px] md:text-[15px] lg:text-[16px]";
const ArticlePage = ({ title = "Articles", showButton = true }: { title?: string, showButton?: boolean }) => {
  const [displayArticles, setDisplayArticles] = useState<HomeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadArticles = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blogs")
        .select("id, title, slug, created_at, cover_image")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);

      if (isMounted) {
        setDisplayArticles((data as HomeArticle[]) || []);
        setLoading(false);
      }
    };

    void loadArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="px-4 sm:px-12 md:px-10 lg:px-30 overflow-x-hidden">
      <div className="my-5 md:my-10 gap-1 flex items-center justify-between">
        <h1 className="font-poppins font-medium text-xl min-[320px]:text-3xl sm:text-[40px] sm:leading-[44px] tracking-[-0.4px]">{title}</h1>

        {showButton && (
          <BlackShopButton
            className="text-[11px] sm:text-[18px] "
            content="More Articles"
            href={APP_ROUTE.blog}
          />
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:flex sm:overflow-x-auto sm:pb-2 md:flex md:overflow-x-auto lg:grid lg:grid-cols-3 lg:overflow-visible">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="sm:min-w-[320px] md:min-w-[340px] lg:min-w-0">
              <BlogCardSkeleton gridType="three" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 sm:gap-6 justify-between sm:px-0">
            {displayArticles.map((data, i) => {
              const slug = data.slug;
              const displayImage = data.cover_image || "/placeholder.png";
              const displayDate = new Date(data.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={data.id || i} className={cardWrapper}>
                  <Link href={`${APP_ROUTE.blog}/${slug}`}>
                    <div className={imageWrapper}>
                      <img
                        src={displayImage}
                        alt={data.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="pt-3 sm:pt-4">
                    <h2 className={titleStyle}>{data.title}</h2>

                    <p className={dateStyle}>{displayDate}</p>

                    {showButton && (
                      <div className="mt-2 sm:mt-3">
                        <BlackShopButton
                          className={buttonStyle}
                          content="Read more"
                          href={`${APP_ROUTE.blog}/${slug}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ArticlePage;
