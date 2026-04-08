"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { useAppDispatch } from "@/store/hooks"
import { setQuantity, updateCartItemQuantity } from "@/store/slices/cartSlice"

interface Props {
	quantity: number
	variant_id?: number
	stock?: number
	onQuantityChange?: (val: number) => void
	maxWidth?: string
	allowZero?: boolean
}

const QuantityInput = ({
	quantity,
	variant_id,
	stock = 100,
	onQuantityChange,
	maxWidth = "w-20 sm:w-24 lg:w-32",
	allowZero = false,
}: Props) => {
	const dispatch = useAppDispatch()
	const debounceRef = useRef<NodeJS.Timeout | null>(null)
	const hasPendingSyncRef = useRef(false)

	const [inputValue, setInputValue] = useState(String(quantity))

	const minLimit = allowZero ? 0 : 1

	useEffect(() => {
		if (!hasPendingSyncRef.current) {
			setInputValue(String(quantity))
		}
	}, [quantity])

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}
		}
	}, [])

	const clamp = (value: number) => Math.max(minLimit, Math.min(stock, value))

	const commitOptimistic = (nextValue: number) => {
		setInputValue(String(nextValue))

		if (variant_id) {
			dispatch(updateCartItemQuantity({ variant_id, quantity: nextValue }))
		}

		if (onQuantityChange) {
			onQuantityChange(nextValue)
		}
	}

	const scheduleDatabaseSync = (nextValue: number) => {
		if (!variant_id) return

		hasPendingSyncRef.current = true

		if (debounceRef.current) {
			clearTimeout(debounceRef.current)
		}

		debounceRef.current = setTimeout(() => {
			dispatch(setQuantity({ variant_id, quantity: nextValue }))
				.finally(() => {
					hasPendingSyncRef.current = false
					debounceRef.current = null
				})
		}, 350)
	}

	const handleUpdate = (type: "inc" | "dec") => {
		const currentValue = Number.parseInt(inputValue, 10)
		const resolvedCurrent = Number.isNaN(currentValue) ? quantity : currentValue
		const rawNext = type === "inc" ? resolvedCurrent + 1 : resolvedCurrent - 1
		const nextValue = clamp(rawNext)

		if (type === "inc" && resolvedCurrent >= stock) {
			toast.warning(`Total stock limit of ${stock} reached`)
			return
		}

		if (type === "dec" && resolvedCurrent <= minLimit) {
			return
		}

		commitOptimistic(nextValue)
		// If reaching 0, sync immediately to avoid unmount cleanup clearing the timeout
		if (nextValue === 0) {
			dispatch(setQuantity({ variant_id: variant_id!, quantity: 0 }))
		} else {
			scheduleDatabaseSync(nextValue)
		}
	}

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setInputValue(value)

		const parsed = Number.parseInt(value, 10)
		if (Number.isNaN(parsed)) {
			return
		}

		const nextValue = clamp(parsed)

		if (parsed > stock) {
			toast.warning(`Quantity capped at available stock (${stock})`)
		}

		commitOptimistic(nextValue)
		if (nextValue === 0) {
			dispatch(setQuantity({ variant_id: variant_id!, quantity: 0 }))
		} else {
			scheduleDatabaseSync(nextValue)
		}
	}

	const handleBlur = () => {
		const parsed = Number.parseInt(inputValue, 10)
		const nextValue = Number.isNaN(parsed) ? minLimit : clamp(parsed)

		commitOptimistic(nextValue)
		if (nextValue === 0) {
			dispatch(setQuantity({ variant_id: variant_id!, quantity: 0 }))
		} else {
			scheduleDatabaseSync(nextValue)
		}
	}

	const parsedForUi = Number.parseInt(inputValue, 10)
	const currentForUi = Number.isNaN(parsedForUi) ? quantity : parsedForUi
	const isAtMin = currentForUi <= minLimit
	const isAtMax = currentForUi >= stock

	return (
		<div className={`flex items-center justify-between border border-gray-300 rounded-lg px-1 py-1 sm:px-4 sm:py-2 ${maxWidth}`}>
			<button
				type="button"
				onClick={() => handleUpdate("dec")}
				className={`text-lg sm:text-xl font-medium focus:outline-none text-black ${isAtMin ? "opacity-40 cursor-not-allowed" : "hover:text-gray-600"}`}
				disabled={isAtMin}
			>
				-
			</button>

			<input
				type="number"
				value={inputValue}
				onChange={handleInputChange}
				onBlur={handleBlur}
				className="text-xs sm:text-base font-semibold w-8 sm:w-12 text-center text-black bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
			/>

			<button
				type="button"
				onClick={() => handleUpdate("inc")}
				className={`text-lg sm:text-xl font-medium focus:outline-none text-black ${isAtMax ? "opacity-40 cursor-not-allowed" : "hover:text-gray-600"}`}
				disabled={isAtMax}
			>
				+
			</button>
		</div>
	)
}

export default QuantityInput

