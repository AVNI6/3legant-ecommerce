"use client"

import { useAppSelector } from "@/store/hooks"
import { useAppDispatch } from "@/store/hooks"
import ShoppingCart from "@/sections/cart/ShoppingCart"
import CheckoutDetails from "@/sections/cart/CheckoutDetails"
import CompleteOrder from "@/sections/cart/CompleteOrder"
import StepIndicator from "@/sections/cart/StepIndicator"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { setActiveStep, clearCartItems, setShipping, clearCart } from "@/store/slices/cartSlice"
import { supabase } from "@/lib/supabase/client"

export default function CartFlowPage() {
	const dispatch = useAppDispatch()
	const searchParams = useSearchParams()
	const { cartId, activeStep } = useAppSelector((state: any) => state.cart)
	const { user } = useAppSelector((state: any) => state.auth)
	const handledCancelSessionRef = useRef<string | null>(null)

	useEffect(() => {
		const checkoutState = searchParams.get("checkout")
		const sessionId = searchParams.get("session_id")

		if (checkoutState === "success") {
			console.log(`[CART-PAGE] Payment success detected for session ${sessionId}`)

			if (cartId) {
				dispatch(clearCart(cartId))
			} else {
				dispatch(clearCartItems())
				dispatch(setShipping({ name: "", cost: 0 }))
				dispatch(setActiveStep(3))
			}

			if (typeof window !== "undefined") {
				sessionStorage.removeItem("checkout-form-draft")
			}
			return
		}

		if (checkoutState === "cancel") {
			console.log(`[CART-PAGE] Payment cancelled for session ${sessionId}`)
			dispatch(setActiveStep(2))

			// Handled by webhook (session expiration or direct cancel URL redirect can be trusted)
			// Removing redundant /api/stripe/cancel call as per consolidation plan
			handledCancelSessionRef.current = sessionId
			return
		}

		if (!checkoutState) {
			dispatch(setActiveStep(1))
		}
	}, [dispatch, searchParams])

	return (
		<div>
			<StepIndicator />

			{activeStep === 1 && <ShoppingCart />}
			{activeStep === 2 && <CheckoutDetails />}
			{activeStep === 3 && <CompleteOrder />}
		</div>
	)
}
