"use client"

import { useCart } from "@/sections/cart/context/CartContext"
import { useRouter } from "next/navigation"
import { RxCross2 } from "react-icons/rx"
import { useEffect } from "react"
import { APP_ROUTE } from "@/constants/AppRoutes"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const {
    cartItems,
    subtotal,
    total,
    updateQuantity,
    removeItem,
  } = useCart()

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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[413px] bg-white z-50 shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Cart</h2>
          <button onClick={onClose}>
            <RxCross2 className="text-2xl" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-6 overflow-y-auto h-[calc(100%-260px)]">
          {cartItems.length === 0 ? (
            <p className="text-gray-400">Your cart is empty</p>
          ) : (
            cartItems.map(item => (
              <div key={`${item.id}-${item.color}`} className="flex gap-4 mb-6">
                <img
                  src={item.image}
                  className="w-20 h-20 object-cover"
                />

                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-semibold">{item.name}</p>
                    <button onClick={() => removeItem(item.id)}>
                      <RxCross2 />
                    </button>
                  </div>

                  <p className="text-sm text-gray-400">
                    Color: {item.color}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="border flex px-3 py-1 rounded">
                      <button onClick={() => updateQuantity(item.id, "dec")}>-</button>
                      <span className="px-3">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, "inc")}>+</button>
                    </div>

                    <span className="ml-auto font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full border-t p-6 bg-white">

          <div className="flex justify-between mb-3">
            <span className="text-gray-500">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            className="bg-black text-white w-full py-3 mb-4 rounded"
            onClick={() => {
              onClose()
              router.push(APP_ROUTE.cart) 
            }}
          >
            Checkout
          </button>

          <button
            className="underline w-full text-center"
            onClick={() => {
              onClose()
              router.push("/cart")
            }}
          >
            View Cart
          </button>
        </div>
      </div>
    </>
  )
}