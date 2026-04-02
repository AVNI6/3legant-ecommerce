import { APP_ROUTE } from "@/constants/AppRoutes"
import Link from "next/link"
import { notFound } from "next/navigation"
import Newsletter from "@/sections/home/newsletter"
import { RiAccountCircleLine } from "react-icons/ri";
import ArticlePage from "@/sections/home/articlepage"
import { HiOutlineCalendar } from "react-icons/hi2"
import { supabase } from "@/lib/supabase/client"
import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from "next/image"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogDetail({ params }: PageProps) {
  const { slug } = await params

  const { data: article, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !article) return notFound()

  const displayDate = new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (

    <><div className="px-6 md:px-16 lg:px-[120px] py-5 lg:py-10">
      <div className="">
        <div className="hidden md:block text-sm text-gray-400 mb-10 font-[Inter]">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2 text-gray-300">&gt;</span>
          <Link href={APP_ROUTE.blog} className="hover:text-black transition-colors">Blog</Link>
          <span className="mx-2 text-gray-300">&gt;</span>
          <span className="text-black font-medium">{article.title}</span>
        </div>

        {/* Back Button for Mobile */}
        <div className="md:hidden mb-8">
          <Link href={APP_ROUTE.blog} className="flex items-center gap-2 text-sm font-bold text-black uppercase tracking-wider">
            <span className="text-lg">←</span> Back to Blog
          </Link>
        </div>

        <article className="w-full">
          <header className="mb-4 lg:mb-8">
            <span className="inline-block font-bold text-[12px] uppercase tracking-[1px] text-black mb-4">ARTICLE</span>
            <h1 className="text-[34px] md:text-[44px] lg:text-[54px] font-medium leading-[1.1] tracking-[-0.02em] text-black mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-[#6C7275] text-[12px] lg:text-sm font-[Inter]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {article.author_image ? (
                    <img src={article.author_image} alt={article.author_name} className="w-full h-full object-cover" />
                  ) : (
                    <RiAccountCircleLine className="text-xl" />
                  )}
                </div>
                <span className="font-medium text-black">
                  {article.author_name || "Admin"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineCalendar className="text-lg opacity-60" />
                <span>{displayDate}</span>
              </div>
            </div>
          </header>

          <div className="blog-content-area text-black font-inter leading-relaxed">
            <MDXRemote
              source={article.content}
              components={{
                Image: (props: any) => {
                  if (props.fill) {
                    return <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] my-10 rounded-lg overflow-hidden"><Image {...props} fill={true} loading="lazy" className={`object-cover ${props.className || ""}`} alt={props.alt || ""} /></div>;
                  }
                  return <div className="my-10 rounded-lg overflow-hidden"><Image {...props} alt={props.alt || ""} loading="lazy" className="w-full h-auto" /></div>;
                },
                p: (props: any) => <div {...props} className="mb-4 last:mb-0" />
              }} />
          </div>
        </article>
      </div>
    </div>
      <ArticlePage title="You might also like" showButton={false} />

      <Newsletter /></>
  )
}