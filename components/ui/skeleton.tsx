import React from "react"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Skeleton className="h-[260px] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="border-b p-4">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-full" />
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-64 sm:h-100 w-full rounded-lg" />
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-16 sm:h-30 sm:w-30 rounded flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}

// Account Page Skeletons
export function AccountDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="pt-4 border-t border-gray-200">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  )
}

export function AddressCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
      <div className="flex justify-between mb-3 items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="space-y-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export function AddressPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col md:flex-row gap-6 mt-10">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-40" />
          <AddressCardSkeleton />
          <AddressCardSkeleton />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-36" />
          <AddressCardSkeleton />
          <AddressCardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  )
}

export function OrdersPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-24" />
      <div className="space-y-4">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    </div>
  )
}

export function WishlistCardSkeleton() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Wishlist</h2>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[3fr_4fr_2fr] items-center border-b border-gray-300 py-5 gap-2"
          >
            {/* Left section */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5" /> {/* cross icon */}
              <Skeleton className="w-16 h-16 rounded" /> {/* image */}

              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Price */}
            <div className="flex justify-center">
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Button */}
            <div className="flex justify-start">
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export function WishlistPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="">
        {Array.from({ length: 8 }).map((_, i) => (
          <WishlistCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white">
          <Skeleton className="h-24 w-24 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function QuestionSkeleton() {
  return (
    <div className="my-6 space-y-6">
      <Skeleton className="h-7 w-64 mb-4" />
      <div className="space-y-3 pt-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="mt-6 space-y-8 animate-pulse">
      <Skeleton className="h-9 w-64" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Form placeholder */}
      <div className="border-2 border-gray-100 rounded-xl p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-6 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b pb-6">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccountLayoutSkeleton() {
  return (
    <div className="px-4 lg:px-30 py-16 animate-pulse">
      <div className="flex justify-center mb-10">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="hidden lg:flex flex-col bg-gray-100 p-6 rounded-lg h-fit space-y-6">
          <div className="flex flex-col items-center py-4 space-y-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-4 flex flex-col pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
            <div className="pt-4 border-t border-gray-200">
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function ShoppingCartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-5 sm:px-10 lg:px-30 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr] border-b py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 mx-2" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b py-6 italic">
            <Skeleton className="w-20 h-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="border p-6 rounded-lg h-fit space-y-6">
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="border-t pt-6 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

export function CheckoutDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 px-5 my-10 sm:px-10 lg:px-30 animate-pulse">
      <div className="space-y-6">
        <div className="border rounded p-5 space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded p-5 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <div className="border rounded p-5 h-fit space-y-6 sticky top-20">
        <Skeleton className="h-6 w-1/2" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="w-20 h-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
        <div className="border-t pt-6 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  )
}

export function CompleteOrderSkeleton() {
  return (
    <div className="max-w-xl mx-auto text-center my-20 px-4 space-y-8 animate-pulse">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3 mx-auto" />
        <Skeleton className="h-12 w-2/3 mx-auto" />
      </div>
      <div className="flex gap-6 justify-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-20 h-24 rounded" />
        ))}
      </div>
      <div className="space-y-3 max-w-xs mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <Skeleton className="h-12 w-48 mx-auto" />
    </div>
  )
}
export function BlogCardSkeleton({ gridType = "three" }: { gridType?: string }) {
  return (
    <div className={`overflow-hidden ${gridType === "horizontal" ? "flex gap-6 items-center" : ""}`}>
      <div className={["horizontal", "vertical"].includes(gridType) ? "flex gap-4 w-full" : "w-full"}>
        <Skeleton
          className={`rounded-lg ${gridType === "horizontal" || gridType === "vertical"
            ? "w-[250px] h-[200px] flex-shrink-0"
            : "w-full h-[283px]"
            }`}
        />
        <div className={`pt-4 flex-1 space-y-3 ${gridType === "horizontal" ? "pt-0" : ""}`}>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function BlogGridSkeleton({ count = 6, gridType = "three" }: { count?: number; gridType?: string }) {
  const gridClass = () => {
    switch (gridType) {
      case "two": return "grid grid-cols-1 sm:grid-cols-2 gap-6"
      case "three": return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      case "horizontal": return "grid grid-cols-1 md:grid-cols-2 gap-6"
      case "vertical": return "grid grid-cols-1 gap-6"
      default: return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
    }
  }

  return (
    <div className={`${gridClass()} my-10 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} gridType={gridType} />
      ))}
    </div>
  )
}

