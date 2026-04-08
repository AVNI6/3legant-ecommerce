import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'
import { CartItem } from '@/types'
import { getEffectivePrice } from '@/constants/Data'

interface WishlistState {
  items: CartItem[]
  loading: boolean
  initialized: boolean
  error: string | null
  totalCount: number
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  initialized: false,
  error: null,
  totalCount: 0,
}

import { resolveVariantColor, resolveVariantImage } from '@/lib/utils/variantUtils'

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (payload: string | { userId: string; page?: number; pageSize?: number }, { rejectWithValue }) => {
    const userId = typeof payload === 'string' ? payload : payload.userId
    const page = typeof payload === 'object' ? payload.page : undefined
    const pageSize = typeof payload === 'object' ? payload.pageSize : undefined

    try {
      let query = supabase
        .from("wishlist")
        .select(`
          variant_id,
          product_variant (
            id, color, color_images, price, old_price, thumbnails,
            products (id, name, image, validation_till)
          )
        `, { count: 'exact' })
        .eq("user_id", userId)

      if (page !== undefined && pageSize !== undefined) {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) throw error

      const items = (data ?? []).map((item: any) => {
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
          quantity: 1,
        } as CartItem
      }).filter(Boolean) as CartItem[]

      return { items, count: count || 0 }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (payload: { product: Omit<CartItem, 'quantity'>; userId: string }, { getState, rejectWithValue }) => {
    const { product, userId } = payload
    const state: any = getState()
    const exists = state.wishlist.items.find((item: CartItem) => item.variant_id === product.variant_id)

    try {
      if (exists) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", userId)
          .eq("variant_id", product.variant_id)
        if (error) throw error
        return { product, isRemoving: true }
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: userId, variant_id: product.variant_id })
        if (error) throw error
        return { product, isRemoving: false }
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
    },
    hydrateWishlist: (state, action: PayloadAction<{ items: CartItem[]; totalCount: number }>) => {
      state.items = action.payload.items
      state.totalCount = action.payload.totalCount
      state.loading = false
      state.initialized = true
      state.error = null
    },
    clearWishlist: (state) => {
      state.items = []
    },
    removeProductFromWishlistStore: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.totalCount = action.payload.count
        state.initialized = true
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true
      })
      .addCase(toggleWishlist.fulfilled, (state, action: PayloadAction<{ product: any, isRemoving: boolean }>) => {
        const { product, isRemoving } = action.payload;
        if (isRemoving) {
          state.items = state.items.filter(i => Number(i.variant_id) !== Number(product.variant_id));
        } else {
          // Check if already in items to prevent duplicates (though toggle logic handles it)
          const exists = state.items.find(i => Number(i.variant_id) === Number(product.variant_id));
          if (!exists) {
            state.items.push(product);
          }
        }
      })
  },
})

export const { setWishlistItems, hydrateWishlist, clearWishlist, removeProductFromWishlistStore } = wishlistSlice.actions
export default wishlistSlice.reducer
