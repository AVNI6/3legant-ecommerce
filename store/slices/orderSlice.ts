import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'

export interface Order {
  id: number
  user_id: string
  order_date: string
  total_price: number
  status: string
  invoice_url?: string | null
  invoice_sent_at?: string | null
  refund_status?: string | null
  refund_amount?: number | null
  refund_reason?: string | null
  discount_amount?: number | null
  coupon_code?: string | null
  items_snapshot?: any[] | { items: any[] | null; shipping_method?: string; shipping_cost?: number } | null
  order_items: any[]
  shipping_address?: any
  billing_address?: any
  payment_method?: string
  admin_note?: string | null
}

interface OrderState {
  orders: Order[]
  cursor: string | null
  hasMore: boolean
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
  cursor: null,
  hasMore: true,
  loading: true,
  error: null,
}

export const fetchOrderHistory = createAsyncThunk(
  'orders/fetchOrderHistory',
  async ({ userId, cursor }: { userId: string; cursor?: string | null }, { rejectWithValue }) => {
    try {
      let query = supabase
        .from("orders")
        .select(`
            id, user_id, total_price, status, order_date, shipping_address, 
            payment_method, billing_address, items_snapshot, invoice_url, 
            invoice_sent_at, refund_status, refund_amount, refund_reason, 
            discount_amount, coupon_code, admin_note,
            order_items ( id, product_id, price, quantity, color, variant_id )
        `)
        .eq("user_id", userId)
        .order("order_date", { ascending: false })
        .limit(10)

      if (cursor) {
        query = query.lt("order_date", cursor)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        orders: data as Order[],
        hasMore: data.length === 10,
        cursor: data.length > 0 ? data[data.length - 1].order_date : null
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, totalAmount, adminNote }: { orderId: number, totalAmount: number, adminNote: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          amount: totalAmount,
          admin_note: adminNote,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Refund request failed");

      const { data, error } = await supabase
        .from("orders")
        .select(`
            id, user_id, total_price, status, order_date, shipping_address, payment_method, billing_address, items_snapshot, invoice_url, invoice_sent_at, refund_status, refund_amount, refund_reason, discount_amount, coupon_code, admin_note,
            order_items (id, product_id, price, quantity, color, variant_id)
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const submitRefund = createAsyncThunk(
  'orders/submitRefund',
  async ({ orderId, reason }: { orderId: number, reason: string }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          refund_status: "pending",
          refund_reason: reason,
        })
        .eq("id", orderId);

      if (error) throw error;

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
           id, user_id, total_price, status, order_date, shipping_address, payment_method, billing_address, items_snapshot, invoice_url, invoice_sent_at, refund_status, refund_amount, refund_reason, discount_amount, coupon_code, admin_note,
           order_items (id, product_id, price, quantity, color, variant_id)
       `)
        .eq("id", orderId)
        .single();

      if (fetchError) throw fetchError;
      return data as Order;
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const cancelRefundRequest = createAsyncThunk(
  'orders/cancelRefundRequest',
  async ({ orderId }: { orderId: number }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          refund_status: null,
          refund_reason: null,
        })
        .eq("id", orderId);

      if (error) throw error;

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
           id, user_id, total_price, status, order_date, shipping_address, payment_method, billing_address, items_snapshot, invoice_url, invoice_sent_at, refund_status, refund_amount, refund_reason, discount_amount, coupon_code, admin_note,
           order_items (id, product_id, price, quantity, color, variant_id)
       `)
        .eq("id", orderId)
        .single();

      if (fetchError) throw fetchError;
      return data as Order;
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    updateOrder: (state, action: PayloadAction<Partial<Order> & { id: number }>) => {
      const idx = state.orders.findIndex(o => o.id === action.payload.id)
      if (idx !== -1) {
        state.orders[idx] = { ...state.orders[idx], ...action.payload } as Order
      }
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      // Add to start (newest first)
      state.orders.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderHistory.pending, (state) => { state.loading = true })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false
        if (state.cursor === null) {
          state.orders = action.payload.orders
        } else {
          state.orders = [...state.orders, ...action.payload.orders]
        }
        state.cursor = action.payload.cursor
        state.hasMore = action.payload.hasMore
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o.id === action.payload.id)
        if (idx !== -1) state.orders[idx] = action.payload
      })
      .addCase(submitRefund.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o.id === action.payload.id)
        if (idx !== -1) state.orders[idx] = action.payload
      })
      .addCase(cancelRefundRequest.fulfilled, (state, action) => {
        const idx = state.orders.findIndex(o => o.id === action.payload.id)
        if (idx !== -1) state.orders[idx] = action.payload
      })
  },
})

export const { setOrders, updateOrder, addOrder } = orderSlice.actions
export default orderSlice.reducer
