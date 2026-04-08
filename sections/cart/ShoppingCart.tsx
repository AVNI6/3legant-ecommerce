"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/constants/Data"
import { RxCross2 } from "react-icons/rx"
import { useRequireLogin } from "@/lib/supabase/context/useRequireLogin"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { removeFromCart, setActiveStep, setShipping } from "@/store/slices/cartSlice"
import QuantityInput from "@/components/QuantityInput"
import { validateCoupon, removeCoupon } from "@/store/slices/couponSlice"
import { RiCoupon4Line, RiDiscountPercentLine } from "react-icons/ri"
import { toast } from "react-toastify"
import { ShoppingCartSkeleton } from "@/components/ui/skeleton"

type ShippingMethod = {
	id: number
	name: string
	type: "fixed" | "percentage"
	price: number | null
	percentage: number | null
}

const SHIPPING_METHODS_CACHE_KEY = "shipping-methods-cache-v1"
const SHIPPING_METHODS_CACHE_TTL_MS = 1000 * 60 * 10

const readShippingMethodsCache = (): ShippingMethod[] => {
	if (typeof window === "undefined") return []
	try {
		const raw = localStorage.getItem(SHIPPING_METHODS_CACHE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw) as { ts?: number; methods?: ShippingMethod[] }
		if (!parsed?.ts || !Array.isArray(parsed.methods)) return []
		if (Date.now() - parsed.ts > SHIPPING_METHODS_CACHE_TTL_MS) return []
		return parsed.methods
	} catch {
		return []
	}
}

const writeShippingMethodsCache = (methods: ShippingMethod[]) => {
	if (typeof window === "undefined") return
	try {
		localStorage.setItem(SHIPPING_METHODS_CACHE_KEY, JSON.stringify({ ts: Date.now(), methods }))
	} catch {
		// Non-critical cache write failure.
	}
}

export default function ShoppingCart() {
	const dispatch = useAppDispatch()
	const { items: cartItems, loading } = useAppSelector((state: any) => state.cart)
	const { user } = useAppSelector((state: any) => state.auth)
	const shippingCost = useAppSelector((state: any) => state.cart.shippingCost)
	const selectedShipping = useAppSelector((state: any) => state.cart.selectedShipping)

	// Shipping Methods State with fallback defaults
	const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(() => {
		const cached = readShippingMethodsCache()
		if (cached.length > 0) return cached
		return [
			{ id: 1, name: "Free Shipping", type: "fixed", price: 0, percentage: null },
			{ id: 2, name: "Express Shipping", type: "fixed", price: 15, percentage: null },
		]
	})

	const [isMounted, setIsMounted] = useState(false)
	const [code, setCode] = useState("")

	const { coupon, message: couponMessage } = useAppSelector((state: any) => state.coupon)
	const { requireLogin, LoginModal } = useRequireLogin()

	useEffect(() => {
		setIsMounted(true)
		let mounted = true

		const loadShippingMethods = async () => {
			try {
				const { data, error } = await supabase
					.from("shipping_methods")
					.select("id, name, type, price, percentage")
					.order("id", { ascending: true })

				if (error) throw error
				if (mounted && data && data.length > 0) {
					const methods = data as ShippingMethod[];
					setShippingMethods(methods);
					writeShippingMethodsCache(methods);

					// 🚀 FORCED DEFAULT: Ensure 'Free Shipping' is always the first choice for a fresh user
					if (!selectedShipping) {
						const freeMethod = methods.find(m => m.name.toLowerCase().includes("free"));
						const defaultChoice = freeMethod || methods[0];

						if (defaultChoice) {
							dispatch(setShipping({
								name: defaultChoice.name,
								cost: computeShipping(defaultChoice)
							}));
						}
					}
				}
			} catch (err) {
				console.error("[SHIPPING] Failed to load methods:", err)
			}
		}

		void loadShippingMethods()
		return () => {
			mounted = false
		}
	}, [])

	const subtotal = cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
	const discountAmount = coupon ? coupon.discount : 0
	const total = subtotal + shippingCost - discountAmount

	const computeShipping = (method: ShippingMethod) => {
		if (method.type === "fixed") return Number(method.price ?? 0)
		return Number(subtotal) * Number(method.percentage ?? 0)
	}

	const handleShippingChange = (method: ShippingMethod) => {
		dispatch(setShipping({ name: method.name, cost: computeShipping(method) }))
	}

	const handleApplyCoupon = async () => {
		if (!code) return
		await dispatch(validateCoupon({ code, subtotal }))
	}

	const handleRemoveCoupon = () => {
		dispatch(removeCoupon())
		setCode("")
	}

	const isShippingSelected = Boolean(selectedShipping && shippingMethods.some(m => m.name === selectedShipping.name));

	const handleCheckout = () => {
		if (cartItems.length === 0) {
			toast.error("Your cart is empty. Please add items before checking out.")
			return
		}

		if (!isShippingSelected) {
			toast.error("Please select a shipping option before checkout.")
			return
		}

		requireLogin(
			() => {
				dispatch(setActiveStep(2))
			},
			user,
			"Please sign in to proceed to checkout."
		)
	}

	if (loading || !isMounted) {
		return <ShoppingCartSkeleton />
	}

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 xl:gap-15 lg:px-10 xl:px-30 gap-4 min-[375px]:gap-8 px-3 min-[375px]:px-5 sm:px-10 my-4 min-[375px]:my-10">
				<div className="lg:col-span-2">
					<div className="hidden lg:grid grid-cols-[2.5fr_1.2fr_1fr_1fr] xl:grid-cols-[3fr_1fr_1fr_1fr] border-b text-gray-500 py-4 font-medium">
						<div className="pl-6">Product</div>
						<div className="text-center">Quantity</div>
						<div className="text-center">Price</div>
						<div className="text-right pr-6">Subtotal</div>
					</div>

					{!cartItems || cartItems.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-10 min-[375px]:py-20 text-center">
							<p className="text-gray-500 text-sm min-[375px]:text-base md:text-lg mb-4">
								No products added to your cart
							</p>

							<Link href={APP_ROUTE.product}>
								<button className="bg-black text-white px-4 min-[375px]:px-6 py-2 rounded hover:bg-gray-800 transition text-xs min-[375px]:text-sm md:text-base">
									Go to Shop
								</button>
							</Link>
						</div>
					) : (
						cartItems.map((item: any) => (
							<div
								key={item.variant_id}>
								<div className="flex flex-col min-[196px]:flex-row lg:grid lg:grid-cols-[2.5fr_1.2fr_1fr_1fr] xl:grid-cols-[3fr_1fr_1fr_1fr] items-center gap-2 min-[375px]:gap-4 py-3 min-[375px]:py-4 md:py-6 lg:py-6 w-full border-b border-gray-100 last:border-b-0">
									<div className="flex max-[195px]:flex-col flex-row lg:col-span-1 items-center gap-3 min-[375px]:gap-4 w-full lg:w-auto">
										<Link href={`${APP_ROUTE.product}/${item.id}?variantId=${item.variant_id}`} className="shrink-0 bg-[#F3F5F7] rounded overflow-hidden flex items-center justify-center">
											<img
												src={item.image}
												alt={item.name}
												className="w-14 h-14 min-[196px]:w-16 min-[196px]:h-16 sm:w-24 sm:h-24 lg:w-20 lg:h-20 object-contain max-[195px]:w-full mix-blend-multiply"
											/>
										</Link>
										<div className="flex flex-col flex-1 gap-1 min-w-0 max-[195px]:hidden">
											<div className="flex justify-between items-start lg:block gap-1 min-[375px]:gap-2">
												<Link href={`${APP_ROUTE.product}/${item.id}?variantId=${item.variant_id}`} className="min-w-0">
													<p className="font-semibold text-[10px] min-[375px]:text-xs sm:text-sm lg:text-base hover:underline line-clamp-2 leading-tight">
														{item.name}
													</p>
												</Link>
												<p className="font-semibold text-[9px] min-[375px]:text-xs sm:text-sm lg:hidden shrink-0 mt-0.5">
													{formatCurrency(item.price)}
												</p>
											</div>

											<p className="text-gray-400 text-[9px] min-[375px]:text-[10px] sm:text-xs lg:text-sm mb-1 mt-0.5">
												Color: {item.color}
											</p>

											<div className="flex justify-between items-center mt-auto lg:hidden">
												<QuantityInput
													quantity={item.quantity}
													variant_id={item.variant_id}
													stock={item.stock}
													allowZero={true}
													maxWidth="w-20 sm:w-24"
												/>
												<button
													onClick={() => dispatch(removeFromCart(item.variant_id))}
													className="flex items-center text-gray-400 hover:text-red-500 transition-colors p-1"
												>
													<RxCross2 size={16} />
												</button>
											</div>

											{/* Desktop only Remove button with text */}
											<button
												onClick={() => dispatch(removeFromCart(item.variant_id))}
												className="hidden lg:flex gap-1 items-center text-gray-400 text-[14px] hover:text-red-500 transition mt-1"
											>
												<RxCross2 />
												Remove
											</button>
										</div>

										{/* Ultra-Small footer (<196px only) */}
										<div className="hidden max-[195px]:flex justify-between items-center w-full text-[10px] font-black">
											<span>{formatCurrency(item.price)}</span>
											<button
												onClick={() => dispatch(removeFromCart(item.variant_id))}
												className="text-red-500 p-1"
											>
												<RxCross2 size={12} />
											</button>
										</div>
									</div>

									{/* Desktop only columns (Quantity, Price, Subtotal) */}
									<div className="hidden lg:flex justify-center w-full">
										<QuantityInput
											quantity={item.quantity}
											variant_id={item.variant_id}
											stock={item.stock}
											allowZero={true}
											maxWidth="w-[85px] xl:w-28"
										/>
									</div>

									<div className="hidden lg:block text-center">{formatCurrency(item.price)}</div>

									<div className="hidden lg:block font-semibold text-right pr-6">
										{formatCurrency(item.price * item.quantity)}
									</div>
								</div>
							</div>
						))
					)}
				</div>

				<div className="flex flex-col gap-4 min-[375px]:gap-8 order-last lg:order-none lg:col-span-1">
					{/* Have a coupon? - Inside Sidebar ON MOBILE/TABLET only */}
					<div className="lg:hidden border rounded-lg p-3 min-[375px]:p-5 bg-white shadow-sm leading-snug md:leading-9 order-first">
						<h1 className="font-semibold text-xs min-[375px]:text-sm sm:text-base md:text-[21px] mb-1 min-[375px]:mb-0">Have a coupon?</h1>
						<h2 className="text-[#6C7275] text-[9px] min-[375px]:text-[10px] sm:text-xs md:text-[16px]">
							Add your code for an instant cart discount
						</h2>

						<div className="flex border w-full sm:w-fit px-2 min-[375px]:px-3 py-1.5 md:py-2 gap-2 sm:gap-6 border-[#6C7275] items-center mt-3 md:mt-4 group focus-within:border-black transition-colors rounded-md">
							<div className="flex items-center gap-1 min-[375px]:gap-2 flex-1">
								<RiCoupon4Line className="text-gray-400 group-focus-within:text-black size-3 min-[375px]:size-4 md:size-5" />
								<input
									type="text"
									placeholder="Coupon Code"
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className="focus:outline-none bg-transparent w-full text-sm"
								/>
							</div>

							<button
								onClick={handleApplyCoupon}
								className="font-semibold text-sm hover:text-gray-600 transition-colors shrink-0"
							>
								Apply
							</button>
						</div>

						{couponMessage && (
							<p className="text-red-500 text-[10px] md:text-xs mt-2">{couponMessage}</p>
						)}

						{coupon && (
							<div className="flex items-center gap-2 text-green-600 text-[10px] md:text-xs mt-2 font-medium">
								<RiDiscountPercentLine />
								<span>Coupon {coupon.code} applied successfully!</span>
							</div>
						)}
					</div>

					<aside className="border p-3 min-[375px]:p-5 md:p-6 rounded-lg h-fit lg:sticky lg:top-[110px] bg-white shadow-sm">
						<h2 className="font-semibold text-sm min-[375px]:text-base md:text-lg mb-3 min-[375px]:mb-4 md:mb-6 uppercase md:normal-case mt-1 min-[375px]:mt-0">Cart Summary</h2>

						<div className="space-y-2 min-[375px]:space-y-3">
							{shippingMethods.map((method) => {
								const shippingValue = computeShipping(method)
								const checked = selectedShipping?.name === method.name

								return (
									<label
										key={method.id}
										className={`flex justify-between items-center border p-2 min-[375px]:p-3 rounded cursor-pointer transition-colors ${checked ? 'border-black bg-gray-50' : 'border-gray-200'}`}
									>
										<div className="flex items-center gap-1 min-[375px]:gap-2">
											<input
												type="radio"
												name="shipping"
												checked={checked}
												onChange={() => handleShippingChange(method)}
												className="accent-black w-3 h-3 min-[375px]:w-3.5 min-[375px]:h-3.5"
											/>
											<span className="text-[9px] min-[375px]:text-[10px] sm:text-sm">{method.name}</span>
										</div>

										<span className="font-medium text-[9px] min-[375px]:text-[10px] sm:text-sm">
											{shippingValue === 0 ? "Free" : `+${formatCurrency(shippingValue)}`}
										</span>
									</label>
								)
							})}
						</div>

						<div className="space-y-2 min-[375px]:space-y-3 border-t pt-3 min-[375px]:pt-5 md:pt-6 mt-3 min-[375px]:mt-5 md:mt-6">
							<div className="flex justify-between text-[11px] min-[375px]:text-xs sm:text-sm md:text-base">
								<span>Subtotal</span>
								<span className="font-medium">{formatCurrency(subtotal)}</span>
							</div>

							<div className="flex justify-between text-[11px] min-[375px]:text-xs sm:text-sm md:text-base">
								<span>Shipping</span>
								<span className="font-medium">{selectedShipping ? formatCurrency(shippingCost) : "-"}</span>
							</div>

							{discountAmount > 0 && (
								<div className="flex justify-between text-green-600 text-[11px] min-[375px]:text-xs sm:text-sm md:text-base">
									<span>Discount ({coupon?.code})</span>
									<div className="flex items-center gap-1 min-[375px]:gap-2">
										<span>-{formatCurrency(discountAmount)}</span>
										<button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
											<RxCross2 size={12} className="min-[375px]:text-[14px]" />
										</button>
									</div>
								</div>
							)}

							<div className="flex justify-between font-bold text-[13px] min-[375px]:text-sm sm:text-base md:text-lg border-t pt-2 min-[375px]:pt-3 mt-2 min-[375px]:mt-3">
								<span>Total</span>
								<span>{formatCurrency(total)}</span>
							</div>
						</div>

						<button
							className={`w-full py-2.5 min-[375px]:py-3.5 mt-4 min-[375px]:mt-6 rounded-md min-[375px]:rounded-lg font-semibold text-[10px] min-[375px]:text-sm sm:text-base transition-all ${!isShippingSelected ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-black text-white hover:bg-gray-800 shadow-md active:scale-[0.98]"}`}
							onClick={handleCheckout}
							disabled={!isShippingSelected}
						>
							Checkout
						</button>
					</aside>
				</div>
			</div>

			{/* Have a coupon? - DESKTOP layout (at bottom as original) */}
			<div className="hidden lg:block lg:mx-10 xl:mx-30 my-10 lg:my-10 leading-9">
				<h1 className="font-medium text-[21px]">Have a coupon?</h1>
				<h2 className="text-[#6C7275] text-[16px]">Add your code for an instant cart discount</h2>
				<div className="flex border w-fit px-3 gap-25 border-[#6C7275] items-center py-2 mt-4">
					<div className="flex items-center gap-2">
						<RiCoupon4Line />
						<input
							placeholder="Coupon Code"
							className="focus:outline-none"
							value={code}
							onChange={(e) => setCode(e.target.value)}
						/>
					</div>
					<button onClick={handleApplyCoupon} className="font-semibold">Apply</button>
				</div>
				{couponMessage && (
					<p className="text-red-500 text-xs mt-2">{couponMessage}</p>
				)}
				{coupon && (
					<div className="flex items-center gap-2 text-green-600 text-xs mt-2 font-medium">
						<RiDiscountPercentLine />
						<span>✓ Coupon {coupon.code} applied successfully!</span>
					</div>
				)}
			</div>

			<LoginModal />
		</>
	)
}
