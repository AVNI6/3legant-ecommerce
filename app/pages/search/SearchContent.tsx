"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { CiSearch } from "react-icons/ci"
import { type ProductType } from '@/types/index'
import { formatCurrency, isNewProduct } from "@/constants/Data"
import { useAppSelector } from "@/store/hooks"
import { APP_ROUTE } from "@/constants/AppRoutes"
import { ProductGridSkeleton } from "@/components/ui/skeleton"

export default function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { items: allProducts } = useAppSelector((state: any) => state.products)
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("relevance")

  useEffect(() => {
    if (!query) {
      setProducts([])
      setLoading(false)
      return
    }

    const searchProducts = () => {
      setLoading(true)
      console.log("Search page - Searching for:", query, "Sort by:", sortBy)
      console.log("Available products:", allProducts.length)

      let filtered = allProducts.filter((product: ProductType) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      )

      switch (sortBy) {
        case "price-low":
          filtered = filtered.sort((a: ProductType, b: ProductType) => a.price - b.price)
          break
        case "price-high":
          filtered = filtered.sort((a: ProductType, b: ProductType) => b.price - a.price)
          break
        case "name":
          filtered = filtered.sort((a: ProductType, b: ProductType) => a.name.localeCompare(b.name))
          break
        default:
          break
      }

      console.log("Search page result:", filtered.length, "products")
      setProducts(filtered)
      setLoading(false)
    }

    searchProducts()
  }, [query, sortBy, allProducts])

  if (!query) {
    return (
      <div className="container mx-auto px-5 py-10">
        <div className="text-center py-20">
          <CiSearch className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-semibold mb-2">No search query</h1>
          <p className="text-gray-500">Please enter a search term to find products.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl min-[350px]:text-2xl sm:text-3xl font-semibold mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-xs min-[350px]:text-sm sm:text-base text-gray-600">
          {loading ? "Searching..." : `Found ${products.length} product${products.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="relevance">Relevance</option>
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
      {loading && (
        <div className="py-10">
          <ProductGridSkeleton count={8} />
        </div>
      )}
      {!loading && products.length === 0 && (
        <div className="text-center py-10 min-[350px]:py-20">
          <CiSearch className="w-12 h-12 min-[350px]:w-16 min-[350px]:h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg min-[350px]:text-xl font-semibold mb-2">No products found</h2>
          <p className="text-xs min-[350px]:text-sm text-gray-500 mb-6">
            We couldn't find any products matching "{query}"
          </p>
          <Link
            href="/pages/product"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 min-[450px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-[350px]:gap-6">
          {products.map((product) => (
            <div
              key={product.variant_id}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/pages/product/${product.id}?variantId=${product.variant_id}`}>
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  {isNewProduct(product.created_at) && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`${APP_ROUTE.product}/${product.id}?variantId=${product.variant_id}`}>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-black transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-black">
                      {formatCurrency(product.price)}
                    </span>
                    {product.old_price && product.old_price > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.old_price)}
                      </span>
                    )}
                  </div>

                  {product.stock && product.stock > 0 ? (
                    <span className="text-xs text-green-600 font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
