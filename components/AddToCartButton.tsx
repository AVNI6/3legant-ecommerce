"use client";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";

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
  onSuccess?: () => void;
};

export default function AddToCartButton({ product, className, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isPending, setIsPending] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const runAddToCart = async () => {
    if (Number(product.stock ?? 0) <= 0) {
      toast.warning("Item out of stock");
      return;
    }

    const requested = Math.max(1, Number(product.quantity ?? 1));
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
        quantity: requested,
      })
    );

    if (addToCart.fulfilled.match(resultAction)) {
      const payload = resultAction.payload as any;
      if (payload?.limitReached) {
        toast.warning(`Limited to stock (${payload.stock})`);
      } else {
        toast.success(payload?.alreadyInCart ? "Quantity updated" : "Item added to cart");
        if (onSuccess) onSuccess();
      }
    } else if (addToCart.rejected.match(resultAction)) {
      const payload = resultAction.payload as any;
      if (payload?.limitReached) {
        toast.warning("Insufficient stock");
      } else {
        toast.error(payload?.message || "Failed to add to cart");
      }
    }
  };

  const handleClick = () => {
    if (isPending) return;

    setIsPending(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await runAddToCart();
      } finally {
        setIsPending(false);
      }
    }, 220);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || Number(product.stock) <= 0}
      className={`${className} ${Number(product.stock) <= 0 ? "!bg-gray-400 !cursor-not-allowed hover:!bg-gray-400" : ""} ${isPending ? "!cursor-wait !bg-gray-600" : ""}`}
    >
      {Number(product.stock) <= 0 ? "Out of stock" : isPending ? "Adding..." : "Add to cart"}
    </button>
  );
}
