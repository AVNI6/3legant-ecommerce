"use client";

import { FaCheck } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveStep } from "@/store/slices/cartSlice";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function StepIndicator() {
  const dispatch = useAppDispatch();
  const activeStep = useAppSelector((state: any) => state.cart.activeStep);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState<string>("");

  const steps = [
    { id: 1, label: "Shopping Cart" },
    { id: 2, label: "Checkout Details" },
    { id: 3, label: "Order Complete" },
  ];

  const stepHeadingMap: Record<number, string> = {
    1: "Cart",
    2: "Check Out",
    3: "Complete",
  };

  const activeStepName = stepHeadingMap[activeStep] || "";

  // ✅ Reset to step 1 when returning from other pages
  useEffect(() => {
    const isOnCartPage = pathname.includes("/cart") || pathname.includes("/pages/cart");

    if (isOnCartPage && lastPath !== "" && lastPath !== pathname) {
      if (!lastPath.includes("/cart") && !lastPath.includes("/pages/cart")) {
        // We moved from cart to somewhere else, if we were on success step, clear it
        const savedStep = localStorage.getItem("checkoutActiveStep");
        if (savedStep === "3") {
          localStorage.removeItem("checkoutActiveStep");
          dispatch(setActiveStep(1));
        }
      }
    }

    setLastPath(pathname);
  }, [pathname, dispatch]);

  // Save active step to localStorage whenever it changes (only for Step 1 & 2)
  useEffect(() => {
    if (activeStep !== 3) {
      localStorage.setItem("checkoutActiveStep", activeStep.toString());
    }
  }, [activeStep]);

  // Restore active step from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem("checkoutActiveStep");
    if (savedStep) {
      dispatch(setActiveStep(parseInt(savedStep, 10) as 1 | 2 | 3));
    }
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center gap-2 min-[375px]:gap-4 md:gap-8 my-2 min-[375px]:my-4 md:my-8 px-3 min-[375px]:px-5 sm:px-10 lg:px-30">
      {/* Active Step Title */}
      <h1 className="font-medium text-xl min-[375px]:text-[32px] md:text-[54px]">{activeStepName}</h1>

      {/* Step Indicators - Desktop */}
      <div className="hidden md:flex justify-center flex-wrap gap-20 w-full max-w-4xl mx-auto">
        {steps.map((step) => {
          const isActive = step.id === activeStep;
          const isCompleted = step.id < activeStep;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (step.id < activeStep) {
                  dispatch(setActiveStep(step.id as 1 | 2 | 3));
                }
              }}
              className={`flex items-center gap-2 lg:gap-3 cursor-pointer transition-all duration-300
                ${isCompleted
                  ? "border-b-2 pb-2 lg:pb-4 border-green-500"
                  : isActive
                    ? "border-b-2 pb-2 lg:pb-4 border-black"
                    : "pb-2 lg:pb-4"
                }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-white transition-colors duration-300
                  ${isCompleted
                    ? "bg-green-500"
                    : isActive
                      ? "bg-black"
                      : "bg-gray-300"
                  }`}
              >
                {isCompleted ? <FaCheck size={14} /> : step.id}
              </div>

              <span
                className={`font-semibold whitespace-nowrap
                  ${isCompleted
                    ? "text-green-600"
                    : isActive
                      ? "text-black"
                      : "text-gray-400"
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Indicator - Mobile/Tablet */}
      <div className="flex md:hidden w-full items-center justify-between border-b border-gray-100 pb-3 min-[375px]:pb-4 mt-2">
        <div className="flex items-center gap-3 min-[375px]:gap-4">
          <div className="h-6 w-6 min-[375px]:h-8 min-[375px]:w-8 rounded-full bg-black flex items-center justify-center text-white font-semibold text-xs min-[375px]:text-sm shrink-0">
            {activeStep}
          </div>
          <span className="font-semibold text-[13px] min-[375px]:text-base sm:text-lg whitespace-nowrap">
            {steps.find(s => s.id === activeStep)?.label}
          </span>
        </div>

        {activeStep < 3 && (
          <div className="h-6 w-6 min-[375px]:h-8 min-[375px]:w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xs min-[375px]:text-sm shrink-0">
            {activeStep + 1}
          </div>
        )}
      </div>
    </div>
  );
}
