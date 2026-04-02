import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'
import couponReducer from './slices/couponSlice'
import orderReducer from './slices/orderSlice'
import addressReducer from './slices/addressSlice'
import blogReducer from './slices/blogSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    coupon: couponReducer,
    orders: orderReducer,
    addresses: addressReducer,
    blog: blogReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
