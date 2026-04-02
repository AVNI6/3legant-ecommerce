"use client"

import CartDrawer from "@/sections/cart/CartDrawer"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  return (
    <CartDrawer
      isOpen={true}
      onClose={() => router.back()}

    />
  )
}