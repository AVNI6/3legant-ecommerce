"use client";

import { useMemo, useState } from "react";
import { CartItem } from "@/types";
import QuantityInput from "@/components/QuantityInput";
import { formatCurrency } from "@/constants/Data";
import { RxCross2 } from "react-icons/rx";
import { RiCoupon4Line, RiDiscountPercentLine } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { removeFromCart } from "@/store/slices/cartSlice";
import { validateCoupon } from "@/store/slices/couponSlice";
import Link from "next/link";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { useAppDispatch } from "@/store/hooks";
import { useClickOutside } from "@/hooks/use-click-outside";

type Coupon = {
  code: string;
  discount: number;
} | null;

type OfferSuggestion = {
  id: string | number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order?: number;
};

type AddressOption = {
  id?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  address_label?: string;
  is_default?: boolean;
};

interface CheckoutOrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingMethods: Array<{ id: number; name: string; type: "fixed" | "percentage"; price: number | null; percentage: number | null }>;
  selectedShipping: { name: string; cost: number } | null;
  addresses: AddressOption[];
  shippingAddress: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  selectedAddressId?: string;
  onShippingMethodChange: (method: { id: number; name: string; type: "fixed" | "percentage"; price: number | null; percentage: number | null }) => void;
  onShippingAddressChange: (address: AddressOption) => void;
  coupon: Coupon;
  couponMessage: string;
  suggestions: OfferSuggestion[];
  code: string;
  setCode: (code: string) => void;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  isOffersOpen: boolean;
  setIsOffersOpen: (open: boolean) => void;
  isShippingOpen: boolean;
  setIsShippingOpen: (open: boolean) => void;
}

export default function CheckoutOrderSummary({
  cartItems,
  subtotal,
  shippingCost,
  total,
  shippingMethods,
  selectedShipping,
  addresses,
  shippingAddress,
  selectedAddressId,
  onShippingMethodChange,
  onShippingAddressChange,
  coupon,
  couponMessage,
  suggestions,
  code,
  setCode,
  handleApplyCoupon,
  handleRemoveCoupon,
  isOffersOpen,
  setIsOffersOpen,
  isShippingOpen,
  setIsShippingOpen,
}: CheckoutOrderSummaryProps) {
  const dispatch = useAppDispatch();
  const shippingDropdownRef = useClickOutside(() => setIsShippingOpen(false));


  const handleRemoveItem = (variantId: number) => dispatch(removeFromCart(variantId));
  const currentShipping = useMemo(() => {
    if (selectedShipping) return selectedShipping;
    const fallback = shippingMethods[0];
    return fallback ? { name: fallback.name, cost: shippingCost } : null;
  }, [selectedShipping, shippingCost, shippingMethods]);


  const renderShippingCost = (method: { type: "fixed" | "percentage"; price: number | null; percentage: number | null }) => {
    if (method.type === "percentage") {
      return `${Number(method.percentage ?? 0)}% of subtotal`;
    }

    return formatCurrency(Number(method.price ?? 0));
  };


  return (
    <div className="w-full lg:w-1/3 self-start">
      <aside className="border rounded-lg p-3 min-[375px]:p-4 sm:p-5 sticky top-6 bg-white shadow-sm">
        <h1 className="pb-2 min-[375px]:pb-4 font-semibold text-sm min-[375px]:text-base sm:text-lg lg:text-lg border-b mb-2 min-[375px]:mb-4">Order Summary</h1>

        <div className={`space-y-2 min-[375px]:space-y-4 ${cartItems.length > 3 ? "max-h-[360px] overflow-y-auto pr-1" : ""}`}>
          {cartItems.map((item: CartItem) => (
            <div key={item.variant_id} className="flex max-[342px]:justify-between items-center gap-2 min-[375px]:gap-4 py-2 min-[375px]:py-3 group">
              <Link href={`${APP_ROUTE.product}/${item.id}?variantId=${item.variant_id}`} className="shrink-0 bg-[#F3F5F7] rounded overflow-hidden flex items-center justify-center">
                <img
                  src={item.image}
                  className="w-12 h-12 min-[343px]:w-14 min-[343px]:h-14 sm:min-[343px]:w-20 sm:min-[343px]:h-20 object-contain shadow-sm transition-transform group-hover:scale-105 mix-blend-multiply"
                  alt={item.name}
                />
              </Link>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-1 min-[375px]:gap-2">
                  <Link href={`${APP_ROUTE.product}/${item.id}?variantId=${item.variant_id}`}>
                    <p className="font-semibold text-[10px] min-[375px]:text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-1 group-hover:underline leading-tight mt-0.5">
                      {item.name}
                    </p>
                  </Link>
                  <p className="font-bold text-[10px] min-[375px]:text-xs sm:text-sm md:text-base shrink-0 mt-0.5">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                <p className="text-gray-400 text-[9px] min-[375px]:text-[11px] sm:text-xs mt-0.5 mb-1">Color: {item.color}</p>

                <div className="flex items-center justify-between mt-1 min-[375px]:mt-2">
                  <QuantityInput quantity={item.quantity} variant_id={item.variant_id} stock={item.stock} allowZero={true} maxWidth="w-20 sm:w-24" />

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
                <IoIosArrowDown
                  className={`md:hidden transition-transform duration-300 ${isOffersOpen ? "rotate-180" : ""}`}
                  size={20}
                />
              </button>

              <div className={`mt-3 ${isOffersOpen ? "block" : "hidden md:block"} animate-in fade-in duration-300`}>
                <div
                  className={`
                      ${suggestions.length > 2
                      ? "flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1"
                      : "grid grid-cols-1 gap-3"
                    }
                    `}
                >
                  {suggestions.map((s) => {
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

        <div
          ref={shippingDropdownRef}
          className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm p-4 transition-all duration-300 min-h-[96px] flex flex-col justify-center overflow-visible"
        >
          {isShippingOpen ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select Shipping</span>
                <button type="button" onClick={() => setIsShippingOpen(false)} className="text-[10px] font-black uppercase text-black hover:underline underline-offset-4">Cancel</button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {shippingMethods.slice(0, 3).map((method) => {
                  const isSelected = selectedShipping?.name === method.name;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onShippingMethodChange(method);
                        setIsShippingOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${isSelected ? "border-black bg-gray-50 shadow-sm" : "border-gray-50 bg-white hover:border-gray-200"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-black bg-black" : "border-gray-300 group-hover:border-gray-400"}`}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white transition-transform duration-200 scale-100" />}
                        </div>
                        <span className="text-[12px] font-bold text-gray-900 leading-tight">{method.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-gray-900">{renderShippingCost(method)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1.5">Shipping Method</span>
                <p className="text-[13px] font-bold text-gray-900 truncate leading-none mb-1">{currentShipping?.name || "Select shipping"}</p>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{currentShipping ? formatCurrency(currentShipping.cost) : "No method selected"}</p>
              </div>
              <button
                type="button"
                onClick={() => { setIsShippingOpen(true); }}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:border-black hover:text-black transition-all hover:shadow-md"
              >
                Change
              </button>
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
