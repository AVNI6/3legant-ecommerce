"use client"
import { useAppDispatch } from "@/store/hooks";
import { updateQuantity, setQuantity, updateCartItemQuantity } from "@/store/slices/cartSlice";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";

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
  stock = 100,
  onQuantityChange,
  maxWidth = "w-20 sm:w-24 lg:w-32",
}: Props) => {
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = useState(String(quantity));
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Synchronize local input value with prop if it changes and we're not debouncing
    if (!debounceRef.current) {
      setInputValue(String(quantity));
    }
  }, [quantity]);

  const handleUpdate = async (type: "inc" | "dec") => {
    const nextVal = type === "inc" ? quantity + 1 : quantity - 1;

    // Boundary check using prop stock (now reliably fetched)
    if (type === "inc" && quantity >= stock) {
      return;
    }

    if (nextVal >= 1) {
      // 1. Immediate UI update
      if (variant_id) {
        dispatch(updateCartItemQuantity({ variant_id, quantity: nextVal }));
        // 2. Trigger async DB update
        dispatch(updateQuantity({ variant_id, type }));
      } else if (onQuantityChange) {
        onQuantityChange(nextVal);
      }
    }
  };

  const syncToDatabase = (val: number) => {
    if (variant_id) {
      dispatch(setQuantity({ variant_id, quantity: val }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      const finalValue = Math.min(numValue, stock);

      // 1. Immediate UI update via synchronous Redux action
      if (variant_id) {
        dispatch(updateCartItemQuantity({ variant_id, quantity: finalValue }));
      }

      // 2. Parent callback (if any)
      if (onQuantityChange) {
        onQuantityChange(finalValue);
      }

      // 3. Debounced Database/GuestCart update
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        syncToDatabase(finalValue);
        debounceRef.current = null;
      }, 500);
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10);
    let finalValue = numValue;

    if (isNaN(numValue) || numValue < 1) {
      finalValue = 1;
    } else if (numValue > stock) {
      finalValue = stock;
    }

    setInputValue(String(finalValue));

    // Force sync on blur if different
    if (finalValue !== quantity) {
      if (variant_id) {
        dispatch(updateCartItemQuantity({ variant_id, quantity: finalValue }));
        syncToDatabase(finalValue);
      } else if (onQuantityChange) {
        onQuantityChange(finalValue);
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
        className={`text-lg sm:text-xl font-medium focus:outline-none transition-colors ${quantity <= 1 ? "text-gray-300 cursor-not-allowed" : "text-black hover:text-gray-600"
          }`}
        disabled={quantity <= 1}
      >
        -
      </button>
      <input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="text-sm sm:text-base font-semibold w-8 sm:w-12 text-center bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={() => handleUpdate("inc")}
        className={`text-lg sm:text-xl font-medium focus:outline-none transition-colors ${maxReached ? "text-gray-300 cursor-not-allowed" : "text-black hover:text-gray-600"
          }`}
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
