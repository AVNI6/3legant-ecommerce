"use client";

import { useEffect, useState, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setShipping } from "@/store/slices/cartSlice";
import { fetchAddresses, selectAddresses } from "@/store/slices/addressSlice";
import { CheckoutDetailSkeleton } from "@/components/ui/skeleton";
import { Address, CartItem } from "@/types";
import { validateCoupon, removeCoupon, fetchAvailableCoupons } from "@/store/slices/couponSlice";
import { supabase } from "@/lib/supabase/client"
import Link from "next/link";
import { toast } from "react-toastify"
import { useSessionStorage } from "@/lib/hooks/useSessionStorage";

import CheckoutForm from "./CheckoutForm";
import CheckoutOrderSummary from "./CheckoutOrderSummary";

export type CheckoutFormData = Address & {
  email: string;
  differentBilling?: boolean;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  payment: "card" | "upi";
  sourceAddressId?: string; // Tracks which account address was used for auto-fill
};

const LOCATION_OPTIONS = {
  india: {
    states: ["Gujarat", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"],
    cities: {
      Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
      Delhi: ["New Delhi", "Dwarka", "Rohini", "Saket"],
      Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubli"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    },
  },
  usa: {
    states: ["California", "Texas", "Florida", "New York", "Illinois"],
    cities: {
      California: ["Los Angeles", "San Diego", "San Jose", "San Francisco"],
      Texas: ["Houston", "Dallas", "Austin", "San Antonio"],
      Florida: ["Miami", "Orlando", "Tampa", "Jacksonville"],
      "New York": ["New York City", "Buffalo", "Albany", "Rochester"],
      Illinois: ["Chicago", "Aurora", "Naperville", "Springfield"],
    },
  },
} as const;

type CountryKey = keyof typeof LOCATION_OPTIONS;

type ShippingMethod = {
  id: number;
  name: string;
  type: "fixed" | "percentage";
  price: number | null;
  percentage: number | null;
};

const SHIPPING_METHODS_CACHE_KEY = "shipping-methods-cache-v1";
const SHIPPING_METHODS_CACHE_TTL_MS = 1000 * 60 * 10;

const readShippingMethodsCache = (): ShippingMethod[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SHIPPING_METHODS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { ts?: number; methods?: ShippingMethod[] };
    if (!parsed?.ts || !Array.isArray(parsed.methods)) return [];
    if (Date.now() - parsed.ts > SHIPPING_METHODS_CACHE_TTL_MS) return [];
    return parsed.methods;
  } catch {
    return [];
  }
};

const writeShippingMethodsCache = (methods: ShippingMethod[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SHIPPING_METHODS_CACHE_KEY,
      JSON.stringify({ ts: Date.now(), methods })
    );
  } catch {
    // Non-critical cache write failure.
  }
};

type SavedCheckoutAddress = {
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
  address_type?: string;
  is_default?: boolean;
};

const getStateOptions = (country?: string) => {
  const normalizedCountry = (country || "").toLowerCase() as CountryKey;
  return LOCATION_OPTIONS[normalizedCountry]?.states ?? [];
};

function CheckoutDetail() {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state: any) => state.auth);
  const cartItems = useAppSelector((state: any) => state.cart.items);
  const shippingCost = useAppSelector((state: any) => state.cart.shippingCost);
  const selectedShipping = useAppSelector((state: any) => state.cart.selectedShipping);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(() => {
    const cached = readShippingMethodsCache();
    if (cached.length > 0) return cached;
    return [{ id: 1, name: "Free Shipping", type: "fixed", price: 0, percentage: null }];
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-set Free Shipping if none selected (for direct checkout access)
  useEffect(() => {
    if (isMounted && cartItems.length > 0 && !selectedShipping) {
      dispatch(setShipping({ name: "Free Shipping", cost: 0 }));
    }
  }, [isMounted, selectedShipping, cartItems.length, dispatch]);
  const coupon = useAppSelector((state: any) => state.coupon.coupon);
  const couponMessage = useAppSelector((state: any) => state.coupon.message);
  const suggestions = useAppSelector((state: any) => state.coupon.suggestions);
  const cartLoading = useAppSelector((state: any) => state.cart.loading);
  const couponLoading = useAppSelector((state: any) => state.coupon.loading);
  const addresses = useAppSelector(selectAddresses);
  const addressLoading = useAppSelector((state: any) => state.addresses.loading);
  const isSyncing = cartLoading || couponLoading;

  const subtotal = useMemo(() =>
    cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
    [cartItems]
  );
  const discountAmount = coupon ? coupon.discount : 0;
  const total = subtotal + shippingCost - discountAmount;

  const computeShippingCost = (method: ShippingMethod, baseSubtotal: number) => {
    if (method.type === "fixed") return Number(method.price ?? 0);
    return Number(baseSubtotal) * Number(method.percentage ?? 0);
  };

  const revalidateAppliedCoupon = async () => {
    if (coupon) {
      const result = await dispatch(validateCoupon({ code: coupon.code, subtotal }));
      return validateCoupon.fulfilled.match(result);
    }
    return true;
  };

  // Checks if the draft contains manual typing (non-empty fields)
  const hasPendingCheckoutData = (draft: Partial<CheckoutFormData> | undefined): boolean => {
    if (!draft) return false;
    const checkoutFields = [
      'firstName', 'lastName', 'phone', 'street', 'city', 'state', 'zip', 'country',
      'billingStreet', 'billingCity', 'billingState', 'billingZip', 'billingCountry'
    ] as const;
    return checkoutFields.some(field => {
      const value = draft[field as keyof CheckoutFormData];
      return value !== undefined && value !== null && value !== '' && value !== false;
    });
  };

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormData>()

  const payment = watch("payment");
  const [loading, setLoading] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [checkoutDraft, setCheckoutDraft] = useSessionStorage<Partial<CheckoutFormData>>("checkout-form-draft", {});
  const [code, setCode] = useState("")
  const lastCouponValidationKeyRef = useRef<string | null>(null);
  const shippingCountry = watch("country");
  const billingCountry = watch("billingCountry") || shippingCountry;

  const shippingStateOptions = getStateOptions(shippingCountry);
  const billingStateOptions = getStateOptions(billingCountry);
  const shippingAddressPreview = {
    firstName: watch("firstName"),
    lastName: watch("lastName"),
    phone: watch("phone"),
    street: watch("street"),
    city: watch("city"),
    state: watch("state"),
    zip: watch("zip"),
    country: watch("country"),
  };

  const hydrationRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadShippingMethods = async () => {
      try {
        const { data, error } = await supabase
          .from("shipping_methods")
          .select("id, name, type, price, percentage")
          .order("id", { ascending: true });

        if (error) throw error;

        if (mounted && data && data.length > 0) {
          const methods = data as ShippingMethod[];

          if (selectedShipping && !methods.some((method) => method.name === selectedShipping.name)) {
            methods.push({
              id: -1,
              name: selectedShipping.name,
              type: "fixed",
              price: selectedShipping.cost,
              percentage: null,
            });
          }

          setShippingMethods(methods);
          writeShippingMethodsCache(methods);
        }
      } catch (err) {
        console.error("[CHECKOUT] Failed to load shipping methods:", err);
      }
    };

    void loadShippingMethods();

    return () => {
      mounted = false;
    };
  }, [selectedShipping]);

  useEffect(() => {
    if (!shippingMethods.length) return;

    const selectedName = selectedShipping?.name;
    const selectedMethod = selectedName
      ? shippingMethods.find((method) => method.name === selectedName)
      : shippingMethods[0];

    // Keep user's cart-selected method until full method list arrives.
    if (selectedName && !selectedMethod) return;

    if (!selectedMethod) return;

    const nextShippingCost = computeShippingCost(selectedMethod, subtotal);
    if (
      !selectedShipping ||
      selectedShipping.name !== selectedMethod.name ||
      selectedShipping.cost !== nextShippingCost
    ) {
      dispatch(setShipping({ name: selectedMethod.name, cost: nextShippingCost }));
    }
  }, [dispatch, selectedShipping, shippingMethods, subtotal]);

  // SMART CONSOLIDATED INITIALIZATION: Syncs with Account changes and detects ID switches
  useEffect(() => {
    if (!isMounted || addressLoading || authLoading || hydrationRef.current) return;

    const draftHasData = hasPendingCheckoutData(checkoutDraft);

    // Get current default address from account
    const defaultAddr = addresses.find((a: any) => a.is_default && a.address_type === 'shipping')
      || addresses.find((a: any) => a.is_default)
      || addresses.find((a: any) => a.address_type === 'shipping' || !a.address_type);

    const currentDefaultId = (defaultAddr as any)?.id;
    const draftSourceId = checkoutDraft.sourceAddressId;

    // RULE 1: If Account Default ID has changed, we MUST re-fill (global override)
    const defaultHasChanged = currentDefaultId && draftSourceId && currentDefaultId !== draftSourceId;

    if (defaultHasChanged) {
    }

    if (draftHasData && !defaultHasChanged) {
      if (!draftHydrated) {
        reset(checkoutDraft as CheckoutFormData, { keepDefaultValues: true });
        setDraftHydrated(true);
        hydrationRef.current = true; // 🛡️ LOCK: Only hydrate once
      }
      return;
    }

    if (defaultAddr) {
      const finalData: Partial<CheckoutFormData> = {
        firstName: defaultAddr.first_name || defaultAddr.firstName || "",
        lastName: defaultAddr.last_name || defaultAddr.lastName || "",
        phone: defaultAddr.phone || "",
        street: defaultAddr.street || "",
        city: defaultAddr.city || "",
        state: defaultAddr.state || "",
        zip: defaultAddr.zip || "",
        country: (defaultAddr.country || "").toLowerCase(),
        payment: checkoutDraft.payment || "card",
        email: user?.email || checkoutDraft.email || "",
        sourceAddressId: currentDefaultId,
      };

      reset(finalData as CheckoutFormData, { keepDefaultValues: true });

      // Update session storage immediately to reflect the new source ID
      setCheckoutDraft(finalData);
      setDraftHydrated(true);
      hydrationRef.current = true; // 🛡️ LOCK: Only hydrate once
    } else {
      if (!draftHydrated) {
        setDraftHydrated(true);
        hydrationRef.current = true;
      }
    }
  }, [isMounted, addressLoading, authLoading, addresses, checkoutDraft, user?.email, reset, draftHydrated]);

  // 💾 SAVE PROGRESS (Debounced for performance)
  useEffect(() => {
    if (!draftHydrated) return;

    const subscription = watch((value) => {
      setCheckoutDraft(value as Partial<CheckoutFormData>);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [watch, setCheckoutDraft, draftHydrated]);

  // Always dispatch - let the thunk decide if it should actually fetch based on cache
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAddresses(user.id));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    dispatch(fetchAvailableCoupons());
  }, [dispatch]);

  // Revalidate coupon only when coupon code + subtotal pair changes.
  useEffect(() => {
    if (!coupon?.code) {
      lastCouponValidationKeyRef.current = null;
      return;
    }

    const nextValidationKey = `${coupon.code}:${subtotal}`;
    if (lastCouponValidationKeyRef.current === nextValidationKey) {
      return;
    }

    lastCouponValidationKeyRef.current = nextValidationKey;
    void dispatch(validateCoupon({ code: coupon.code, subtotal }));
  }, [coupon?.code, subtotal, dispatch]);

  const handleApplyCoupon = async () => {
    if (!code) return;
    await dispatch(validateCoupon({ code, subtotal }));
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCode("");
    lastCouponValidationKeyRef.current = null;
  };

  const handleShippingMethodChange = (method: ShippingMethod) => {
    dispatch(setShipping({ name: method.name, cost: computeShippingCost(method, subtotal) }));
  };

  const handleShippingAddressChange = (address: SavedCheckoutAddress) => {
    const currentValues = getValues();
    const nextValues: CheckoutFormData = {
      ...currentValues,
      firstName: address.firstName || address.first_name || currentValues.firstName || "",
      lastName: address.lastName || address.last_name || currentValues.lastName || "",
      phone: address.phone || currentValues.phone || "",
      street: address.street || currentValues.street || "",
      city: address.city || currentValues.city || "",
      state: address.state || currentValues.state || "",
      zip: address.zip || currentValues.zip || "",
      country: (address.country || currentValues.country || "").toLowerCase(),
      sourceAddressId: address.id,
      email: currentValues.email || user?.email || checkoutDraft.email || "",
    };

    reset(nextValues, { keepDefaultValues: true });
    setCheckoutDraft(nextValues);
  };

  const buildBillingAddress = (data: CheckoutFormData) => ({
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    street: data.differentBilling ? (data.billingStreet || data.street) : data.street,
    city: data.differentBilling ? (data.billingCity || data.city) : data.city,
    state: data.differentBilling ? (data.billingState || data.state) : data.state,
    zip: data.differentBilling ? (data.billingZip || data.zip) : data.zip,
    country: data.differentBilling ? (data.billingCountry || data.country) : data.country,
  });

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const handleCheckout = async (data: CheckoutFormData) => {
    if (loading) return;
    setCheckoutDraft(data);

    if (!cartItems.length) return toast.error("Cart is empty");
    if (!payment) return toast.error("Please select a payment method");
    if (!selectedShipping) return toast.error("Please select a shipping method");
    if (!user?.id) return toast.error("You must be logged in to continue");
    if (payment === "upi" && data.country?.toLowerCase() !== "india") {
      return toast.error("UPI is only available for India");
    }
    if (payment === "upi" && total < 50) {
      return toast.error("UPI checkout requires a minimum payable amount of Rs 50");
    }

    if (coupon) {
      const stillValid = await revalidateAppliedCoupon();
      if (!stillValid) return toast.error("Coupon expired");
    }

    if (isSyncing) return toast.info("Please wait for cart to update...");

    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("You must be logged in to continue to payment");
      }

      const shippingAddress = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      };

      const billingAddress = buildBillingAddress(data);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item: CartItem) => ({
            productId: item.id,
            variantId: item.variant_id,
            quantity: item.quantity,
          })),
          cartSnapshot: cartItems.map((item: CartItem) => ({
            id: item.id,
            variant_id: item.variant_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            image: item.image,
          })),
          paymentMethod: payment,
          shippingAmount: shippingCost,
          shippingMethod: selectedShipping.name,
          discountAmount,
          totalAmount: total,
          country: data.country,
          shippingAddress,
          billingAddress,
          couponCode: coupon?.code,
          successUrl: `${window.location.origin}${APP_ROUTE.cartCheckoutResult("success")}`,
          cancelUrl: `${window.location.origin}${APP_ROUTE.cartCheckoutResult("cancel")}`,
          metadata: {
            userId: user.id,
            paymentMethod: payment,
            couponCode: coupon?.code || "",
            shippingAddress: JSON.stringify(shippingAddress), // 📍 RESTORED: Metadata for fulfillment
            billingAddress: JSON.stringify(billingAddress),   // 📍 RESTORED: Metadata for fulfillment
          },
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Checkout failed");
      }

      const { url } = payload;
      if (url) {
        window.location.href = url;
        return;
      }

      throw new Error("Stripe checkout URL not returned");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  if (!isMounted || authLoading || (cartLoading && cartItems.length === 0)) {
    return <CheckoutDetailSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(handleCheckout)} onKeyDown={handleFormKeyDown}>
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 w-full text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 line-clamp-1">No products added</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Your checkout list is currently empty. Please add some items to your cart before proceeding to payment.
            </p>
          </div>
          <Link
            href="/pages/product"
            className="bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg hover:scale-105 active:scale-95"
          >
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 min-[375px]:gap-6 lg:gap-6 xl:gap-10 px-3 min-[375px]:px-5 sm:px-10 lg:px-10 xl:px-30 items-start my-4 min-[375px]:my-6 sm:my-10">
          <CheckoutForm
            register={register}
            errors={errors}
            watch={watch}
            shippingStateOptions={shippingStateOptions}
            billingStateOptions={billingStateOptions}
            loading={loading}
            isSyncing={isSyncing}
          />
          <CheckoutOrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            shippingMethods={shippingMethods}
            selectedShipping={selectedShipping}
            addresses={addresses as SavedCheckoutAddress[]}
            shippingAddress={shippingAddressPreview}
            selectedAddressId={checkoutDraft.sourceAddressId}
            onShippingMethodChange={handleShippingMethodChange}
            onShippingAddressChange={handleShippingAddressChange}
            coupon={coupon}
            couponMessage={couponMessage}
            suggestions={suggestions}
            code={code}
            setCode={setCode}
            handleApplyCoupon={handleApplyCoupon}
            handleRemoveCoupon={handleRemoveCoupon}
            isOffersOpen={isOffersOpen}
            setIsOffersOpen={setIsOffersOpen}
          />

          {/* Mobile/Tablet Only Button: Appears after Order Summary */}
          <button
            type="submit"
            disabled={loading || isSyncing}
            className="lg:hidden bg-black text-white py-3.5 mt-4 w-full rounded-lg disabled:opacity-50 font-semibold text-sm shadow-sm active:scale-[0.98] transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : isSyncing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Syncing Price...</span>
              </div>
            ) : (
              "Continue to Payment"
            )}
          </button>
        </div>
      )}
    </form>
  );
}

export default CheckoutDetail;