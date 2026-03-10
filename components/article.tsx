"use client"

import Link from "next/link"
import BlackShopButton from "@/components/blackbutton"
import { APP_ROUTE } from "@/constants/AppRoutes";

interface ArticleProps {
  data: {
    id: number
    title: string
    image: string
  }[]
}

const Article = ({ data }: ArticleProps) => {

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "")
  }

  return (
    <section className=" overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data.map((article) => {
          const slug = createSlug(article.title)

          return (
            <div key={article.id} >
              <div className="cursor-pointer">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-[283px] object-cover"
                />
                <div className="pt-4">
                  <h2 className="font-semibold text-lg mb-2">
                    {article.title}
                  </h2>
                  <BlackShopButton
                    href={`${APP_ROUTE.blog}/${slug}`}
                    content="Read More"
                    className="text-[14px]"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Article