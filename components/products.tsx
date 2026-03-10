"use client";

import { FaStar } from "react-icons/fa6";
import { GoHeart, GoHeartFill } from "react-icons/go";
import Link from "next/link";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useCart } from "@/sections/cart/context/CartContext"
import { formatCurrency } from "@/constants/Data";
import { ProductType } from "@/constants/Data";
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin";
type Props = {
    products: ProductType[];
    variant?: "scroll" | "grid";
    grid?: string;
};

const Products = ({ products, grid = "4", variant = "grid" }: Props) => {
    const isScroll = variant === "scroll";
    const { user, addToCart, wishlistItems, addToWishlist, removeWishlistItem } = useCart();
    const { requireLogin, LoginModal } = useRequireLogin();

    const gridClass =
        grid === "one"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : grid === "two"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : grid === "three"
                    ? "grid-cols-2"
                    : "grid-cols-1";

    const isInWishlist = (id: number) => wishlistItems.some(i => i.id === id);

    return (
        <div className={isScroll
            ? "flex gap-6 overflow-x-auto pb-3  "
            : `grid gap-6 ${gridClass}`}>
            {products.map((product) => {
                const discountPercent = Math.round(
                    ((product.oldPrice - product.price) / product.oldPrice) * 100
                );
                const inWishlist = isInWishlist(product.id);
                return (
                    <Link key={product.id} href={`${APP_ROUTE.product}/${product.id}`} >
                        {/* <div className="font-semibold group cursor-pointer"> */}
                        {/* <div className={`font-semibold group cursor-pointer ${isScroll ? "w-[260px] flex-shrink-0" : ""}`} > */}
                        <div className={`font-semibold cursor-pointer ${isScroll ? "group w-[260px] flex-shrink-0" : ""
                            } ${grid === "four"
                                ? "flex gap-6 items-center"
                                : ""
                            } ${grid === "three" ? "flex gap-6 flex flex-col md:flex-row items-center" : ""} 
                             ${grid === "one" || grid === "two" ? "group" : ""}`} >

                            <div className="relative">
                                <div className="flex justify-between w-full absolute z-10 px-4 top-3">
                                    <div>
                                        <p className="w-12 mb-2 bg-white text-black text-center rounded-md text-sm">
                                            NEW
                                        </p>
                                        {product.oldPrice > product.price && (
                                            <p className="w-12 bg-green-400 text-white text-center rounded-md text-sm">
                                                -{discountPercent}%
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            requireLogin(() => addToWishlist(product), user);
                                        }}
                                        className="absolute top-3 right-3"
                                    >
                                        {inWishlist ? <GoHeartFill className="bg-white text-red-500 rounded-full text-4xl p-2 opacity-0 group-hover:opacity-100 transition" /> : <GoHeart className="bg-white text-gray-500 rounded-full text-4xl p-2 opacity-0 group-hover:opacity-100 transition" />
                                        }
                                    </button>
                                    {/* <GoHeart className="bg-white text-gray-500 rounded-full text-4xl p-2 opacity-0 group-hover:opacity-100 transition" /> */}
                                </div>

                                {/* <button className="w-[90%] absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white py-2 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                    Add to cart
                                </button> */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()

                                        addToCart({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.image,
                                            color: product.color,
                                        })
                                    }}
                                    className="w-[90%] absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white py-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                >
                                    Add to cart
                                </button>

                                <img src={product.image} alt={product.name}
                                    className={`rounded-lg object-cover ${grid === "three" || grid === "four"
                                        ? "w-full h-[250px]"
                                        : "w-full h-[260px] sm:h-[300px]"
                                        }`} />
                            </div>

                            <div className="leading-7 mt-2">
                                <div className="flex pb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} />
                                    ))}
                                </div>

                                <p>{product.name}</p>

                                <div className="flex gap-4">
                                    <h2>{formatCurrency(product.price)}</h2>

                                    <h3 className="line-through text-gray-400">
                                        {formatCurrency(product.oldPrice)}
                                    </h3>
                                </div>
                                {(grid === "three" || grid === "four") && (
                                    <div className="text-gray-600 max-w-[250px] text-sm">
                                        <p> {product.description}</p>
                                        <div className="my-3">
                                            <button onClick={(e) => {
                                                e.preventDefault(); e.stopPropagation()

                                                addToCart({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: product.price,
                                                    image: product.image,
                                                    color: product.color,
                                                })
                                            }}
                                                className="bg-black text-white py-2 rounded-lg w-full transition">
                                                Add to cart
                                            </button>
                                            <button onClick={(e) => {
                                                e.preventDefault(); e.stopPropagation();

                                                if (inWishlist) {
                                                    removeWishlistItem(product.id);
                                                } else {
                                                    addToWishlist({
                                                        id: product.id,
                                                        name: product.name,
                                                        price: product.price,
                                                        image: product.image,
                                                        color: product.color,
                                                    });
                                                }
                                            }}
                                                className="py-2 w-full flex items-center justify-center"   >
                                                {inWishlist ? (

                                                    <><GoHeartFill className="bg-white text-red-500 rounded-full text-4xl p-2" /><p>Wishlist</p></>
                                                ) : (
                                                    <><GoHeart className="bg-white text-gray-500 rounded-full text-4xl p-2 " /><p>Wishlist</p></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>

                        </div>
                    </Link>
                )
            }
            )}
            <LoginModal />
        </div>
    );
};

export default Products;