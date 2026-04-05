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
import { toast } from "react-toastify"

export default function CartFlowContent() {
	const dispatch = useAppDispatch()
	const searchParams = useSearchParams()
	const { cartId, activeStep } = useAppSelector((state: any) => state.cart)
	const { user } = useAppSelector((state: any) => state.auth)
	const handledCancelSessionRef = useRef<string | null>(null)

	useEffect(() => {
		const checkoutState = searchParams.get("checkout")
		const sessionId = searchParams.get("session_id")
		const step = searchParams.get("step")

		if (checkoutState === "success") {
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
			dispatch(setActiveStep(2))
			toast.info("Payment was cancelled. You can try again or use a different method.")
			handledCancelSessionRef.current = sessionId
			return
		}

		if (step) {
			const s = parseInt(step)
			if (s === 1 || s === 2 || s === 3) {
				dispatch(setActiveStep(s as 1 | 2 | 3))
				return
			}
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
