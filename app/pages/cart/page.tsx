"use client"

import { Suspense } from "react"
import CartFlowContent from "./CartFlowContent"

export default function CartFlowPage() {
	return (
		<Suspense fallback={<div className="p-8">Loading cart...</div>}>
			<CartFlowContent />
		</Suspense>
	)
}
