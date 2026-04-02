"use client"

import { Suspense } from "react"
import SearchContent from "./SearchContent"
import { ProductGridSkeleton } from "@/components/ui/skeleton"

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-5 py-10"><ProductGridSkeleton count={8} /></div>}>
      <SearchContent />
    </Suspense>
  )
}

