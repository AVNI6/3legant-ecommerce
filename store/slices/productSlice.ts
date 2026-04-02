import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'
import { type ProductType } from '@/types/index'
import { mapProducts } from '@/lib/supabase/productMapping'

export { mapProducts }


interface ProductsState {
  items: ProductType[]
  loading: boolean
  initialized: boolean
  error: string | null
  sort: string
  grid: string
  visibleCount: number
}

const initialState: ProductsState = {
  items: [],
  loading: false, 
  initialized: false,
  error: null,
  sort: "default",
  grid: "one",
  visibleCount: 12,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch complete product rows to avoid schema mismatch issues across admin/store views
      const { data, error } = await supabase
        .from("products")
        .select(`
            *,
            product_variant (
              *
            )
          `)
        .eq("is_deleted", false)
        .limit(100)

      if (error) throw error

      return mapProducts(data ?? [])
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_variant (*)
        `)
        .eq("id", id)


      return mapProducts(data ?? [])
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload
    },
    setGrid: (state, action: PayloadAction<string>) => {
      state.grid = action.payload
    },
    setVisibleCount: (state, action: PayloadAction<number>) => {
      state.visibleCount = action.payload
    },
    incrementVisibleCount: (state, action: PayloadAction<number>) => {
      state.visibleCount += action.payload
    },
    setItems: (state, action: PayloadAction<ProductType[]>) => {
      state.items = action.payload
      state.initialized = true
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload
    },
    removeProductFromStore: (state, action: PayloadAction<number>) => {
      // payload is the product id
      state.items = state.items.filter((item) => item.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.initialized = true // Consider it attempted
        state.error = action.payload as string
      })
      .addCase(fetchProductById.pending, (state) => {
        // We don't necessarily want to set global loading: true if we have other items
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        // Safe Immer mutation: Update existing product or push new one
        const newProducts = action.payload;

        newProducts.forEach((newP) => {
          const idx = state.items.findIndex(item => item.variant_id === newP.variant_id);
          if (idx !== -1) {
            state.items[idx] = newP; // Directly mutate the draft proxy
          } else {
            state.items.push(newP);
          }
        });
      })
  },
})

export const { setSort, setGrid, setVisibleCount, incrementVisibleCount, setItems, setInitialized, removeProductFromStore } = productSlice.actions
export default productSlice.reducer
