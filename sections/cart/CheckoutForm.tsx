"use client";

import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { CheckoutFormData } from "./CheckoutDetails";

interface CheckoutFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
  shippingStateOptions: readonly string[];
  billingStateOptions: readonly string[];
  loading: boolean;
  isSyncing: boolean;
}

export default function CheckoutForm({
  register,
  errors,
  watch,
  shippingStateOptions,
  billingStateOptions,
  loading,
  isSyncing,
}: CheckoutFormProps) {
  const differentBilling = watch("differentBilling");
  const payment = watch("payment");

  return (
    <div className="w-full lg:w-2/3 space-y-3 min-[375px]:space-y-4 sm:space-y-6">
      {/* Contact Information */}
      <div className="border rounded-lg p-3 min-[375px]:p-4 sm:p-6 lg:p-5 bg-white shadow-sm">
        <h1 className="font-semibold mb-3 min-[375px]:mb-4 sm:mb-5 text-sm min-[375px]:text-base sm:text-lg lg:text-[20px] pb-2 border-b">
          Contact Information
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col">
            <label htmlFor="firstName" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
              First Name *
            </label>
            <input
              id="firstName"
              autoComplete="given-name"
              {...register("firstName", { required: "First name required" })}
              className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
            />
            {errors.firstName && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="lastName" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
              Last Name *
            </label>
            <input
              id="lastName"
              autoComplete="family-name"
              {...register("lastName", { required: "Last name required" })}
              className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
            />
            {errors.lastName && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col mt-3 sm:mt-4">
          <label htmlFor="phone" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
            Phone *
          </label>
          <input
            id="phone"
            autoComplete="tel"
            {...register("phone", { 
              required: "Phone required",
              minLength: { value: 10, message: "Phone must be exactly 10 digits" },
              maxLength: { value: 10, message: "Phone must be exactly 10 digits" },
              pattern: { value: /^[0-9]+$/, message: "Only digits allowed" }
            })}
            className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
          />
          {errors.phone && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex flex-col mt-3 sm:mt-4">
          <label htmlFor="email" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email", {
              required: "Email required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="border rounded-lg p-3 min-[375px]:p-4 sm:p-6 lg:p-5 bg-white shadow-sm">
        <h1 className="font-semibold mb-3 min-[375px]:mb-4 sm:mb-5 text-sm min-[375px]:text-base sm:text-lg lg:text-[20px] pb-2 border-b">
          Shipping Address
        </h1>

        <div className="flex flex-col mt-3 sm:mt-4">
          <label htmlFor="street" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
            Street *
          </label>
          <input
            id="street"
            {...register("street", { required: "Street required" })}
            className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
          />
          {errors.street && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.street.message}</p>
          )}
        </div>

        <div className="flex flex-col mt-4">
          <label htmlFor="country" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
            Country *
          </label>
          <select
            id="country"
            autoComplete="country-name"
            {...register("country", { required: "Country required" })}
            className="border rounded p-2.5 px-3 focus:border-black outline-none transition-colors bg-white text-sm"
          >
            <option value="">Select Country</option>
            <option value="india">India</option>
            <option value="usa">USA</option>
          </select>
          {errors.country && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.country.message}</p>
          )}
        </div>

        <div className="flex flex-col mt-3 sm:mt-4">
          <label htmlFor="city" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
            City *
          </label>
          <input
            id="city"
            autoComplete="address-level2"
            {...register("city", { required: "City required" })}
            className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
          />
          {errors.city && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.city.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div className="flex flex-col">
            <label htmlFor="state" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
              State *
            </label>
            <input
              id="state"
              list="state-options"
              autoComplete="address-level1"
              {...register("state", { required: "State required" })}
              className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
            />
            <datalist id="state-options">
              {shippingStateOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.state && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.state.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="zip" className="text-[#6C7275] font-medium mb-1 text-[10px] min-[375px]:text-xs sm:text-sm">
              Zip Code *
            </label>
            <input
              id="zip"
              autoComplete="postal-code"
              {...register("zip", { required: "Zip required" })}
              className="border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
            />
            {errors.zip && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.zip.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="border rounded-lg p-3 min-[375px]:p-4 sm:p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 min-[375px]:gap-3">
          <input
            id="differentBilling"
            type="checkbox"
            {...register("differentBilling")}
            className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 rounded border-gray-300 text-black focus:ring-black transition-all"
          />
          <label htmlFor="differentBilling" className="font-medium text-[10px] min-[375px]:text-xs sm:text-sm md:text-base cursor-pointer">
            Different billing address
          </label>
        </div>

        {differentBilling && (
          <div className="mt-4 space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col">
              <input
                placeholder="Street *"
                {...register("billingStreet", {
                  required: differentBilling ? "Billing street required" : false,
                })}
                className="w-full border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
              />
              {errors.billingStreet && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.billingStreet.message}</p>
              )}
            </div>

            <div className="flex flex-col">
              <select
                {...register("billingCountry", {
                  required: differentBilling ? "Billing country required" : false,
                })}
                className="w-full border rounded p-2 px-3 focus:border-black outline-none transition-colors bg-white shadow-none text-sm"
              >
                <option value="">Select Country *</option>
                <option value="india">India</option>
                <option value="usa">USA</option>
              </select>
              {errors.billingCountry && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.billingCountry.message}</p>
              )}
            </div>

            <div className="grid gap-3 sm:gap-4">
              <div className="flex flex-col">
                <input
                  placeholder="City *"
                  {...register("billingCity", {
                    required: differentBilling ? "Billing city required" : false,
                  })}
                  className="w-full border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
                />
                {errors.billingCity && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.billingCity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col">
                <input
                  placeholder="State *"
                  list="billing-states"
                  {...register("billingState", {
                    required: differentBilling ? "Billing state required" : false,
                  })}
                  className="w-full border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
                />
                {errors.billingState && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.billingState.message}</p>
                )}
              </div>
              <div className="flex flex-col">
                <input
                  placeholder="Zip *"
                  {...register("billingZip", {
                    required: differentBilling ? "Billing zip required" : false,
                  })}
                  className="w-full border rounded p-2 px-3 focus:border-black outline-none transition-colors text-[10px] min-[375px]:text-sm"
                />
                {errors.billingZip && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.billingZip.message}</p>
                )}
              </div>
            </div>
            <datalist id="billing-states">
              {billingStateOptions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="border rounded-lg p-3 min-[375px]:p-4 sm:p-6 lg:p-5 bg-white shadow-sm">
        <h1 className="font-semibold mb-3 min-[375px]:mb-4 sm:mb-5 text-sm min-[375px]:text-base sm:text-lg lg:text-[20px] pb-2 border-b">
          Payment
        </h1>

        <div className="space-y-2 min-[375px]:space-y-3">
          <label
            htmlFor="payment-card"
            className={`flex gap-2 min-[375px]:gap-3 items-center border rounded-lg p-2 min-[375px]:p-3 sm:p-4 cursor-pointer transition-all hover:border-gray-400
                  ${payment === "card" ? "border-black bg-gray-50" : "border-gray-200"}
                `}
          >
            <input
              id="payment-card"
              type="radio"
              value="card"
              {...register("payment", { required: "Select payment method" })}
              className="w-4 h-4 accent-black"
            />
            <div className="flex-1">
              <span className="font-medium text-[10px] min-[375px]:text-xs sm:text-sm md:text-base">Pay by Card</span>
            </div>
            <div className="flex gap-1">
              <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gray-100 rounded"></div>
              <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gray-100 rounded"></div>
            </div>
          </label>

          <label
            htmlFor="payment-upi"
            className={`flex gap-2 min-[375px]:gap-3 items-center border rounded-lg p-2 min-[375px]:p-3 sm:p-4 cursor-pointer transition-all hover:border-gray-400
                  ${payment === "upi" ? "border-black bg-gray-50" : "border-gray-200"}
                `}
          >
            <input
              id="payment-upi"
              type="radio"
              value="upi"
              {...register("payment")}
              className="w-4 h-4 accent-black"
            />
            <div className="flex-1">
              <span className="font-medium text-[10px] min-[375px]:text-xs sm:text-sm md:text-base">Pay by UPI</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center grayscale">
              <span className="text-[8px] sm:text-[10px] font-bold border rounded px-1">UPI</span>
            </div>
          </label>
        </div>

        {errors.payment && (
          <p className="text-red-500 text-[10px] sm:text-xs mt-3 font-medium">{errors.payment.message}</p>
        )}

        <button
          type="submit"
          disabled={loading || isSyncing}
          className="bg-black text-white py-3 min-[375px]:py-3.5 sm:py-4 mt-4 min-[375px]:mt-6 sm:mt-8 w-full rounded-md min-[375px]:rounded-lg disabled:opacity-50 font-semibold text-[13px] min-[375px]:text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
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
    </div>
  );
}
