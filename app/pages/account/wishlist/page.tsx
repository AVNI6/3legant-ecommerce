"use client";
import { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { formatCurrency } from "@/constants/Data";
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin";
import { toast } from "react-toastify";
import { type CartItem } from "@/types";
import Link from "next/link";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist, fetchWishlist } from "@/store/slices/wishlistSlice";
import { WishlistPageSkeleton } from "@/components/ui/skeleton";

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const cartItems = useAppSelector((state: any) => state.cart.items) as CartItem[];
  const { items: wishlistItems, loading, initialized } = useAppSelector((state: any) => state.wishlist) as { items: CartItem[], loading: boolean, initialized: boolean };
  const { requireLogin, LoginModal } = useRequireLogin();

  useEffect(() => {
    if (user?.id && !initialized && !loading) {
      dispatch(fetchWishlist(user.id));
    }
  }, [user?.id, dispatch, initialized, loading]);

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
              onClick={() => dispatch(toggleWishlist({ product: item, userId: user?.id as string }))} 
              className="text-gray-400 hover:text-red-500"
            >
              <RxCross2 size={20} />
            </button>
            <Link href={`${APP_ROUTE.product}/${item.id}`} className="flex items-center gap-4 text-left">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded hover:scale-105" />
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
                  const existing = cartItems?.find(i => i.variant_id === item.variant_id);
                  dispatch(addToCart({ userId: user?.id, item }));
                  if (existing) {
                    toast.success(`Added another ${item.name}`);
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

      <LoginModal />
    </div>
  );
}