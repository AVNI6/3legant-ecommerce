"use client"
import { supabase } from "@/lib/supabase/client"
import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export type CartItem = {
  id: number
  name: string
  color: string
  price: number
  quantity: number
  image: string
}

type CartContextType = {
  activeStep: 1 | 2 | 3
  setActiveStep: (v: 1 | 2 | 3) => void
  cartItems: CartItem[]
  addToCart: (product: {
    id: number
    name: string
    price: number
    image: string
    color: string
  }) => void
  updateQuantity: (id: number, type: "inc" | "dec") => void
  removeItem: (id: number) => void
  shippingCost: number
  setShippingCost: (v: number) => void
  subtotal: number
  total: number
  clearCart: () => void
  wishlistItems: CartItem[]
  addToWishlist: (product: {
    id: number
    name: string
    price: number
    image: string
    color: string
  }) => void
  removeWishlistItem: (id: number) => void
 user:any
 setUser: (user: any) => void;
}

const CartContext = createContext<CartContextType | null>(null)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<CartItem[]>([])
  const [shippingCost, setShippingCost] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      if (!session?.user) setWishlistItems([]);
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const updateQuantity = (id: number, type: "inc" | "dec") => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + (type === "inc" ? 1 : -1)) }
          : item
      )
    )
  }
  const clearCart = () => {
    setCartItems([])
    setShippingCost(0)
  }
  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = subtotal + shippingCost

  const addToCart = (product: {
    id: number
    name: string
    price: number
    image: string
    color: string
  }) => {
    setCartItems(prev => {
      const existing = prev.find(
        item => item.id === product.id && item.color === product.color
      )

      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.color === product.color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ]
    })
  }

 const addToWishlist = (product: {
  id: number
  name: string
  price: number
  image: string
  color: string
}) => {
  setWishlistItems(prev => {
    const exists = prev.find(
      item => item.id === product.id && item.color === product.color
    )

    if (exists) return prev

    return [...prev, { ...product, quantity: 1 }]
  })
}

  const removeWishlistItem = (id: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id))
  }
  return (
    <CartContext.Provider
      value={{
        activeStep,
        setActiveStep,
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        shippingCost,
        setShippingCost,
        subtotal,
        total,
        clearCart,
        wishlistItems,
        addToWishlist,
        removeWishlistItem,
        user,
        setUser
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside CartProvider")
  return context
}

// "use client"
// import { createContext, useContext, useState, ReactNode } from "react"

// export type CartItem = {
//   id: number
//   name: string
//   color: string
//   price: number
//   quantity: number
//   image: string
// }

// type CartContextType = {
//   activeStep: 1 | 2 | 3
//   setActiveStep: (v: 1 | 2 | 3) => void
//   cartItems: CartItem[]
//   addToCart: (product: {
//     id: number
//     name: string
//     price: number
//     image: string
//     color: string
//   }) => void
//   updateQuantity: (id: number, type: "inc" | "dec") => void
//   removeItem: (id: number) => void
//   shippingCost: number
//   setShippingCost: (v: number) => void
//   subtotal: number
//   total: number
//   clearCart: () => void
//   wishlistItems: CartItem[]
//   addToWishlist: (product: {
//     id: number
//     name: string
//     price: number
//     image: string
//     color: string
//   }) => void
//   removeWishlistItem: (id: number) => void

// }

// const CartContext = createContext<CartContextType | null>(null)



// export const CartProvider = ({ children }: { children: ReactNode }) => {
//   const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)
//   const [cartItems, setCartItems] = useState<CartItem[]>([])
//   const [wishlistItems, setWishlistItems] = useState<CartItem[]>([])
//   const [shippingCost, setShippingCost] = useState(0)

//   const updateQuantity = (id: number, type: "inc" | "dec") => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item.id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + (type === "inc" ? 1 : -1)) }
//           : item
//       )
//     )
//   }
//   const clearCart = () => {
//     setCartItems([])
//     setShippingCost(0)
//   }
//   const removeItem = (id: number) => {
//     setCartItems(prev => prev.filter(item => item.id !== id))
//   }

//   const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
//   const total = subtotal + shippingCost

//   const addToCart = (product: {
//     id: number
//     name: string
//     price: number
//     image: string
//     color: string
//   }) => {
//     setCartItems(prev => {
//       const existing = prev.find(
//         item => item.id === product.id && item.color === product.color
//       )

//       if (existing) {
//         return prev.map(item =>
//           item.id === product.id && item.color === product.color
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         )
//       }

//       return [
//         ...prev,
//         {
//           ...product,
//           quantity: 1,
//         },
//       ]
//     })
//   }

//   const addToWishlist = (product: {
//     id: number
//     name: string
//     price: number
//     image: string
//     color: string
//   }) => {
//     setWishlistItems(prev => {
//       const exists = prev.find(
//         item => item.id === product.id && item.color === product.color
//       )

//       if (exists) return prev

//       return [...prev, { ...product, quantity: 1 }]
//     })
//   }

//   const removeWishlistItem = (id: number) => {
//     setWishlistItems(prev => prev.filter(item => item.id !== id))
//   }
//   return (
//     <CartContext.Provider
//       value={{
//         activeStep,
//         setActiveStep,
//         cartItems,
//         addToCart,
//         updateQuantity,
//         removeItem,
//         shippingCost,
//         setShippingCost,
//         subtotal,
//         total,
//         clearCart,
//         wishlistItems,
//         addToWishlist,
//         removeWishlistItem,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   )
// }

// export const useCart = () => {
//   const context = useContext(CartContext)
//   if (!context) throw new Error("useCart must be used inside CartProvider")
//   return context
// }

