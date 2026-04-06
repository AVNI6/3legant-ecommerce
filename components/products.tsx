"use client";

import React from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import Link from "next/link";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { formatCurrency, getEffectivePrice, isNewProduct } from "@/constants/Data";
import { type ProductType } from '@/types/index'
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin";
import AddToCartButton from "./AddToCartButton";
import { toast } from "react-toastify";
import StarRating from "./StarRating";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

type ProductReviewStats = {
    rating: number;
    count: number;
};

import { ProductCardSkeleton } from "./ui/skeleton";

type Props = {
    products: ProductType[];
    variant?: "scroll" | "grid";
    grid?: string;
    isLoading?: boolean;
};

const Products = ({ products, grid = "4", variant = "grid", isLoading }: Props) => {
    const isScroll = variant === "scroll";
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: any) => state.auth);
    const cartItems = useAppSelector((state: any) => state.cart.items) as any[];
    const wishlistItems = useAppSelector((state: any) => state.wishlist.items) as any[];
    const { requireLogin, LoginModal } = useRequireLogin();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const gridClass = useMemo(() => {
        switch (grid) {
            case "one":
                return "grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-3";
            case "two":
            case "4":
                return "grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
            case "three":
                return "grid-cols-2";
            case "four":
                return "grid-cols-1";
            default:
                return "grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
        }
    }, [grid]);

    const isInWishlist = useCallback((variant_id: number) =>
        wishlistItems.some(i => i.variant_id === variant_id)
        , [wishlistItems]);

    const handleWishlistToggle = useCallback((e: React.MouseEvent, product: ProductType, effectivePrice: number) => {
        e.preventDefault();
        e.stopPropagation();
        requireLogin(() => dispatch(toggleWishlist({
            product: {
                ...product,
                color: product.color,
                price: effectivePrice
            } as any,
            userId: user?.id as string
        })), user);
    }, [dispatch, user, requireLogin]);

    const handleAddToCart = useCallback(async (e: React.MouseEvent, product: ProductType, effectivePrice: number, productReviewStats: ProductReviewStats) => {
        e.preventDefault();
        e.stopPropagation();
        if (Number(product.stock) <= 0) {
            toast.warning("Item out of stock");
            return;
        }

        const resolvedCartImage = product.color_image?.[0] || product.image;

        const resultAction = await dispatch(addToCart({
            userId: user?.id,
            item: {
                id: product.id,
                variant_id: product.variant_id,
                name: product.name,
                price: effectivePrice,
                image: resolvedCartImage,
                color: product.color,
                description: product.description,
                rating: productReviewStats.rating,
                stock: product.stock,
            } as any
        }));

        if (addToCart.fulfilled.match(resultAction)) {
            const { limitReached } = resultAction.payload as any;
            const existing = cartItems.find((i: any) => Number(i.variant_id) === Number(product.variant_id));
            if (limitReached) {
                toast.warning("Item out of stock");
            } else {
                toast.success(existing ? "Quantity updated" : "Item added");
            }
        } else if (addToCart.rejected.match(resultAction)) {
            const payload = resultAction.payload as any;
            if (payload?.limitReached) {
                toast.warning("Item out of stock");
            } else {
                toast.error(payload?.message || "Failed to add to cart");
            }
        }
    }, [dispatch, user, cartItems]);

    if (!mounted && !isLoading) return null;

    return (
        <div className={isScroll
            ? "flex gap-6 overflow-x-auto pb-3"
            : `grid gap-6 ${isLoading ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3" : gridClass}`}>
            {isLoading ? (
                Array.from({ length: isScroll ? 5 : 6 }).map((_, i) => (
                    <div key={i} className={`${isScroll ? "w-[260px] flex-shrink-0" : ""}`}>
                        <ProductCardSkeleton />
                    </div>
                ))
            ) : products.length === 0 ? (
                null
            ) : (
                products.map((product) => {
                    const {
                        price: effectivePrice,
                        oldPrice: effectiveOldPrice,
                        isOfferActive,
                        hasDiscount
                    } = getEffectivePrice({
                        price: Number(product.price),
                        old_price: Number(product.old_price),
                        validationTill: product.validation_till
                    });
                    const productReviewStats = (product as any).reviewStats ?? { rating: 0, count: 0 };
                    const discountPercent = Math.round(
                        ((product.old_price - product.price) / product.old_price) * 100
                    );
                    const effectiveVariantId = product.variant_id || product.id;
                    const inWishlist = isInWishlist(product.variant_id);

                    return (
                        <Link href={`${APP_ROUTE.product}/${product.id}?variantId=${effectiveVariantId}`} key={`${product.id}-${product.variant_id}`} className="block">
                            <div className={`font-semibold cursor-pointer ${isScroll ? "group w-[260px] flex-shrink-0" : ""
                                } ${grid === "four" ? "flex gap-6 flex-col md:flex-row items-start md:items-center" : ""
                                } ${grid === "three" ? "flex gap-4 md:gap-6 flex-col md:flex-row items-start md:items-stretch" : ""
                                } ${grid === "one" || grid === "two" ? "group" : ""
                                }`}>

                                <div className={`relative bg-[#F3F5F7] rounded-lg ${grid === "four" ? "w-full sm:w-[260px] md:w-[250px] flex-shrink-0" : grid === "three" ? "w-full md:w-[200px] xl:w-[250px] flex-shrink-0 md:flex md:flex-col" : "w-full"}`}>
                                    <div className="absolute z-10 flex justify-between w-full px-2 sm:px-4 top-2 sm:top-3 pointer-events-none">
                                        <div>
                                            {isNewProduct(product.created_at) && (
                                                <p className="w-8 min-[350px]:w-10 md:w-12 mb-1 min-[350px]:mb-2 bg-white text-black text-center rounded-md text-[9px] min-[350px]:text-xs md:text-sm py-0.5">
                                                    NEW
                                                </p>
                                            )}
                                            {isOfferActive && hasDiscount && (
                                                <p className="w-8 min-[350px]:w-10 md:w-12 text-white text-center rounded-md text-[9px] min-[350px]:text-xs md:text-sm bg-green-500 py-0.5">
                                                    -{discountPercent}%
                                                </p>
                                            )}
                                        </div>
                                        {grid !== "three" && grid !== "four" && (
                                            <button
                                                onClick={(e) => handleWishlistToggle(e, product, effectivePrice)}
                                                className="pointer-auto pointer-events-auto absolute top-2 sm:top-3 right-2 sm:right-3"
                                            >
                                                {inWishlist ? (
                                                    <GoHeartFill className="bg-white text-red-500 rounded-full text-3xl sm:text-4xl p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition shadow-sm" />
                                                ) : (
                                                    <GoHeart className="bg-white text-gray-500 rounded-full text-3xl sm:text-4xl p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition shadow-sm" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {grid !== "three" && grid !== "four" && (
                                        <button
                                            onClick={(e) => handleAddToCart(e, product, effectivePrice, productReviewStats)}
                                            className={`w-[90%] absolute z-20 bottom-4 left-1/2 -translate-x-1/2 text-white py-2 rounded-lg opacity-0 group-hover:opacity-100 transition text-xs sm:text-sm md:text-base
                                            ${Number(product.stock) <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} shadow-lg`}
                                        >
                                            {Number(product.stock) <= 0 ? "Out of Stock" : "Add to cart"}
                                        </button>
                                    )}

                                    {(() => {
                                        const displayImage = product.image;
                                        return (
                                            <img
                                                src={displayImage}
                                                alt={product.name}
                                                className={`rounded-lg object-contain p-2 mix-blend-multiply ${grid === "four" ? "w-full max-h-[250px]" : grid === "three" ? "w-full h-[180px] min-[350px]:h-[220px] sm:h-[280px] md:h-[250px] xl:h-[280px]" : "w-full aspect-[4/5] max-h-[250px] min-[350px]:max-h-[300px] sm:h-[300px] lg:h-[220px] xl:h-[300px]"
                                                    }`}
                                            />
                                        );
                                    })()}
                                </div>

                                <div className={`mt-2 ${grid === "three" || grid === "four" ? "flex-1 text-left w-full min-w-0 flex flex-col justify-between" : "leading-7"}`}>
                                    <div>
                                        <div className="flex pb-1 sm:pb-2">
                                            <StarRating rating={productReviewStats.rating} />
                                        </div>
                                        <p className={`text-sm min-[350px]:text-base sm:text-lg line-clamp-1 md:text-base lg:text-lg font-bold mb-1 ${grid === "three" ? "md:text-sm lg:text-base" : ""}`}>{product.name}</p>
                                        <div className="flex gap-2 min-[350px]:gap-3 sm:gap-4 items-center">
                                            <h2 className="text-sm min-[350px]:text-base sm:text-lg font-bold">
                                                {formatCurrency(effectivePrice)}
                                            </h2>
                                            {isOfferActive && hasDiscount && effectiveOldPrice && (
                                                <h3 className="line-through text-gray-400 text-[10px] min-[350px]:text-xs sm:text-sm">
                                                    {formatCurrency(effectiveOldPrice)}
                                                </h3>
                                            )}
                                        </div>

                                        {(grid === "three" || grid === "four") && product.description && product.description.trim() !== "" && (
                                            <div className={`text-gray-600 w-full text-xs sm:text-sm mt-2 ${grid === "three" ? "hidden md:block" : ""}`}>
                                                <p className={`pt-2 sm:pt-3 mb-3 sm:mb-4 line-clamp-3 ${grid === "three" ? "text-[11px] sm:text-xs md:text-[11px] lg:text-xs xl:text-sm" : ""}`}>
                                                    {product.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {(grid === "three" || grid === "four") && (
                                        <div className="my-2 sm:my-3 space-y-2 sm:space-y-3 pointer-events-auto">
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e, product, effectivePrice, productReviewStats) }}
                                                className={`py-1.5 sm:py-2 rounded-lg w-full md:w-full lg:w-[50%] transition text-xs sm:text-sm md:text-xs lg:text-sm text-white ${Number(product.stock) <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
                                            >
                                                {Number(product.stock) <= 0 ? "Out of Stock" : "Add to cart"}
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlistToggle(e, product, effectivePrice); }}
                                                className="w-full md:w-full lg:w-[50%] flex items-center justify-center gap-1 hover:bg-gray-50 transition py-1"
                                            >
                                                {inWishlist ? (
                                                    <>
                                                        <GoHeartFill className="bg-white text-red-500 rounded-full text-3xl sm:text-4xl md:text-3xl lg:text-4xl p-1.5 sm:p-2" />
                                                        <p className="font-semibold text-black text-xs sm:text-sm md:text-xs lg:text-sm">Wishlist</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <GoHeart className="bg-white text-gray-500 rounded-full text-3xl sm:text-4xl md:text-3xl lg:text-4xl p-1.5 sm:p-2" />
                                                        <p className="font-semibold text-black text-xs sm:text-sm md:text-xs lg:text-sm">Wishlist</p>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
            <LoginModal />
        </div>
    );
};

export default React.memo(Products, (prevProps, nextProps) => {
    // Only re-render if critical props change
    return (
        prevProps.products === nextProps.products &&
        prevProps.grid === nextProps.grid &&
        prevProps.variant === nextProps.variant &&
        prevProps.isLoading === nextProps.isLoading
    );
});