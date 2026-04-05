"use client"

import { useRouter } from "next/navigation"
import { RxCross2 } from "react-icons/rx"
import { useEffect } from "react"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin"
import Link from "next/link"

type Props = {
  isOpen: boolean
  onClose: () => void
}

import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { removeFromCart } from "@/store/slices/cartSlice"
import QuantityInput from "@/components/QuantityInput"

export default function CartDrawer({ isOpen, onClose }: Props) {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((state: any) => state.cart.items) as any[]
  const shippingCost = useAppSelector((state: any) => state.cart.shippingCost) as number
  const { user } = useAppSelector((state: any) => state.auth)

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = subtotal + shippingCost

  const { requireLogin, LoginModal } = useRequireLogin()

  const router = useRouter()

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-40 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-[100dvh] overflow-hidden w-[80%] sm:w-[70%] md:w-[413px] bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-3 min-[375px]:p-4 sm:p-6 border-b shrink-0">
          <h2 className="text-base min-[375px]:text-xl sm:text-2xl font-semibold">Cart</h2>
          <button onClick={onClose}>
            <RxCross2 className="text-xl sm:text-2xl" />
          </button>
        </div>

        <div className="flex-1 p-3 min-[375px]:p-4 sm:p-6 min-h-0 overflow-y-auto flex flex-col">
          {cartItems?.length === 0 ? (
            <p className="text-gray-400">Your cart is empty</p>
          ) : (
            cartItems?.map(item => (
              <div key={item.variant_id} className="flex gap-2 min-[375px]:gap-4 mb-4 min-[375px]:mb-6">
                <Link href={`${APP_ROUTE.product}/${item.id}?variantId=${item.variant_id}`} onClick={onClose} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-20 sm:h-20 object-cover hover:scale-105 transition-transform rounded-md bg-gray-50 border border-gray-100"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1 min-[375px]:gap-2">
                      <Link href={`${APP_ROUTE.product}/${item.id}?variantId=${item.variant_id}`} onClick={onClose} className="font-semibold hover:underline text-[10px] min-[375px]:text-sm sm:text-base leading-tight line-clamp-2 mt-0.5">
                        {item.name}
                      </Link>
                      <button onClick={() => dispatch(removeFromCart(item.variant_id))} className="text-gray-400 hover:text-black shrink-0 pt-1">
                        <RxCross2 />
                      </button>
                    </div>

                    <p className="text-[9px] min-[375px]:text-xs sm:text-sm text-gray-500 mt-0.5 mb-1 min-[375px]:mb-0">
                      Color: {item.color}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 min-[375px]:gap-3 mt-1 min-[375px]:mt-3">
                    <QuantityInput
                      quantity={item.quantity}
                      variant_id={item.variant_id}
                      stock={item.stock}
                      maxWidth="w-[60px] min-[375px]:w-20 sm:w-24"
                    />

                    <span className="ml-auto font-medium text-[10px] min-[375px]:text-sm sm:text-base">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="w-full border-t border-gray-100 p-3 min-[375px]:p-4 sm:p-6 bg-white mt-auto shrink-0 flex flex-col gap-1 min-[375px]:gap-2">

          <div className="flex justify-between mb-1 min-[375px]:mb-2">
            <span className="text-gray-500 text-[10px] min-[375px]:text-sm sm:text-base">Subtotal</span>
            <span className="font-medium text-[10px] min-[375px]:text-sm sm:text-base">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[13px] min-[375px]:text-base sm:text-lg font-semibold pt-2 min-[375px]:pt-4 border-t border-gray-100 mb-2 min-[375px]:mb-4 sm:mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            className="bg-black text-white w-full py-2 min-[375px]:py-3 mb-2 min-[375px]:mb-3 rounded-md min-[375px]:rounded-lg text-[10px] min-[375px]:text-sm sm:text-base font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
            onClick={() => {
              requireLogin(() => {
                onClose()
                router.push(`${APP_ROUTE.cart}?step=2`)
              }, user, "Please sign in to proceed to checkout.")
            }}
          >
            Checkout
          </button>

          <button
            className="w-full text-center text-[10px] min-[375px]:text-sm sm:text-base font-medium text-gray-500 hover:text-black transition-colors"
            onClick={() => {
               requireLogin(() => {
              onClose()
              router.push(APP_ROUTE.cart)
             }, user, "Please sign in to proceed to checkout.")
            }}
          >
            View Cart
          </button>
        </div>
      </div>

      {/* Sign In Modal */}
      <LoginModal />
    </>
  )
}
