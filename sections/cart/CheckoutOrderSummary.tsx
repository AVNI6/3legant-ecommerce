"use client";

import { CartItem } from "@/types";
import QuantityInput from "@/components/QuantityInput";
import { formatCurrency } from "@/constants/Data";
import { RxCross2 } from "react-icons/rx";
import { RiCoupon4Line, RiDiscountPercentLine } from "react-icons/ri";
import { useAppDispatch } from "@/store/hooks";
import { removeFromCart } from "@/store/slices/cartSlice";
import { validateCoupon, removeCoupon } from "@/store/slices/couponSlice";

interface CheckoutOrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  coupon: any;
  couponMessage: string;
  suggestions: any[];
  code: string;
  setCode: (code: string) => void;
  handleApplyCoupon: () => void;
  isOffersOpen: boolean;
  setIsOffersOpen: (open: boolean) => void;
}

export default function CheckoutOrderSummary({
  cartItems,
  subtotal,
  shippingCost,
  total,
  coupon,
  couponMessage,
  suggestions,
  code,
  setCode,
  handleApplyCoupon,
  isOffersOpen,
  setIsOffersOpen,
}: CheckoutOrderSummaryProps) {
  const dispatch = useAppDispatch();

  const handleRemoveItem = (variantId: number) => dispatch(removeFromCart(variantId));
  const handleRemoveCoupon = () => dispatch(removeCoupon());

  return (
    <div className="mt-4 min-[375px]:mt-8 lg:mt-0 w-full lg:w-1/3">
      <aside className="border rounded-lg p-3 min-[375px]:p-4 sm:p-5 sticky top-[110px] lg:top-10 bg-white shadow-sm">
        <h1 className="pb-2 min-[375px]:pb-4 font-semibold text-sm min-[375px]:text-base sm:text-lg lg:text-lg border-b mb-2 min-[375px]:mb-4">Order Summary</h1>

        <div className="space-y-2 min-[375px]:space-y-4 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
          {cartItems.map((item: CartItem) => (
            <div key={item.variant_id} className="flex max-[342px]:justify-between items-center gap-2 min-[375px]:gap-4 py-2 min-[375px]:py-3 group">
              <img
                src={item.image}
                className="w-12 h-12 min-[343px]:w-14 min-[343px]:h-14 sm:min-[343px]:w-20 sm:min-[343px]:h-20 object-cover rounded shadow-sm transition-transform group-hover:scale-105 shrink-0"
                alt={item.name}
              />

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-1 min-[375px]:gap-2">
                  <p className="font-semibold text-[10px] min-[375px]:text-xs sm:text-sm md:text-base truncate min-[343px]:line-clamp-1 group-hover:underline leading-tight mt-0.5">
                    {item.name}
                  </p>
                  <p className="font-bold text-[10px] min-[375px]:text-xs sm:text-sm md:text-base shrink-0 mt-0.5">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <p className="text-gray-400 text-[9px] min-[375px]:text-[11px] sm:text-xs max-[342px]:hidden mt-0.5 mb-1">Color: {item.color}</p>

                <div className="flex items-center justify-between mt-1 min-[375px]:mt-2 max-[342px]:hidden">
                  <QuantityInput quantity={item.quantity} variant_id={item.variant_id} stock={item.stock} maxWidth="w-[60px] min-[375px]:w-20 sm:w-24" />

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.variant_id)}
                    className="text-red-500 text-[9px] min-[375px]:text-[11px] sm:text-xs hover:underline font-medium p-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="my-3 min-[375px]:my-4 border-gray-100" />

        <div className="mt-4 min-[375px]:mt-6">
          <div className="flex gap-2 items-center">
            <div className="flex flex-1 items-center gap-1 min-[375px]:gap-2 border border-gray-200 rounded-md min-[375px]:rounded-lg px-2 min-[375px]:px-3 py-2 min-[375px]:py-2.5 sm:py-3 focus-within:border-black transition-colors">
              <RiCoupon4Line className="text-gray-400 size-3 min-[375px]:size-4" />
              <input
                type="text"
                placeholder="Coupon Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent text-[9px] min-[375px]:text-xs sm:text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-4 min-[375px]:px-5 sm:px-6 py-2 min-[375px]:py-2.5 sm:py-3 bg-black text-white rounded-md min-[375px]:rounded-lg text-[10px] min-[375px]:text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Suggestions / Available Offers */}
          {suggestions.length > 0 && !coupon && (
            <div className="mt-5 border-t pt-4">
              <button
                type="button"
                onClick={() => setIsOffersOpen(!isOffersOpen)}
                className="flex flex-wrap items-center justify-between w-full text-xs font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 uppercase tracking-wider hover:bg-gray-100 transition-colors md:cursor-default"
              >
                <span className="flex items-center gap-2">
                  <RiDiscountPercentLine className="text-black" />
                  Available Offers
                </span>
                <span
                  className="md:hidden text-lg transition-transform"
                  style={{ transform: isOffersOpen ? "rotate(180deg)" : "none" }}
                >
                  ▼
                </span>
              </button>

              <div className={`mt-3 ${isOffersOpen ? "block" : "hidden md:block"} animate-in fade-in duration-300`}>
                <div
                  className={`
                      ${
                        suggestions.length > 2
                          ? "flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1"
                          : "grid grid-cols-1 gap-3"
                      }
                    `}
                >
                  {suggestions.map((s: any) => {
                    const isValid = subtotal >= (s.min_order || 0);
                    return (
                      <div
                        key={s.id}
                        className={`border-2 border-dashed p-3 rounded-xl flex-shrink-0 min-w-[150px] transition-all
                              ${isValid ? "border-green-200 bg-green-50/20" : "border-gray-100 bg-gray-50/50 opacity-70"}`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-black text-sm tracking-tight text-gray-800">{s.code}</span>
                          <RiDiscountPercentLine
                            className={isValid ? "text-green-600 size-4" : "text-gray-400 size-4"}
                          />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 mb-3">
                          {s.discount_type === "percentage"
                            ? `${s.discount_value}% OFF`
                            : `${formatCurrency(s.discount_value)} OFF`}
                        </p>
                        {isValid ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCode(s.code);
                              dispatch(validateCoupon({ code: s.code, subtotal }));
                            }}
                            className="w-full text-[10px] bg-black text-white py-1.5 rounded-lg font-black hover:bg-gray-800 transition shadow-sm active:scale-95"
                          >
                            CLAIM
                          </button>
                        ) : (
                          <p className="text-[9px] text-red-500 font-bold bg-red-50 py-1 px-2 rounded-md text-center">
                            Add {formatCurrency((s.min_order || 0) - subtotal)} more
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {couponMessage && <p className="text-red-500 text-[10px] sm:text-xs mt-2 font-medium">{couponMessage}</p>}

          {coupon && (
            <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-green-700 font-bold">
                <RiDiscountPercentLine className="size-5" />
                <span>{coupon.code}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-green-600">-{formatCurrency(coupon.discount)}</span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                >
                  <RxCross2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <hr className="my-3 min-[375px]:my-5 border-gray-100" />

        <div className="space-y-2 min-[375px]:space-y-3">
          <div className="flex justify-between text-[10px] min-[375px]:text-xs sm:text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[10px] min-[375px]:text-xs sm:text-sm text-gray-600">
            <span>Shipping</span>
            <span className="font-bold text-gray-900">{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-black text-sm min-[375px]:text-base sm:text-lg border-t border-gray-100 pt-2 min-[375px]:pt-4 mt-1 min-[375px]:mt-2 text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
