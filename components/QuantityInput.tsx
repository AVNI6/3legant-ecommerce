"use client";

import { useAppDispatch } from "@/store/hooks";
import { updateQuantity } from "@/store/slices/cartSlice";
import { toast } from "react-toastify";

interface Props {
  quantity: number;
  variant_id?: number;
  stock?: number;
  onQuantityChange?: (val: number) => void;
  maxWidth?: string;
}

const QuantityInput = ({
  quantity,
  variant_id,
  stock = 100, // Default fallback
  onQuantityChange,
  maxWidth = "w-20 sm:w-24 lg:w-32",
}: Props) => {
  const dispatch = useAppDispatch();

  const handleUpdate = async (type: "inc" | "dec") => {
    if (type === "inc") {
      if (quantity >= stock) {
        toast.warn("Item out of stock");
        return;
      }
      if (variant_id) {
        dispatch(updateQuantity({ variant_id, type: "inc" }));
      } else if (onQuantityChange) {
        onQuantityChange(quantity + 1);
      }
    } else {
      if (quantity > 1) {
        if (variant_id) {
          dispatch(updateQuantity({ variant_id, type: "dec" }));
        } else if (onQuantityChange) {
          onQuantityChange(quantity - 1);
        }
      }
    }
  };

  const maxReached = quantity >= stock;

  return (
    <div
      className={`flex items-center justify-between border border-gray-300 rounded-lg px-2 sm:px-4 py-2 ${maxWidth} transition-all`}
    >
      <button
        onClick={() => handleUpdate("dec")}
        className={`text-lg sm:text-xl font-medium focus:outline-none transition-colors ${
          quantity <= 1 ? "text-gray-300 cursor-not-allowed" : "text-black hover:text-gray-600"
        }`}
        disabled={quantity <= 1}
      >
        -
      </button>
      <span className="text-sm sm:text-base font-semibold w-4 sm:w-6 text-center select-none">
        {quantity}
      </span>
      <button
        onClick={() => handleUpdate("inc")}
        className={`text-lg sm:text-xl font-medium focus:outline-none transition-colors ${
          maxReached ? "text-gray-300 cursor-not-allowed" : "text-black hover:text-gray-600"
        }`}
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
