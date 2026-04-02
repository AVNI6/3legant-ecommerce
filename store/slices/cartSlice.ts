import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'
import { RootState } from '../index'
import { CartItem } from '@/types'
import { getEffectivePrice } from '@/constants/Data'
import { logger } from '@/lib/logger'

interface CartState {
  items: CartItem[]
  cartId: string | null
  shippingCost: number
  selectedShipping: { name: string; cost: number } | null
  loading: boolean
  error: string | null
  activeStep: 1 | 2 | 3
}

const INITIAL_STEP = 1
const GUEST_CART_STORAGE_KEY = "guest-cart-items"
const SHIPPING_STORAGE_KEY = "selected-shipping-method"

const readShipping = (): { name: string; cost: number } | null => {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SHIPPING_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeShipping = (data: { name: string; cost: number } | null) => {
  if (typeof window === "undefined") return
  if (data) {
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(data))
  } else {
    localStorage.removeItem(SHIPPING_STORAGE_KEY)
  }
}

const savedShipping = readShipping()

const initialState: CartState = {
  items: [],
  cartId: null,
  shippingCost: savedShipping?.cost ?? 0,
  selectedShipping: savedShipping,
  loading: false,
  error: null,
  activeStep: 1,
}

const mergeCartItems = (items: CartItem[]): CartItem[] => {
  const merged: Record<string, CartItem> = {}
  items.forEach(item => {
    const key = `${item.variant_id}`
    if (merged[key]) {
      merged[key].quantity += item.quantity
    } else {
      merged[key] = { ...item }
    }
  })
  return Object.values(merged)
}

// use previous declaration
const readGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY)
    const items = raw ? JSON.parse(raw) : []
    return mergeCartItems(items)
  } catch {
    return []
  }
}

const writeGuestCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items))
}

import { toStringArray, resolveVariantColor, resolveVariantImage } from '@/lib/utils/variantUtils'

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data: cartData, error: fetchErr } = await supabase
        .from("cart")
        .select(`
          id,
          cart_items (
            variant_id, 
            quantity,
            product_variant (
              id, color, color_images, thumbnails, price, old_price, product_id,
              products (id, name, image, validation_till)
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fetchErr) throw fetchErr

      let cartId = cartData?.id
      let rawItems = cartData?.cart_items ?? []

      // If no cart exists, create one
      if (!cartId) {
        const { data: created, error: createErr } = await supabase
          .from("cart")
          .insert({ user_id: userId })
          .select("id")
          .single()

        if (createErr) throw createErr
        cartId = created.id
        rawItems = []
      }

      const items = (rawItems as any[]).map((item: any) => {
        const variant = item.product_variant
        const product = variant?.products
        if (!variant || !product) return null
        const { price: effectivePrice } = getEffectivePrice({
          price: Number(variant.price ?? 0),
          old_price: Number(variant.old_price ?? 0),
          validationTill: String(product.validation_till ?? "")
        })

        return {
          id: Number(product.id),
          variant_id: Number(variant.id),
          name: String(product.name),
          color: resolveVariantColor(variant.color),
          price: effectivePrice,
          image: resolveVariantImage(variant, product),
          quantity: Math.max(1, Number(item.quantity ?? 1)),
          stock: Number(variant.stock ?? 0)
        } as CartItem
      }).filter(Boolean) as CartItem[]

      return { items: mergeCartItems(items), cartId }
    } catch (error: any) {
      logger.error("fetchCart failed:", error)
      return rejectWithValue(error.message)
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState
      const cart = state.cart as CartState
      // 🚀 prevents duplicate API calls
      if (cart.loading || cart.items.length > 0) return false
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (payload: { userId?: string; item: Omit<CartItem, 'quantity'>; quantity?: number }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const user = state.auth.user
    const requestedQuantity = Math.max(1, payload.quantity ?? 1)
    const { item } = payload

    try {
      // 📦 Fetch current stock from DB to ensure accuracy
      const { data: variant, error: stockErr } = await supabase
        .from("product_variant")
        .select("stock")
        .eq("id", item.variant_id)
        .single()

      if (stockErr) throw stockErr
      const availableStock = variant?.stock ?? 0
      const existing = (state.cart as CartState).items.find((i: CartItem) => i.variant_id === item.variant_id)
      const currentQty = existing?.quantity ?? 0
      
      // 🚫 Check if we are already at or above stock
      if (currentQty >= availableStock) {
        return rejectWithValue({ message: "Item out of stock", limitReached: true, stock: availableStock })
      }

      // 📏 Cap requested quantity if it exceeds remaining stock
      let finalAddedQty = requestedQuantity
      let limitReached = false
      if (currentQty + requestedQuantity > availableStock) {
        finalAddedQty = availableStock - currentQty
        limitReached = true
      }

      if (!user) {
        const items = readGuestCart()
        const existingGuest = items.find((i: CartItem) => i.variant_id === item.variant_id)
        let newItems
        if (existingGuest) {
          newItems = items.map((i: CartItem) => i.variant_id === item.variant_id ? { ...i, quantity: i.quantity + finalAddedQty } : i)
        } else {
          newItems = [...items, { ...item, quantity: finalAddedQty }]
        }
        writeGuestCart(newItems)
        return { items: newItems, cartId: null, limitReached, stock: availableStock }
      }

      let cartId = (state.cart as CartState).cartId
      if (!cartId) throw new Error("Cart not initialized")

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: currentQty + finalAddedQty })
          .eq("cart_id", cartId)
          .eq("variant_id", item.variant_id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          product_id: item.id,
          variant_id: item.variant_id,
          quantity: finalAddedQty,
        })
        if (error) throw error
      }

      return { items: [], cartId, addedItem: { ...item, quantity: finalAddedQty, stock: availableStock }, limitReached, stock: availableStock }
    } catch (error: any) {
      return rejectWithValue(error.message || error)
    }
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (cartId: string, { rejectWithValue }) => {
    try {
      if (!cartId) return

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)

      if (error) throw error

      writeGuestCart([])
      writeShipping(null)
      return
    } catch (error: any) {
      logger.error("clearCart failed:", error)
      return rejectWithValue(error.message)
    }
  }
)

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ variant_id, type }: { variant_id: number; type: 'inc' | 'dec' }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const user = state.auth.user
    const item = (state.cart as CartState).items.find(i => i.variant_id === variant_id)
    if (!item) return rejectWithValue("Item not found")

    try {
      // 📦 Fetch current stock
      const { data: variant, error: stockErr } = await supabase
        .from("product_variant")
        .select("stock")
        .eq("id", variant_id)
        .single()
      
      if (stockErr) throw stockErr
      const availableStock = variant?.stock ?? 0

      if (type === 'inc' && item.quantity >= availableStock) {
        return rejectWithValue({ message: "Item out of stock", limitReached: true, stock: availableStock })
      }

      const newQuantity = type === 'inc' 
        ? Math.min(availableStock, item.quantity + 1)
        : Math.max(1, item.quantity - 1)

      if (!user) {
        const items = readGuestCart()
        const newItems = items.map(i => i.variant_id === variant_id ? { ...i, quantity: newQuantity } : i)
        writeGuestCart(newItems)
        return { items: newItems, cartId: null }
      }

      const cartId = (state.cart as CartState).cartId
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("cart_id", cartId).eq("variant_id", variant_id)
      if (error) throw error
      return { variant_id, quantity: newQuantity, updated: true }
    } catch (error: any) {
      return rejectWithValue(error.message || error)
    }
  }
)

export const setQuantity = createAsyncThunk(
  'cart/setQuantity',
  async ({ variant_id, quantity }: { variant_id: number; quantity: number }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const user = state.auth.user
    
    try {
      // 📦 Fetch current stock
      const { data: variant, error: stockErr } = await supabase
        .from("product_variant")
        .select("stock")
        .eq("id", variant_id)
        .single()
      
      if (stockErr) throw stockErr
      const availableStock = variant?.stock ?? 0

      let newQuantity = isNaN(quantity) || !isFinite(quantity) ? 1 : Math.max(1, quantity)
      let limitReached = false
      if (newQuantity > availableStock) {
        newQuantity = availableStock
        limitReached = true
      }

      if (!user) {
        const items = readGuestCart()
        const newItems = items.map(i => i.variant_id === variant_id ? { ...i, quantity: newQuantity } : i)
        writeGuestCart(newItems)
        return { items: newItems, cartId: null, limitReached, stock: availableStock }
      }

      const cartId = (state.cart as CartState).cartId
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("cart_id", cartId).eq("variant_id", variant_id)
      if (error) throw error
      return { variant_id, quantity: newQuantity, updated: true, limitReached, stock: availableStock }
    } catch (error: any) {
      return rejectWithValue(error.message || error)
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (variant_id: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const user = state.auth.user

    if (!user) {
      const items = readGuestCart()
      const newItems = items.filter(i => i.variant_id !== variant_id)
      writeGuestCart(newItems)
      return { items: newItems, cartId: null }
    }

    try {
      const cartId = (state.cart as CartState).cartId
      const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId).eq("variant_id", variant_id)
      if (error) throw error
      return { variant_id, removed: true }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadGuestCart: (state) => {
      state.items = readGuestCart()
    },
    clearCartState: (state) => {
      state.items = []
      state.cartId = null
      state.activeStep = 1
      state.selectedShipping = null
      state.shippingCost = 0
      writeShipping(null)
      if (typeof writeGuestCart !== 'undefined') writeGuestCart([])
    },
    setShipping: (state, action: PayloadAction<{ name: string; cost: number }>) => {
      state.selectedShipping = action.payload
      state.shippingCost = action.payload.cost
      writeShipping(action.payload)
    },
    setActiveStep: (state, action: PayloadAction<1 | 2 | 3>) => {
      state.activeStep = action.payload
    },
    clearCartItems: (state) => {
      state.items = []
      state.selectedShipping = null
      state.shippingCost = 0
      writeShipping(null)
      if (typeof writeGuestCart !== 'undefined') writeGuestCart([])
    },
    removeProductFromCartStore: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending'),
        (state) => {
          // Only show loading skeleton if we have no items yet
          if (state.items.length === 0) {
            state.loading = true;
          }
          state.error = null
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/fulfilled'),
        (state, action: PayloadAction<{ items: CartItem[]; cartId: string | null; addedItem?: CartItem; variant_id?: number; quantity?: number; removed?: boolean }>) => {
          state.loading = false

          if (action.type === 'cart/fetchCart/fulfilled' || action.payload.items?.length > 0) {
            state.items = action.payload.items || []
            state.cartId = action.payload.cartId
          } else if (action.type === 'cart/addToCart/fulfilled' && action.payload.addedItem) {
            const item = action.payload.addedItem;
            const existing = state.items.find(i => i.variant_id === item.variant_id);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              state.items.push(item);
            }
          } else if ((action.type === 'cart/updateQuantity/fulfilled' || action.type === 'cart/setQuantity/fulfilled') && action.payload.variant_id) {
            const item = state.items.find(i => i.variant_id === action.payload.variant_id);
            if (item) {
              item.quantity = action.payload.quantity!;
            }
          } else if (action.type === 'cart/removeFromCart/fulfilled' && action.payload.variant_id) {
            state.items = state.items.filter(i => i.variant_id !== action.payload.variant_id);
          } else if (action.type === 'cart/clearCart/fulfilled') {
            state.items = []
            state.selectedShipping = null
            state.shippingCost = 0
            state.activeStep = 3 // Typically called on success
          }
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action: PayloadAction<any>) => {
          state.loading = false
          state.error = action.payload
        }
      )
  },
})

export const { loadGuestCart, clearCartState, setActiveStep, setShipping, clearCartItems, removeProductFromCartStore } = cartSlice.actions
export default cartSlice.reducer
