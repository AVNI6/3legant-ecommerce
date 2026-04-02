"use client";

import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { formatCurrency } from "@/constants/Data"
import { RxCross2 } from "react-icons/rx"
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromCart, setActiveStep } from "@/store/slices/cartSlice";
import { fetchAddresses, selectAddresses } from "@/store/slices/addressSlice";
import { CheckoutDetailSkeleton } from "@/components/ui/skeleton";
import { Address, CartItem } from "@/types";
import QuantityInput from "@/components/QuantityInput";
import { validateCoupon, removeCoupon, fetchAvailableCoupons } from "@/store/slices/couponSlice";
import { supabase } from "@/lib/supabase/client"
import { RiCoupon4Line, RiDiscountPercentLine } from "react-icons/ri"
import { toast } from "react-toastify"
import { AddressType } from "@/types/enums";
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

const getStateOptions = (country?: string) => {
  const normalizedCountry = (country || "").toLowerCase() as CountryKey;
  return LOCATION_OPTIONS[normalizedCountry]?.states ?? [];
};

const getCityOptions = (country?: string, state?: string) => {
  const normalizedCountry = (country || "").toLowerCase() as CountryKey;
  const citiesByState = LOCATION_OPTIONS[normalizedCountry]?.cities;
  if (!citiesByState || !state) return [];
  return citiesByState[state as keyof typeof citiesByState] ?? [];
};

function CheckoutDetail() {
  console.log("[DEBUG] Rendering CheckoutDetail")
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state: any) => state.auth);
  const cartItems = useAppSelector((state: any) => state.cart.items);
  const shippingCost = useAppSelector((state: any) => state.cart.shippingCost);
  const selectedShipping = useAppSelector((state: any) => state.cart.selectedShipping);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Strict validation: Prevent entering Tab 2 without selected shipping
  useEffect(() => {
    if (isMounted && cartItems.length > 0 && !selectedShipping) {
      toast.error("Please select a shipping method before checking out.");
      dispatch(setActiveStep(1));
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

  const handleRemoveItem = (variantId: number) => dispatch(removeFromCart(variantId));
  const handleRemoveCoupon = () => dispatch(removeCoupon());

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
    setValue,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormData>()

  const payment = watch("payment");
  const [loading, setLoading] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [checkoutDraft, setCheckoutDraft] = useSessionStorage<Partial<CheckoutFormData>>("checkout-form-draft", {});
  const differentBilling = watch("differentBilling");
  const [code, setCode] = useState("")
  const shippingCountry = watch("country");
  const shippingState = watch("state");
  const billingCountry = watch("billingCountry") || shippingCountry;
  const billingState = watch("billingState");

  const shippingStateOptions = getStateOptions(shippingCountry);
  const shippingCityOptions = getCityOptions(shippingCountry, shippingState);
  const billingStateOptions = getStateOptions(billingCountry);
  const billingCityOptions = getCityOptions(billingCountry, billingState);

  // SMART CONSOLIDATED INITIALIZATION: Syncs with Account changes and detects ID switches
  useEffect(() => {
    if (!isMounted || addressLoading || authLoading) return;

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
      console.log(`[CHECKOUT-INIT] Default address ID changed from ${draftSourceId} to ${currentDefaultId}. Forcing re-fill.`);
    }

    // CASE 1: Session draft already contains data. 
    // We only prioritize it if the Default Address hasn't changed globally.
    if (draftHasData && !defaultHasChanged) {
      if (!draftHydrated) {
        console.log("[CHECKOUT-INIT] Manual draft detected. Preserving user typing.");
        reset(checkoutDraft as CheckoutFormData, { keepDefaultValues: true });
        setDraftHydrated(true);
      }
      return;
    }

    // CASE 2: No manual typing OR default address ID changed. Apply/Re-apply current default.
    if (defaultAddr) {
      console.log(`[CHECKOUT-INIT] ${defaultHasChanged ? 'ID Change Detected.' : 'No manual data.'} Applying account default address.`);
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
        sourceAddressId: currentDefaultId, // Record that we auto-filled from this ID
      };

      reset(finalData as CheckoutFormData, { keepDefaultValues: true });

      // Update session storage immediately to reflect the new source ID
      setCheckoutDraft(finalData);
      setDraftHydrated(true);
    } else {
      if (!draftHydrated) {
        console.log("[CHECKOUT-INIT] No initialization data found.");
        setDraftHydrated(true);
      }
    }
  }, [isMounted, addressLoading, authLoading, addresses, checkoutDraft, user?.email, reset, draftHydrated]);

  // Save progress only AFTER initialization is complete
  useEffect(() => {
    if (!draftHydrated) return;

    const subscription = watch((value) => {
      setCheckoutDraft(value as Partial<CheckoutFormData>);
    });

    return () => subscription.unsubscribe();
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

  // Revalidate coupon on subtotal change
  useEffect(() => {
    if (coupon) {
      dispatch(validateCoupon({ code: coupon.code, subtotal }));
    }
  }, [subtotal, dispatch]);

  const handleApplyCoupon = async () => {
    if (!code) return;
    await dispatch(validateCoupon({ code, subtotal }));
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

  const handleCheckout = async (data: CheckoutFormData) => {
    setCheckoutDraft(data);

    if (!cartItems.length) return toast.error("Cart is empty");
    if (!payment) return toast.error("Please select a payment method");
    if (!selectedShipping) return toast.error("Please select a shipping method");
    if (!user?.id) return toast.error("You must be logged in to continue");
    if (payment === "upi" && data.country?.toLowerCase() !== "india") {
      return toast.error("UPI is only available for India");
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

  if (!isMounted) {
    return <CheckoutDetailSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(handleCheckout)}>
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
          coupon={coupon}
          couponMessage={couponMessage}
          suggestions={suggestions}
          code={code}
          setCode={setCode}
          handleApplyCoupon={handleApplyCoupon}
          isOffersOpen={isOffersOpen}
          setIsOffersOpen={setIsOffersOpen}
        />
      </div>
    </form>
  );
}

export default CheckoutDetail;