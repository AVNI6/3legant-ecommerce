"use client";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";

type CartProduct = {
  id: number;
  variant_id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  quantity?: number;
  stock?: number;
  rating?: number;
};

type Props = {
  product: CartProduct;
  className?: string;
};

export default function AddToCartButton({ product, className }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);

  const handleClick = async () => {
    if ((product.stock ?? 0) <= 0) return;

    const quantity = Math.max(1, Number(product.quantity ?? 1));
    const resultAction = await dispatch(
      addToCart({
        userId: user?.id,
        item: {
          id: product.id,
          variant_id: product.variant_id,
          name: product.name,
          price: product.price,
          image: product.image,
          color: product.color,
          rating: product.rating ?? 0,
          stock: product.stock ?? 0,
        },
        quantity,
      })
    );

    if (addToCart.fulfilled.match(resultAction)) {
      const { limitReached } = resultAction.payload as any;
      if (limitReached) {
        toast.warning("Item out of stock");
      } else {
        toast.success("Item added");
      }
    } else if (addToCart.rejected.match(resultAction)) {
      const payload = resultAction.payload as any;
      if (payload?.limitReached) {
        toast.warning("Item out of stock");
      } else {
        toast.error(payload?.message || "Failed to add to cart");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      disabled={(product.stock ?? 0) <= 0}
    >
      {(product.stock ?? 0) <= 0 ? "Out of stock" : "Add to cart"}
    </button>
  );
}
