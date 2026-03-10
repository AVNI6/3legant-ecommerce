"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { ProductType } from "@/constants/Data"

type ProductContextType = {
  products: ProductType[]
  loading: boolean
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true
})

export const useProducts = () => useContext(ProductContext)

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")

      if (error) {
        console.error(error)
        return
      }

      const formatted = data.map((p) => ({
        id: Number(p.id),
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.image,
        description: p.description,
        category: p.category,
        color: p.color,
        measurements: p.measurements,
        isNew: p.isNew,
        validationTill: p.validationTill,
        thumbnails: {
          t1: p.thumbnails1,
          t2: p.thumbnails2,
          t3: p.thumbnails3
        }
      }))

      setProducts(formatted)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  )
}