import { APP_ROUTE } from "@/constants/AppRoutes"
import { articles } from "@/constants/Data"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import Newsletter from "@/sections/home/newsletter"
import { RiAccountCircleLine } from "react-icons/ri";
import ArticlePage from "@/sections/home/articlepage"
import { HiOutlineCalendar } from "react-icons/hi2"
interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogDetail({ params }: PageProps) {

  const { slug } = await params

  const createSlug = (title: string) =>
    title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

  const article = articles.find(
    (item) => createSlug(item.title) === slug
  )

  if (!article) return notFound()

  return (
    <><div className="px-6 md:px-30 py-10">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/">Home</Link> &gt;{" "}
        <Link href={APP_ROUTE.blog}>Blog</Link> &gt;{" "}
        <span className="text-black">{article.title}</span>
      </div>
      <div className="">
        <div>
          <h3 className="font-bold text-[12px] my-9">ARTICLE</h3>
          <h4 className="text-[54px] font-medium w-[70%] leading-[58px]">How to make a busy bathroom a place to relax</h4>
          <div className="text-[#6C7275] flex items-center gap-15 my-4">
            <div className="flex items-center"><RiAccountCircleLine/> Henrik Annemark</div>
            <div className="flex items-center"><HiOutlineCalendar />October 16, 2023</div>
          </div>
        </div>
        <img src="/blog/detail/d1.png" className="w-full h-[70vh]" />
        <div className="text-[16px] pt-4">
          <p>Your bathroom serves a string of busy functions on a daily basis. See how you can make all of them work, and still have room for comfort and relaxation.</p>

          <h1 className="font-medium text-4xl py-3">A cleaning hub with built-in ventilation</h1>
          <p>Use a rod and a shower curtain to create a complement to your cleaning cupboard. Unsightly equipment is stored out of sight yet accessibly close – while the air flow helps dry any dampness.</p>
        </div>

        <div className="flex gap-5 mb-5 pt-7">
          <div className="flex-1 relative h-[629px]">
            <Image
              src="/blog/detail/d2.png"
              fill
              className="object-cover"
              alt="h1" />
          </div>

          <div className="flex-1 relative h-[629px]">
            <Image
              src="/blog/detail/d3.png"
              fill
              className="object-cover" alt="h1" />
          </div>
        </div>
        <div>
          <h1 className="font-medium text-4xl py-3">Storage with a calming effect</h1>
          <p>Having a lot to store doesn’t mean it all has to go in a cupboard. Many bathroom items are better kept out in the open {'-'} either to be close at hand or are nice to look at. Add a plant or two to set a calm mood for the entire room (and they’ll thrive in the humid air).</p>
          <h1 className="font-medium text-4xl py-3">Kit your clutter for easy access</h1>
          <p>Even if you have a cabinet ready to swallow the clutter, it’s worth resisting a little. Let containers hold kits for different activities – home spa, make-up, personal hygiene – to bring out or put back at a moment’s notice.</p>
        </div>
        <div className="flex gap-5 my-10">
          <Image src='/blog/detail/d4.png' width={1200} height={200} className="h-[700px]" alt="h1" />
          <div>
            <h1 className="font-medium text-4xl pb-3">An ecosystem of towels</h1>
            <p>Racks or hooks that allow air to circulate around each towel prolong their freshness. They dry quick and the need for frequent washing is minimized.</p>
            <h1 className="font-medium text-4xl py-3">Make your mop disappear</h1>
            <p>Having your cleaning tools organized makes them easier to both use and return to. When they’re not needed, close the curtain and feel the peace of mind it brings.</p>
          </div>
        </div>
        {/* <button className="px-4 py-2 border rounded-full">Show more</button> */}
      </div>

    </div>
    <ArticlePage/>
    <Newsletter /></>
  )
}

{/* <div className="mx-30">
  <img src="/blog/detail/d1.png" className="w-full h-[70vh]" />
  <div className="text-[16px] pt-4">
    <p>Your bathroom serves a string of busy functions on a daily basis. See how you can make all of them work, and still have room for comfort and relaxation.</p>

    <h1 className="font-medium text-4xl py-3">A cleaning hub with built-in ventilation</h1>
    <p>Use a rod and a shower curtain to create a complement to your cleaning cupboard. Unsightly equipment is stored out of sight yet accessibly close – while the air flow helps dry any dampness.</p>
  </div>

  <div className="flex gap-5 mb-5 pt-7">
    <div className="flex-1 relative h-[629px]">
      <Image
        src="/blog/detail/d2.png"
        fill
        className="object-cover"
        alt="h1"
      />
    </div>

    <div className="flex-1 relative h-[629px]">
      <Image
        src="/blog/detail/d3.png"
        fill
        className="object-cover" alt="h1" />
    </div>
  </div>
  <div>
    <h1 className="font-medium text-4xl py-3">Storage with a calming effect</h1>
    <p>Having a lot to store doesn’t mean it all has to go in a cupboard. Many bathroom items are better kept out in the open {'-'} either to be close at hand or are nice to look at. Add a plant or two to set a calm mood for the entire room (and they’ll thrive in the humid air).</p>
    <h1 className="font-medium text-4xl py-3">Kit your clutter for easy access</h1>
    <p>Even if you have a cabinet ready to swallow the clutter, it’s worth resisting a little. Let containers hold kits for different activities – home spa, make-up, personal hygiene – to bring out or put back at a moment’s notice.</p>
  </div>
  <div className="flex gap-5 my-10">
    <Image src='/blog/detail/d4.png' width={1200} height={200} className="h-[700px]" alt="h1" />
    <div>
      <h1 className="font-medium text-4xl pb-3">An ecosystem of towels</h1>
      <p>Racks or hooks that allow air to circulate around each towel prolong their freshness. They dry quick and the need for frequent washing is minimized.</p>
      <h1 className="font-medium text-4xl py-3">Make your mop disappear</h1>
      <p>Having your cleaning tools organized makes them easier to both use and return to. When they’re not needed, close the curtain and feel the peace of mind it brings.</p>
    </div>
  </div>
  <button className="px-4 py-2 border rounded-full">Show more</button>

</div> */}