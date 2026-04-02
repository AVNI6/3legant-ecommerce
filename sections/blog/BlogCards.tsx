"use client"

import { useEffect, useState, useMemo } from "react"
import Controls from "./Controls"
import BlogArticle from "./BlogArticle"
import { SortOrder, TabType, GridType } from "@/constants/Data"
import { supabase } from "@/lib/supabase/client"
import { BlogGridSkeleton } from "@/components/ui/skeleton"
import { buildPaginatedQuery } from "@/lib/hooks/usePagination"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setInitialBlogs, appendBlogs, setPage } from "@/store/slices/blogSlice"

export default function BlogCards({ initialArticles = [], totalCount = 0 }: { initialArticles?: any[], totalCount?: number }) {
    const dispatch = useAppDispatch()
    const { items: articles, page, hasMore, initialized } = useAppSelector((state: any) => state.blog)
    
    const [loadingMore, setLoadingMore] = useState(false)

    // Initialize Redux state from initialArticles on first load
    useEffect(() => {
        if (!initialized && initialArticles.length > 0) {
            dispatch(setInitialBlogs({ items: initialArticles, totalCount }))
        }
    }, [initialized, initialArticles, totalCount, dispatch])

    const [activeTab, setActiveTab] = useState<TabType>("all")
    const [sortOrder, setSortOrder] = useState<SortOrder>("default")
    const [gridType, setGridType] = useState<GridType>("three")

    const handleLoadMore = async () => {
        const pageSize = 6
        setLoadingMore(true)
        const nextPage = page + 1
        const { range } = buildPaginatedQuery(nextPage, pageSize)

        const { data, error } = await supabase
            .from("blogs")
            .select("id, title, slug, author_name, author_image, category, status, created_at, cover_image")
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .range(range.from, range.to)

        if (!error && data) {
            dispatch(appendBlogs(data))
            dispatch(setPage(nextPage))
        } 
        setLoadingMore(false)
    }

    const filteredArticles = useMemo(() => {
        return activeTab === "features"
            ? articles.filter((a: any) => a.category === "Featured")
            : articles
    }, [articles, activeTab])

    const sortedArticles = useMemo(() => {
        if (sortOrder === "default") return filteredArticles
        
        return [...filteredArticles].sort((a, b) =>
            sortOrder === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title)
        )
    }, [filteredArticles, sortOrder])

    const tabClass = (tab: TabType) => `pb-2 font-medium transition-colors ${activeTab === tab ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-black"}`
    const isInitialLoading = !initialized

    return (
        <div className="">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 mt-5 md:mt-0">
                <div className="w-full md:w-auto">
                    <div className="relative md:hidden">
                        <select
                            id="blog-category"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value as TabType)}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus:border-black appearance-none bg-white pr-10"
                        >
                            <option value="all">All Blog</option>
                            <option value="features">Features</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#141718" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="hidden md:flex gap-10">
                        <button onClick={() => setActiveTab("all")} className={tabClass("all")}>All Blog</button>
                        <button onClick={() => setActiveTab("features")} className={tabClass("features")}>Features</button>
                    </div>
                </div>

                <div className="hidden md:block w-full md:w-auto">
                    <Controls sortOrder={sortOrder} setSortOrder={setSortOrder} gridType={gridType} setGridType={setGridType} />
                </div>
            </div>
            

            {isInitialLoading ? (
                <BlogGridSkeleton count={6} gridType={gridType} />
            ) : articles.length === 0 ? (
                <div className="text-center py-20 text-gray-400">No published articles found.</div>
            ) : (
                <>
                    <BlogArticle data={sortedArticles} gridType={gridType} />
                    
                    {hasMore && activeTab === "all" && (
                        <div className="flex justify-center mt-12 mb-20">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-10 py-3 border-2 border-black rounded-full font-semibold hover:bg-black hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </div>
                                ) : (
                                    "Show More"
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
