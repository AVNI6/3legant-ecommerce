"use client"

import Link from "next/link"
import Image from "next/image"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { GridType } from "@/constants/Data"

interface ArticleProps {
    data: {
        id: number | string
        title: string
        cover_image?: string
        created_at: string
        slug: string
        category?: string
    }[]
    gridType?: GridType
}

export default function BlogArticle({ data, gridType = "three" }: ArticleProps) {
    const gridClass = () => {
        switch (gridType) {
            case "two": return "grid grid-cols-1 sm:grid-cols-2 gap-6"
            case "three": return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            case "horizontal": return "grid grid-cols-1 md:grid-cols-2 gap-6"
            case "vertical": return "grid grid-cols-1 gap-6"
            default: return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        }
    }

    return (
        <div className={`${gridClass()} my-10`}>
            {data.map((article, index) => {
                const displayImage = article.cover_image || "/placeholder.png"
                const displayDate = new Date(article.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                })

                return (
                    <div key={article.id} className={`overflow-hidden ${gridType === "horizontal"
                        ? "flex gap-6 items-center"
                        : ""
                        }`}>
                        <Link href={`${APP_ROUTE.blog}/${article.slug}`} className={["horizontal", "vertical"].includes(gridType) ? "flex gap-4" : ""}>
                            <div className={`relative overflow-hidden flex-shrink-0 ${gridType === "horizontal" || gridType === "vertical"
                                ? "w-[250px] h-[200px]"
                                : "w-full h-[283px]"
                                }`}>
                                <img
                                    src={displayImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    loading={index < 3 ? "eager" : "lazy"}
                                />
                            </div>
                            <div className={`pt-4 ${gridType === "horizontal" ? "flex-1 pt-0" : ""}`}>
                                <h2 className="font-medium text-[20px] mb-2 hover:text-gray-600 transition-colors uppercase">{article.title}</h2>
                                <p className="text-[#6C7275] text-sm">{displayDate}</p>
                            </div>
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}
