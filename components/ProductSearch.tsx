"use client"

import { useState, useEffect, useRef } from "react"
import { CiSearch } from "react-icons/ci"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { type ProductType } from '@/types/index'
import { formatCurrency, getEffectivePrice, isNewProduct, SearchData } from "@/constants/Data"
import { useAppSelector } from "@/store/hooks"

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default function ProductSearch() {
  const router = useRouter()
  const { items: products } = useAppSelector((state: any) => state.products)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleToggleSearch = () => {
      setIsOpen(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    window.addEventListener('toggle-search', handleToggleSearch)
    return () => window.removeEventListener('toggle-search', handleToggleSearch)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (!isOpen) {
  //       if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
  //         e.preventDefault()
  //         setIsOpen(true)
  //       }
  //       return
  //     }

  //     switch (e.key) {
  //       case "ArrowDown":
  //         e.preventDefault()
  //         setHoveredIndex(prev => (prev + 1) % (results.length || 1))
  //         break
  //       case "ArrowUp":
  //         e.preventDefault()
  //         setHoveredIndex(prev => (prev - 1 + results.length) % (results.length || 1))
  //         break
  //       case "Enter":
  //         e.preventDefault()
  //         if (hoveredIndex >= 0 && results[hoveredIndex]) {
  //           handleProductClick(results[hoveredIndex])
  //         } else if (query) {
  //           handleViewAll()
  //         }
  //         break
  //       case "Escape":
  //         setIsOpen(false)
  //         break
  //     }
  //   }

  //   document.addEventListener("keydown", handleKeyDown)
  //   return () => document.removeEventListener("keydown", handleKeyDown)
  // }, [isOpen, results, hoveredIndex, query])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const filtered = products.filter((p: ProductType) =>
      p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 8)

    setResults(filtered)
    setLoading(false)
  }, [debouncedQuery, products])

  const handleProductClick = (product: ProductType) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/pages/product/${product.id}`)
  }

  const handleViewAll = () => {
    if (query.trim()) {
      router.push(`/pages/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery("")
    }
  }

  return (
    <div ref={containerRef}>
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="p-2 text-gray-600 hover:text-black transition-colors"
        aria-label="Open search"
        suppressHydrationWarning
      >
        <CiSearch className="w-6 h-6 stroke-[0.5]" />
      </button>
      <div
        className={`fixed inset-0 z-[100] transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute sm:top-5 sm:left-5 sm:right-5 top-1 left-1 right-1 max-h-[95vh] overflow-y-auto bg-white shadow-2xl transition-all duration-500 ease-out p-4 min-[350px]:p-6 sm:p-12 rounded-xl ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
            }`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6 sm:mb-10">
              <h2 className="text-xs min-[350px]:text-sm font-bold tracking-[0.1em] min-[350px]:tracking-[0.2em] text-gray-400 uppercase">Search our store</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                suppressHydrationWarning
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative flex items-center justify-between border-b border-gray-100 pb-4 min-[350px]:pb-6 mb-8 sm:mb-12">
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                className="w-full text-lg min-[350px]:text-xl min-[480px]:text-2xl sm:text-2xl font-light focus:outline-none transition-colors placeholder:text-gray-200"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                suppressHydrationWarning
              />
              <CiSearch className="flex-shrink-0 w-6 h-6 min-[350px]:w-8 min-[350px]:h-8 text-gray-300 ml-2" />
            </div>
            <div className="min-h-[250px]">
              {query.length >= 2 ? (
                <div>
                  <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-3">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-500">
                      {loading ? 'Searching...' : `Found ${results.length} results`}
                    </h3>
                    {results.length > 0 && (
                      <button
                        onClick={handleViewAll}
                        className="text-xs sm:text-sm font-bold underline underline-offset-8 hover:text-gray-600 transition-colors uppercase tracking-widest"
                        suppressHydrationWarning
                      >
                        See All
                      </button>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-10">
                      {results.map((product, index) => {

                        const variantColors = Array.from(new Set(
                          (product as any).product_variant?.map((v: any) => v.color).filter(Boolean) || []
                        )) as string[];

                        const {
                          price: effectivePrice,
                          isOfferActive,
                          hasDiscount
                        } = getEffectivePrice({
                          price: Number(product.price),
                          old_price: Number(product.old_price),
                          validationTill: product.validation_till
                        });

                        return (
                          <div
                            key={product.variant_id}
                            onClick={() => handleProductClick(product)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            className={`group cursor-pointer transition-all duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-95'
                              }`}
                          >
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#F3F5F7] rounded-xl mb-3 sm:mb-4">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                loading="lazy"
                                className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />

                              {Number(product.stock) <= 0 && (
                                <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 uppercase tracking-widest rounded-sm shadow-sm">
                                  Out of Stock
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:underline truncate mb-1 px-1">{product.name}</h4>

                            {variantColors.length > 0 && (
                              <div className="flex gap-1.5 mb-2 px-1">
                                {variantColors.slice(0, 4).map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-200 shadow-sm"
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    title={color}
                                  />
                                ))}
                                {variantColors.length > 4 && (
                                  <span className="text-[10px] text-gray-400">+{variantColors.length - 4}</span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between px-1">
                              <span className="text-sm sm:text-base font-bold text-black">{formatCurrency(effectivePrice)}</span>
                              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-tight">{product.category}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : !loading && (
                    <div className="py-24 text-center">
                      <p className="text-base text-gray-400">No matches found for "{query}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-black border-b border-gray-100 pb-3">Suggestions</h3>
                    <div className="flex flex-wrap gap-2">
                      {SearchData.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-full hover:border-black hover:bg-black hover:text-white transition-all duration-200"
                          suppressHydrationWarning
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:block space-y-4">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-black border-b border-gray-100 pb-2">Top Categories</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Link
                        href="/pages/product?category=Living Room"
                        onClick={() => setIsOpen(false)}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group block"
                      >
                        <p className="text-xs font-bold mb-1">Living Room</p>
                        <p className="text-[10px] text-gray-400">View Collection →</p>
                      </Link>
                      <Link
                        href="/pages/product?category=Bedroom"
                        onClick={() => setIsOpen(false)}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group block"
                      >
                        <p className="text-xs font-bold mb-1">Bedroom</p>
                        <p className="text-[10px] text-gray-400">View Collection →</p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
