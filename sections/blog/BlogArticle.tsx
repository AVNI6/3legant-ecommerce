"use client"

import Link from "next/link"
import { APP_ROUTE } from "@/constants/AppRoutes"

interface ArticleProps {
    data: {
        id: number
        title: string
        image: string
        date: string
        type?: string
    }[]
    gridType?: "two" | "three" | "horizontal" | "vertical"
}

export default function BlogArticle({ data, gridType = "three" }: ArticleProps) {
    const createSlug = (title: string) =>
        title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

    const gridClass = () => {
        switch (gridType) {
            case "two": return "grid grid-cols-1 sm:grid-cols-2 gap-6"
            case "three": return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            case "horizontal": return "grid grid-cols-1 md:grid-cols-2 gap-6"
            case "vertical": return "grid grid-cols-1 gap-6"
            default: return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        }
    }
    // const gridClass = () => {
    //     switch (gridType) {
    //         case "two": return "grid grid-cols-1 sm:grid-cols-2 gap-6"
    //         case "three": return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
    //         case "horizontal": return "flex flex-col gap-6"
    //         case "vertical": return "flex flex-row flex-wrap gap-6 justify-center"
    //         default: return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
    //     }
    // }

    return (
        <div className={`${gridClass()} my-10`}>
            {data.map(article => {
                const slug = createSlug(article.title)
                return (
                    <div key={article.id} className={`overflow-hidden ${gridType === "horizontal"
                        ? "flex gap-6 items-center"
                        : ""
                        }`}>
                        <Link href={`${APP_ROUTE.blog}/${slug}`} className={["horizontal", "vertical"].includes(gridType) ? "flex gap-4" : ""}>
                            <img src={article.image} alt={article.title} className={`object-cover ${gridType === "horizontal" || gridType ==="vertical"
                                    ? "w-[250px] h-[200px] flex-shrink-0"
                                    : "w-full h-[283px]"
                                }`} />
                                   <div className={`pt-4 ${gridType === "horizontal" ? "flex-1 pt-0" : ""}`}>
                                <h2 className="font-medium text-[20px] mb-2">{article.title}</h2>
                                <p className="text-[#6C7275] text-3">{article.date}</p>
                            </div>
                        </Link>
                    </div>
                  
                )
            })}
        </div>
    )
}