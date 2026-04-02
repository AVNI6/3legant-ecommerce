import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'

interface Coupon {
  code: string
  discount: number
  expires_at?: string | null
}

interface CouponState {
  coupon: Coupon | null
  suggestions: any[]
  message: string | null
  loading: boolean
}

const initialState: CouponState = {
  coupon: null,
  suggestions: [],
  message: null,
  loading: false,
}

export const validateCoupon = createAsyncThunk(
  'coupon/validateCoupon',
  async ({ code, subtotal }: { code: string; subtotal: number }, { getState, rejectWithValue }) => {
    const state = getState() as any
    const userId = state.auth.user?.id

    try {
      // Check if user already used this coupon
      if (userId) {
        const { data: used, error: usedError } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .eq("coupon_code", code.toUpperCase())
          .neq("status", "cancelled")
          .limit(1)
        
        if (used && used.length > 0) {
          return rejectWithValue("You have already used this coupon")
        }
      }

      const { data, error } = await supabase
        .from("coupons")
        .select("code, active, discount_type, discount_value, min_order, expires_at, usage_limit, usage_count")
        .eq("code", code.toUpperCase())
        .maybeSingle()

      if (error || !data) return rejectWithValue("Invalid coupon code")
      if (!data.active) return rejectWithValue(`${data.code} is inactive`)
      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        return rejectWithValue(`${data.code} got expired`)
      }
      if (data.usage_limit !== null && Number(data.usage_count ?? 0) >= Number(data.usage_limit)) {
        return rejectWithValue(`${data.code} usage limit reached`)
      }
      if (Number(subtotal) < Number(data.min_order ?? 0)) {
        return rejectWithValue(`Minimum order ₹${data.min_order} required`)
      }

      let discount = 0
      if (data.discount_type === "percentage") {
        discount = Number(subtotal) * (Number(data.discount_value) / 100)
      } else if (data.discount_type === "fixed") {
        discount = Number(data.discount_value)
      }

      return {
        code: data.code,
        discount,
        expires_at: data.expires_at,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAvailableCoupons = createAsyncThunk(
  'coupon/fetchAvailableCoupons',
  async (_: void, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return data ?? []
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any
      const suggestions = state?.coupon?.suggestions
      return !(Array.isArray(suggestions) && suggestions.length > 0)
    },
  }
)

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    removeCoupon: (state) => {
      state.coupon = null
      state.message = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true
        state.message = null
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false
        state.coupon = action.payload
        state.message = null
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false
        state.coupon = null
        state.message = action.payload as string
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.suggestions = action.payload
      })
  },
})

export const { removeCoupon } = couponSlice.actions
export default couponSlice.reducer
