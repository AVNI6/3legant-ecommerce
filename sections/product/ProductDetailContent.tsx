"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency, getEffectivePrice, isNewProduct } from "@/constants/Data";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import AddToCartButton from "@/components/AddToCartButton";
import QuantityInput from "@/components/QuantityInput";
import ReviewSummary from "@/components/review-summary";
import { APP_ROUTE } from "@/constants/AppRoutes";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import ProductGallery from "@/components/ProductGallery";
import OfferCountdown from "@/components/OfferCountdown";
import ColorSelector from "@/sections/ColorSelector";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { IoIosArrowDown } from "react-icons/io";
import ReviewTab from "@/sections/account/ReviewTab";
import Additional from "@/sections/account/Additional";
import Question from "@/sections/account/Question";

interface Props {
    id: number;
    initialProduct: any;
    initialVariants: any[];
    initialReviewStats: { rating: number; count: number };
    initialReviewData?: {
        reviews: any[];
        likes: Record<string, any[]>;
        replies: Record<string, any[]>;
    };
}

export default function ProductDetailContent({ id, initialProduct, initialVariants, initialReviewStats, initialReviewData }: Props) {
    const searchParams = useSearchParams();
    const queryVariantId = searchParams.get("variantId") ? Number(searchParams.get("variantId")) : null;
    const dispatch = useAppDispatch();

    const [reviewStats, setReviewStats] = useState(initialReviewStats);
    const { items: cartItems } = useAppSelector((state: any) => state.cart);
    const { items: wishlistItems } = useAppSelector((state: any) => state.wishlist);
    const { user } = useAppSelector((state: any) => state.auth);
    const { items: reduxProducts } = useAppSelector((state: any) => state.products);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        window.scrollTo(0, 0);
    }, [id]);

    const productVariants = useMemo(() => {
        return initialVariants.map((variant: any) => {
            let updatedVariant = { ...variant };
            const liveMatch = reduxProducts.find((item: any) => Number(item.variant_id) === Number(variant.variant_id));
            if (liveMatch) {
                updatedVariant = { ...updatedVariant, ...liveMatch };
            }
            return updatedVariant;
        });
    }, [initialVariants, reduxProducts, id]);

    const uniqueProductVariants = useMemo(() => Array.from(
        new Map(productVariants.map((variant: any) => [variant.variant_id, variant])).values()
    ), [productVariants]);

    const product = uniqueProductVariants[0] || initialProduct;

    const router = useRouter();
    const queryTab = searchParams.get("tab");

    const [tab, setTabState] = useState("reviews");
    const [quantity, setQuantity] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(queryVariantId || (initialVariants[0] as any)?.variant_id || null);

    useEffect(() => {
        if (!mounted) return;
        if (queryTab) setTabState(queryTab);
    }, [mounted]);

    const handleTabChange = (newTab: string) => {
        const nextTab = tab === newTab ? "" : newTab;
        setTabState(nextTab);
        const params = new URLSearchParams(window.location.search);
        if (nextTab) {
            params.set("tab", nextTab);
        } else {
            params.delete("tab");
        }
        window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    };

    useEffect(() => {
        if (queryTab && queryTab !== tab) {
            setTabState(queryTab);
        }
    }, [queryTab]);
    const [showModal, setShowModal] = useState(false);

    const handleReviewChange = useCallback((newStats: { rating: number; count: number }) => {
        setReviewStats(prev => {
            if (prev.rating === newStats.rating && prev.count === newStats.count) return prev;
            return newStats;
        });
    }, []);

    const selectedVariantForSync =
        uniqueProductVariants.find((variant: any) => variant.variant_id === selectedVariantId) ??
        uniqueProductVariants[0] ??
        product;

    const galleryImagesForSync = useMemo(() => Array.from(
        new Set(
            [
                product?.image,
                ...(selectedVariantForSync?.thumbnails ? (Array.isArray(selectedVariantForSync.thumbnails) ? selectedVariantForSync.thumbnails : Object.values(selectedVariantForSync.thumbnails)) : []),
                ...(selectedVariantForSync?.color_images ?? (selectedVariantForSync as any)?.color_image ?? []),
                ...uniqueProductVariants.flatMap((v: any) => v.color_images ?? (v as any)?.color_image ?? []),
            ].filter((img): img is string => typeof img === "string" && img.trim().length > 0)
        )
    ), [selectedVariantForSync, product?.image, uniqueProductVariants]);

    const selectedVariant = selectedVariantForSync;
    const allGalleryImages = galleryImagesForSync;

    const colorImages = uniqueProductVariants.map((variant: any) => ({
        id: variant.variant_id,
        image: variant.color_image?.[0] || variant.image || product.image,
        variantId: variant.variant_id,
        color: variant.color || "Default",
    }));

    const selectedColorIndex = colorImages.find((c: any) => c.variantId === selectedVariant.variant_id)?.id ?? null;
    const actionColor = selectedVariant.color || "Default";
    const activeVariantId = selectedVariant.variant_id;

    const {
        price: effectivePrice,
        oldPrice: effectiveOldPrice,
        isOfferActive,
        hasDiscount
    } = getEffectivePrice({
        price: Number(selectedVariant.price),
        old_price: Number(selectedVariant.old_price),
        validationTill: product.validation_till
    });

    const mainImage = allGalleryImages[currentIndex] ?? product.image ?? "/placeholder.png";
    const isInWishlist = wishlistItems.some((item: any) => Number(item.variant_id) === Number(activeVariantId));

    useEffect(() => {
        if (!product) return;
        // Always default to 1 on the detail page as requested
        setQuantity(1);
    }, [selectedVariantId, product?.variant_id]);

    useEffect(() => {
        if (!product) return;
        const currentId = selectedVariantId;

        if (currentId) {
            const variant = uniqueProductVariants.find((v: any) => v.variant_id === currentId) as any;
            const variantImg = variant?.color_image?.[0] || product.image;
            if (variantImg) {
                const idx = galleryImagesForSync.indexOf(variantImg);
                if (idx !== -1) {
                    setCurrentIndex(idx);
                }
            }
        }
    }, [product?.id, queryVariantId]);

    useEffect(() => {
        if (selectedVariantId !== null && product) {
            const variantImg = (selectedVariantForSync as any)?.color_images?.[0] || (selectedVariantForSync as any)?.color_image?.[0] || product.image;
            if (variantImg) {
                const idx = galleryImagesForSync.indexOf(variantImg);
                if (idx !== -1 && idx !== currentIndex) {
                    setCurrentIndex(idx);
                }
            }
        }
    }, [selectedVariantId, selectedVariantForSync, product?.image, galleryImagesForSync]);

    if (!product) return <div className="p-10 text-center text-gray-400">Product not found</div>;

    const thumbnailPool = Array.from(
        new Set(
            [
                selectedVariant.color_image?.[0] || product.image,
                ...(Array.isArray(selectedVariant.thumbnails) ? selectedVariant.thumbnails : []),
                ...uniqueProductVariants.map((v: any) => v.color_image?.[0] || v.image).filter(Boolean),
            ].filter((img): img is string => typeof img === "string" && img.trim().length > 0)
        )
    );

    const handleWishlist = () => {
        if (!user) {
            setShowModal(true);
            return;
        }
        const cartImage = mainImage || selectedVariant.color_image?.[0] || product.image || "";
        dispatch(toggleWishlist({
            userId: user.id,
            product: {
                id: product.id,
                variant_id: activeVariantId,
                name: product.name,
                price: effectivePrice,
                image: cartImage,
                color: actionColor,
                rating: 0,
                stock: selectedVariant.stock
            }
        }));
    };

    return (
        <>
            <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-30">
                <div className="mt-7 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-8 font-inter font-medium lg:text-[14px] leading-[24px] tracking-normal">
                    <Link href="/" className="hover:text-black transition-colors">&nbsp;Home&nbsp; </Link> &gt;{" "}
                    <Link href={APP_ROUTE.product} className="hover:text-black transition-colors"> &nbsp;Shop&nbsp;</Link> &gt;{" "}
                    <Link href={{ pathname: APP_ROUTE.product, query: { category: product.category }, }} className="hover:text-black transition-colors">
                        &nbsp;{product.category}&nbsp;
                    </Link> &gt;{" "}
                    <span className="text-black">&nbsp;{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 lg:items-start">
                    <div className="lg:sticky lg:top-32 lg:z-10 w-full">
                        <div className="relative">
                            <ProductGallery
                                images={allGalleryImages}
                                thumbnailPool={thumbnailPool}
                                product={product}
                                currentIndex={currentIndex}
                                setCurrentIndex={setCurrentIndex}
                                mainImage={mainImage}
                            />
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                                {isNewProduct(product.created_at) && (
                                    <span className="bg-white text-black px-3 py-1 rounded text-xs font-bold uppercase shadow-sm">
                                        New
                                    </span>
                                )}
                                {isOfferActive && hasDiscount && (
                                    <span className="bg-[#38CB89] text-white px-3 py-1 rounded text-xs font-bold uppercase shadow-sm">
                                        -{Math.round(((Number(selectedVariant.old_price) - Number(selectedVariant.price)) / Number(selectedVariant.old_price)) * 100)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-4 lg:space-y-2 xl:space-y-4">
                        <ReviewSummary
                            rating={reviewStats.rating}
                            count={reviewStats.count}
                        />
                        <h1 className="font-poppins text-2xl sm:text-3xl font-medium md:text-[40px] lg:text-[32px] xl:text-[40px] tracking-[-0.4px] ">{product.name}</h1>
                        <p className="text-gray-600 text-sm sm:text-[16px] lg:text-[14px] xl:text-[16px] leading-[26px] tracking-normal">{product.description}</p>

                        <div className="flex flex-col gap-1 ">
                            <div className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl">
                                <span className="font-poppins font-medium text-[28px] lg:text-[24px] xl:text-[28px] leading-[34px] tracking-[-0.6px]">{formatCurrency(effectivePrice)}</span>
                                {isOfferActive && hasDiscount && effectiveOldPrice && (
                                    <span className="font-poppins font-medium text-[20px] lg:text-[18px] xl:text-[20px] leading-[28px] tracking-normal line-through text-gray-400">{formatCurrency(effectiveOldPrice)}</span>
                                )}
                            </div>
                            {selectedVariant.stock === 0 && (
                                <p className="text-sm text-red-500 font-semibold italic">Currently not available</p>
                            )}
                        </div>

                        <hr className="text-gray-300" />
                        {isOfferActive && hasDiscount && product.validation_till && product.validation_till !== "" && product.validation_till !== "null" && (
                            <>
                                <OfferCountdown validationTill={product.validation_till} />
                                <hr className="text-gray-300 my-2 sm:my-6 lg:my-3 xl:my-6" />
                            </>
                        )}

                        <div>
                            <h1 className="text-[#6C7275] pb-2 font-semibold text-[16px] leading-[26px] tracking-normal">Measurements</h1>
                            <p className="tracking-widest text-sm sm:text-base">{product.measurements}</p>
                        </div>

                        <ColorSelector
                            colors={colorImages}
                            selected={selectedColorIndex}
                            onSelect={(selectedId) => {
                                const selectedOption = colorImages.find((c: any) => c.id === selectedId);
                                if (!selectedOption) return;
                                setSelectedVariantId(selectedOption.variantId);
                                const imgIndex = allGalleryImages.indexOf(selectedOption.image);
                                if (imgIndex !== -1) {
                                    setCurrentIndex(imgIndex);
                                }
                                setQuantity(1);
                            }}
                        />

                        <div className="flex flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                            <QuantityInput
                                quantity={quantity}
                                stock={selectedVariant.stock}
                                onQuantityChange={(val) => setQuantity(val)}
                                maxWidth="w-full sm:w-32"
                            />

                            <button
                                onClick={handleWishlist}
                                className="border rounded-lg flex items-center justify-center w-full gap-1 px-4 sm:px-6 py-2 transition hover:bg-gray-50"
                            >
                                {isInWishlist ? <GoHeartFill className="text-red-500" /> : <GoHeart />}
                                <span className="text-sm sm:text-base">Wishlist</span>
                            </button>
                        </div>

                        <AddToCartButton
                            product={{
                                id: product.id,
                                variant_id: selectedVariant.variant_id,
                                name: product.name,
                                price: effectivePrice,
                                color: actionColor,
                                image: mainImage,
                                quantity,
                                stock: selectedVariant.stock,
                                rating: reviewStats.rating
                            }}
                            onSuccess={() => setQuantity(1)}
                            className="bg-black text-white py-2 sm:py-3 rounded-lg w-full transition hover:bg-gray-800 text-sm sm:text-base font-medium"
                        />
                        <hr className="text-gray-300 my-3" />

                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <span className="text-gray-500 font-medium text-sm sm:text-base w-full sm:w-24">SKU</span>
                                <span className="text-sm sm:text-base">{selectedVariant.sku}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <span className="text-gray-500 font-medium text-sm sm:text-base w-full sm:w-24">Category</span>
                                <span className="text-sm sm:text-base">{product.category}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 sm:border-b-2 sm:border-gray-300 overflow-x-auto">
                    {["additional", "questions", "reviews"].map((t) => (
                        <button
                            key={t}
                            onClick={() => handleTabChange(t)}
                            className={`pb-3 capitalize whitespace-nowrap text-sm sm:text-base flex items-center justify-between sm:justify-start gap-2 ${tab === t ? "border-b-2 border-black font-semibold sm:border-b-2" : "border-b border-gray-300 sm:border-none "}`}
                        >
                            {t}
                            <IoIosArrowDown
                                className={`sm:hidden transition-transform duration-300 ${tab === t ? "rotate-180" : ""}`}
                                size={18}
                            />
                        </button>
                    ))}
                </div>
                <div className={tab === "additional" ? "block" : "hidden"}>
                    <Additional product={product} />
                </div>
                <div className={tab === "questions" ? "block" : "hidden"}>
                    <Question productId={product.id} />
                </div>
                <div className={tab === "reviews" ? "block" : "hidden"}>
                    <ReviewTab productId={product.id} onReviewStatsChange={handleReviewChange} />
                </div>

            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm text-center shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Sign In Required</h3>
                        <p className="text-gray-600 mb-6 text-sm sm:text-base">Please sign in to add items to wishlist.</p>
                        <Link href={APP_ROUTE.signin} className="bg-black text-white px-5 py-2 rounded-lg inline-block hover:bg-gray-800 transition-colors">
                            Go to Sign In
                        </Link>
                        <button
                            onClick={() => setShowModal(false)}
                            className="block mt-4 text-gray-500 underline mx-auto hover:text-black transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
