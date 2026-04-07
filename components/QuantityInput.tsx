"use client"
import { useAppDispatch } from "@/store/hooks";
import { setQuantity, updateCartItemQuantity } from "@/store/slices/cartSlice";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";

interface Props {
  quantity: number;
  variant_id?: number;
  stock?: number;
  onQuantityChange?: (val: number) => void;
  maxWidth?: string;
  allowZero?: boolean; // True for Cart/Checkout/Drawer, False for Detail Page
}

const QuantityInput = ({
  quantity,
  variant_id,
  stock = 100,
  onQuantityChange,
  maxWidth = "w-20 sm:w-24 lg:w-32",
  allowZero = false,
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

  const handleUpdate = (type: "inc" | "dec") => {
    const minLimit = allowZero ? 0 : 1;
    const nextVal = type === "inc" ? quantity + 1 : quantity - 1;

    if (type === "inc" && quantity >= stock) {
      toast.warning(`Total stock limit of ${stock} reached`);
      return;
    }

    if (nextVal >= minLimit) {
      if (variant_id) {
        // Mode: Cart Item Update
        dispatch(updateCartItemQuantity({ variant_id, quantity: nextVal }));
        dispatch(setQuantity({ variant_id, quantity: nextVal }));
      } else if (onQuantityChange) {
        // Mode: Local Selection (Detail Page)
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
    const minLimit = allowZero ? 0 : 1;

    if (!isNaN(numValue) && numValue >= minLimit) {
      if (numValue > stock) {
        toast.warning(`Quantity capped at available stock (${stock})`);
      }
      const finalValue = Math.min(numValue, stock);

      if (variant_id) {
        dispatch(updateCartItemQuantity({ variant_id, quantity: finalValue }));
      }

      if (onQuantityChange) {
        onQuantityChange(finalValue);
      }

      // Debounced persistence for cart items
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        syncToDatabase(finalValue);
        debounceRef.current = null;
      }, 500);
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10);
    const minLimit = allowZero ? 0 : 1;
    let finalValue = numValue;

    if (isNaN(numValue) || numValue < minLimit) {
      finalValue = minLimit;
    } else if (numValue > stock) {
      finalValue = stock;
    }

    setInputValue(String(finalValue));

    if (finalValue !== quantity) {
      if (variant_id) {
        dispatch(updateCartItemQuantity({ variant_id, quantity: finalValue }));
        syncToDatabase(finalValue);
      } else if (onQuantityChange) {
        onQuantityChange(finalValue);
      }
    }
  };

  const isAtMin = quantity <= (allowZero ? 0 : 1);
  const isAtMax = quantity >= stock;

  return (
    <div
      className={`flex items-center justify-between border border-gray-300 rounded-lg px-1 py-1 sm:px-4 sm:py-2 ${maxWidth} transition-all`}
    >
      <button
        type="button"
        onClick={() => handleUpdate("dec")}
        className={`text-lg sm:text-xl font-medium focus:outline-none transition-colors ${
          isAtMin ? "text-gray-300 cursor-not-allowed" : "text-black hover:text-gray-600"
        }`}
        disabled={isAtMin}
      >
        -
      </button>
      <input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="text-xs sm:text-base font-semibold w-8 sm:w-12 text-center bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => handleUpdate("inc")}
        className={`text-lg sm:text-xl font-medium focus:outline-none transition-colors ${
          isAtMax ? "text-gray-300 cursor-not-allowed" : "text-black hover:text-gray-600"
        }`}
        disabled={isAtMax}
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
