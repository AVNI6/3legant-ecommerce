import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'
import { Address } from '@/types'

interface AddressState {
  addresses: (Address & { id?: string })[]
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
  cacheExpiry: number
  cachedUserId: string | null
  totalCount: number
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
  cacheExpiry: 30 * 60 * 1000,
  cachedUserId: null,
  totalCount: 0,
}

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (
    payload: string | { userId: string; force?: boolean; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    const userId = typeof payload === 'string' ? payload : payload.userId
    const page = typeof payload === 'object' ? payload.page : undefined
    const pageSize = typeof payload === 'object' ? payload.pageSize : undefined

    try {

      let query = supabase
        .from('addresses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (page !== undefined && pageSize !== undefined) {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        console.error(`[ADDRESS] Error fetching addresses for user ${userId}:`, error.message)
        return rejectWithValue(error.message)
      }

      return { data: data || [], count: count || 0 }
    } catch (error: any) {
      console.error(`[ADDRESS] Exception fetching addresses for user ${userId}:`, error.message)
      return rejectWithValue(error.message)
    }
  },
  {
    condition: (payload, { getState }) => {
      const state = getState() as any
      const slice = state.addresses
      if (!slice) return true

      const userId = typeof payload === 'string' ? payload : payload.userId
      const force = typeof payload === 'object' ? !!payload.force : false
      const isPaginated = typeof payload === 'object' && payload.page !== undefined

      // Always fetch if explicitly forced or if requesting a specific page for server-side pagination
      if (force || isPaginated) {
        return true
      }

      // Always fetch if different user (cache for different user is invalid)
      if (slice.cachedUserId !== userId) {
        return true
      }

      // Don't fetch if already loading
      if (slice.loading) {
        return false
      }

      // Check if cache is still valid for the same user
      if (slice.lastFetchedAt && Array.isArray(slice.addresses) && slice.addresses.length > 0) {
        const age = Date.now() - slice.lastFetchedAt
        if (age < slice.cacheExpiry) {
          return false
        }
      }

      return true
    },
  }
)

type AddressPayload = Partial<Address> & {
  addressLabel?: string
  addressType?: string
  isDefault?: boolean
}

const toDbAddress = (address: AddressPayload) => ({
  first_name: address.firstName ?? null,
  last_name: address.lastName ?? null,
  phone: address.phone ?? null,
  street: address.street ?? null,
  city: address.city ?? null,
  state: address.state ?? null,
  zip: address.zip ?? null,
  country: address.country ?? null,
  address_label: address.addressLabel ?? 'Home',
  address_type: address.addressType ?? 'shipping',
  is_default: !!address.isDefault,
})

export const createAddressThunk = createAsyncThunk(
  'addresses/createAddress',
  async (
    { userId, address }: { userId: string; address: AddressPayload },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        ...toDbAddress(address),
        user_id: userId,
      }

      // If new address is default, clear previous defaults first.
      if (payload.is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert(payload)
        .select('*')
        .single()

      if (error) return rejectWithValue(error.message)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateAddressThunk = createAsyncThunk(
  'addresses/updateAddress',
  async (
    { addressId, updates, userId }: { addressId: string; updates: AddressPayload; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const payload = toDbAddress(updates)

      // 🔄 If this update is making the address default, clear others first
      if (payload.is_default) {
        const { error: clearErr } = await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId)

        if (clearErr) console.warn("[ADDRESS] Failed to clear previous defaults during update:", clearErr.message)
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(payload)
        .eq('id', addressId)
        .select('*')
        .single()

      if (error) return rejectWithValue(error.message)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeAddressThunk = createAsyncThunk(
  'addresses/removeAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', addressId)
      if (error) return rejectWithValue(error.message)
      return addressId
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const setDefaultAddressThunk = createAsyncThunk(
  'addresses/setDefaultAddress',
  async (
    { userId, addressId }: { userId: string; addressId: string },
    { rejectWithValue }
  ) => {
    try {
      const clearResult = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)

      if (clearResult.error) return rejectWithValue(clearResult.error.message)

      const setResult = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .select('*')
        .single()

      if (setResult.error) return rejectWithValue(setResult.error.message)
      return setResult.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    // Add a new address to the cache
    addAddressToCache(state, action: PayloadAction<Address & { id?: string }>) {
      state.addresses.unshift(action.payload)
    },
    // Remove address from cache
    removeAddressFromCache(state, action: PayloadAction<string>) {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload)
    },
    // Clear cache to force refresh on next fetch
    invalidateAddressCache(state) {
      state.lastFetchedAt = null
      state.addresses = []
      state.cachedUserId = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false
        state.addresses = action.payload.data
        state.totalCount = action.payload.count
        state.lastFetchedAt = Date.now()

        const arg = action.meta.arg
        const userId = typeof arg === 'string' ? arg : arg.userId
        state.cachedUserId = userId
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        console.error(`[ADDRESS REDUCER] Failed to fetch addresses: ${state.error}`)
      })
      .addCase(createAddressThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAddressThunk.fulfilled, (state, action) => {
        state.loading = false
        state.addresses.unshift(action.payload)
      })
      .addCase(createAddressThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateAddressThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.addresses.findIndex((a) => a.id === action.payload.id)
        if (idx !== -1) state.addresses[idx] = action.payload
      })
      .addCase(updateAddressThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(removeAddressThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeAddressThunk.fulfilled, (state, action) => {
        state.loading = false
        state.addresses = state.addresses.filter((a) => a.id !== action.payload)
      })
      .addCase(removeAddressThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(setDefaultAddressThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.loading = false
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === action.payload.id,
        }))
      })
      .addCase(setDefaultAddressThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { addAddressToCache, removeAddressFromCache, invalidateAddressCache } = addressSlice.actions
export default addressSlice.reducer

// Selector to check if cache is still valid
export const selectIsAddressCacheValid = (state: any) => {
  const { lastFetchedAt, cacheExpiry } = state.addresses
  if (!lastFetchedAt) return false
  return Date.now() - lastFetchedAt < cacheExpiry
}

// Selector to get addresses with cache check
export const selectAddresses = (state: any) => state.addresses.addresses
