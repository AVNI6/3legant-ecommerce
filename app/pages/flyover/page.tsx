"use client"

import CartDrawer from "@/sections/cart/CartDrawer"
import { CartProvider } from "@/sections/cart/context/CartContext"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  return (
    <CartProvider>
    <CartDrawer
      isOpen={true}
      onClose={() => router.back()}

    />
    </CartProvider>
  )
}