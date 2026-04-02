import { useAppDispatch } from "@/store/hooks";
import { updateQuantity, setQuantity } from "@/store/slices/cartSlice";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

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
  const [inputValue, setInputValue] = useState(String(quantity));

  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      const finalValue = Math.min(numValue, stock);
      if (variant_id) {
        dispatch(setQuantity({ variant_id, quantity: finalValue }));
      } else if (onQuantityChange) {
        onQuantityChange(finalValue);
      }
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 1) {
      setInputValue("1");
      if (variant_id) {
        dispatch(setQuantity({ variant_id, quantity: 1 }));
      } else if (onQuantityChange) {
        onQuantityChange(1);
      }
    } else if (numValue > stock) {
      setInputValue(String(stock));
      if (variant_id) {
        dispatch(setQuantity({ variant_id, quantity: stock }));
      } else if (onQuantityChange) {
        onQuantityChange(stock);
      }
    } else {
      setInputValue(String(numValue));
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
