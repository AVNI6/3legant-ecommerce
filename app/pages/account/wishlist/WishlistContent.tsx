"use client";

import { useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { formatCurrency } from "@/constants/Data";
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin";
import { toast } from "react-toastify";
import { type CartItem } from "@/types";
import Link from "next/link";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist, fetchWishlist, hydrateWishlist } from "@/store/slices/wishlistSlice";
import { WishlistPageSkeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/common/Pagination";
import { useSearchParams } from "next/navigation";

type Props = {
  initialItems: CartItem[];
  initialTotalCount: number;
  initialPage: number;
};

export default function WishlistContent({ initialItems, initialTotalCount, initialPage }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const cartItems = useAppSelector((state: any) => state.cart.items) as CartItem[];
  const { items: wishlistItems, loading, initialized, totalCount } = useAppSelector((state: any) => state.wishlist) as { items: CartItem[], loading: boolean, initialized: boolean, totalCount: number };
  const { requireLogin, LoginModal } = useRequireLogin();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  const wishlistPendingRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    dispatch(hydrateWishlist({ items: initialItems || [], totalCount: initialTotalCount || 0 }));
  }, [dispatch, initialItems, initialTotalCount]);

  useEffect(() => {
    const shouldRefetch = currentPage !== initialPage;
    if (user?.id && shouldRefetch) {
      dispatch(fetchWishlist({ userId: user.id, page: currentPage, pageSize }));
    }
  }, [user?.id, dispatch, currentPage, initialPage]);

  if (loading && !initialized) return <WishlistPageSkeleton />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Wishlist</h2>
      {wishlistItems.length === 0 && <p className="text-gray-500 mb-4">Your wishlist is empty.</p>}

      {wishlistItems.map((item: CartItem) => (
        <div
          key={`${item.variant_id}`}
          className="flex flex-col min-[581px]:grid min-[581px]:grid-cols-[3fr_4fr_2fr] items-center border-b border-gray-300 py-5 gap-4 min-[581px]:gap-2 text-center min-[581px]:text-left"
        >
          <div className="flex items-center gap-4 w-full min-[581px]:w-auto">
            <button
              onClick={() => {
                const variantId = Number(item.variant_id);
                if (wishlistPendingRef.current[variantId]) {
                  return;
                }

                wishlistPendingRef.current[variantId] = true;
                dispatch(toggleWishlist({ product: item, userId: user?.id as string }))
                  .finally(() => {
                    wishlistPendingRef.current[variantId] = false;
                  });
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <RxCross2 size={20} />
            </button>
            <Link href={`${APP_ROUTE.product}/${item.id}?variantId=${item.variant_id}`} className="flex items-center gap-4 text-left">
              <div className="shrink-0 bg-[#F3F5F7] rounded overflow-hidden flex items-center justify-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain hover:scale-105 transition-transform mix-blend-multiply" />
              </div>
              <div>
                <p className="font-semibold hover:underline line-clamp-1">{item.name}</p>
                <p className="text-gray-400 text-sm">Color: {item.color}</p>
              </div>
            </Link>
          </div>

          <div className="font-semibold min-[581px]:text-center w-full min-[581px]:w-auto">
            <span className="min-[581px]:hidden text-gray-400 font-medium mr-2">Price:</span>
            {formatCurrency(item.price)}
          </div>

          <div className="w-full min-[581px]:w-auto">
            <button
              onClick={() => {
                requireLogin(() => {
                  const existing = cartItems?.find(i => Number(i.variant_id) === Number(item.variant_id));
                  dispatch(addToCart({ userId: user?.id, item }));
                  if (existing) {
                    toast.success("Quantity updated");
                  } else {
                    toast.success("Item added");
                  }
                }, user);
              }}
              className="w-full min-[581px]:w-auto bg-black text-white rounded-lg px-6 py-2.5 min-[581px]:py-2 hover:bg-gray-800 transition text-sm font-medium"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
      />

      <LoginModal />
    </div>
  );
}
