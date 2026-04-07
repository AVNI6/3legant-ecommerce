import ProductDetailContent from "@/sections/product/ProductDetailContent";
import { Suspense } from "react";
import { GallerySkeleton } from "@/components/ui/skeleton";
import { mapProducts } from "@/store/slices/productSlice";
import { publicSupabase } from "@/lib/supabase/public";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = Number(idStr);

    const [productRes, reviewRes] = await Promise.all([
        publicSupabase
            .from("products")
            .select(`
                *,
                product_variant (*)
            `)
            .eq("id", id)
            .or("is_deleted.is.null,is_deleted.eq.false"),
        publicSupabase
            .from("reviews")
            .select("rating")
            .eq("product_id", id)
            .or("status.neq.spam,status.is.null")
    ]);

    const { data: rawData, error: productError } = productRes;

    if (productError || !rawData || rawData.length === 0) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <p className="text-gray-500 mb-8">The product you are looking for might have been removed or is temporarily unavailable.</p>
                <a href="/pages/product" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                    Back to Shop
                </a>
            </div>
        );
    }

    const initialVariants = mapProducts(rawData);
    const initialProduct = initialVariants[0];

    const reviewData = reviewRes.data;
    const reviewError = reviewRes.error;

    const reviewRows = reviewData ?? [];
    const count = reviewRows.length;
    const rating = count > 0
        ? reviewRows.reduce((sum, row) => sum + Number(row.rating ?? 0), 0) / count
        : 0;

    const initialReviewStats = { rating, count };

    return (
        <div suppressHydrationWarning>
            <Suspense fallback={
                <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-30 animate-pulse">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4 sm:mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                        <GallerySkeleton />
                        <div className="space-y-4 sm:space-y-6">
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-6 w-24 bg-gray-200 rounded"></div>
                            <div className="h-20 w-full bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            }>
                <ProductDetailContent
                    id={id}
                    initialProduct={initialProduct}
                    initialVariants={initialVariants}
                    initialReviewStats={initialReviewStats}
                />
            </Suspense>
        </div>
    );
}
