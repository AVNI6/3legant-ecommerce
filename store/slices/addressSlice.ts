import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'
import { Address } from '@/types'

interface AddressState {
  addresses: (Address & { id?: string })[]
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
  cacheExpiry: number // milliseconds (30 minutes default)
  cachedUserId: string | null // Track which user's addresses are cached
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes
  cachedUserId: null,
}

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (
    payload: string | { userId: string; force?: boolean },
    { rejectWithValue }
  ) => {
    const userId = typeof payload === 'string' ? payload : payload.userId
    try {
      console.log(`[ADDRESS] Fetching addresses for user: ${userId}`)
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`[ADDRESS] Error fetching addresses for user ${userId}:`, error.message)
        return rejectWithValue(error.message)
      }

      console.log(`[ADDRESS] Successfully fetched ${data?.length || 0} addresses for user ${userId}`)
      return data || []
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
      const force = typeof payload === 'string' ? false : !!payload.force
      
      // Always fetch if explicitly forced
      if (force) {
        console.log(`[ADDRESS] Force fetch requested for user ${userId}`)
        return true
      }
      
      // Always fetch if different user (cache for different user is invalid)
      if (slice.cachedUserId !== userId) {
        console.log(`[ADDRESS] Cache invalidated: was for user ${slice.cachedUserId}, now requesting ${userId}`)
        return true
      }
      
      // Don't fetch if already loading
      if (slice.loading) {
        console.log(`[ADDRESS] Already loading addresses, skipping fetch`)
        return false
      }

      // Check if cache is still valid for the same user
      if (slice.lastFetchedAt && Array.isArray(slice.addresses) && slice.addresses.length > 0) {
        const age = Date.now() - slice.lastFetchedAt
        if (age < slice.cacheExpiry) {
          console.log(`[ADDRESS] Using cached addresses for user ${userId} (age: ${age}ms)`)
          return false
        }
      }

      console.log(`[ADDRESS] Cache expired or empty for user ${userId}, fetching fresh`)
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
    { addressId, updates }: { addressId: string; updates: AddressPayload },
    { rejectWithValue }
  ) => {
    try {
      const payload = toDbAddress(updates)

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
      console.log('[ADDRESS REDUCER] Cache invalidated')
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
        state.addresses = action.payload
        state.lastFetchedAt = Date.now()
        // Track which user's addresses are cached
        const userId = typeof action.meta.arg === 'string' ? action.meta.arg : action.meta.arg.userId
        state.cachedUserId = userId
        console.log(`[ADDRESS REDUCER] Cached addresses for user: ${userId}`)
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
