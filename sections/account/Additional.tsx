"use client"

import BlackShopButton from "@/components/blackbutton";
import { useState, useEffect } from "react";
import Products from "@/components/products";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { type ProductType } from '@/types/index'
import { fetchProducts } from "@/store/slices/productSlice";

type Props = {
  product: ProductType
}

const Additional = ({ product }: Props) => {

  const { items: products, initialized, loading } = useAppSelector((state: any) => state.products)
  const [shuffled, setShuffled] = useState<any[]>([])
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!initialized && !loading) {
      dispatch(fetchProducts())
    }
  }, [initialized, loading, dispatch])

  useEffect(() => {
    if (!products || products.length === 0) return

    const currentCategory = product.category?.trim()

    // 1. Get products in same category
    let list = products.filter(
      (p: any) => p.category?.trim() === currentCategory && p.variant_id !== product.variant_id
    )

    // 2. Fallback to other products if category is empty
    if (list.length === 0) {
      list = products.filter((p: any) => p.variant_id !== product.variant_id)
    }

    // 3. Shuffle logic
    const items = [...list]
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]
    }

    setShuffled(items.slice(0, 12)) // Limit to 12
  }, [products, product.id, product.category, product.variant_id])


  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold text-lg mb-2">Product Details</h3>

      <div className="pt-5 flex flex-col gap-8 text-sm text-gray-700">
        <div>
          <p className="text-gray-500">SKU</p>
          <p className="font-semibold">{product.sku}</p>
        </div>

        <div>
          <p className="text-gray-500">Category</p>
          <p className="font-semibold">{product.category}</p>
        </div>

        <div>
          <p className="text-gray-500">Dimensions</p>
          <p className="font-semibold">{product.measurements || "N/A"}</p>
        </div>
        <div>
          <p className="text-gray-500">Package</p>
          <p className="font-semibold">{product.package || "N/A"}</p>
        </div>
      </div>

      <div className="my-10 mr-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="w-1/2 font-poppins font-medium text-[13px] sm:text-[16px] md:text-[20px] lg:text-[28px]">
            You might also like
          </h1>

          <BlackShopButton
            content="More Products"
            className="text-[10px] sm:text-[12px] md:text-[16px]"
          />
        </div>

        <Products products={shuffled} variant="scroll" isLoading={loading && !initialized} />
      </div>
    </div>
  )
}

export default Additional;
