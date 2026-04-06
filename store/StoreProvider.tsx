"use client"

import { Provider } from "react-redux"
import { store } from "./index"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { setAuth, checkIsAdmin } from "./slices/authSlice"
import { fetchProducts } from "./slices/productSlice"
import { fetchCart, loadGuestCart, clearCartState } from "./slices/cartSlice"
import { fetchWishlist, clearWishlist } from "./slices/wishlistSlice"
import { useAppDispatch, useAppSelector } from "./hooks"
import { useRef } from "react"

const clearBrokenSupabaseSession = () => {
  if (typeof window === "undefined") return
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key) continue
      if (key.includes("-auth-token") || key.includes("supabase.auth.token")) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key))
  } catch (error) {
    console.warn("Failed to clear broken Supabase session data", error)
  }
}

function StoreInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  const productsInitialized = useAppSelector(state => state.products.initialized)
  const productsLoading = useAppSelector(state => state.products.loading)

  // Guard Refs to prevent double-dispatch in Strict Mode or fast re-renders
  const productsFetchAttempted = useRef(false)
  const authSetupAttempted = useRef(false)
  const lastFetchedUserIdRef = useRef<string | null>(null)

  // 1. Initial Data Fetch & Auth Setup
  useEffect(() => {
    // Only subscribe to auth changes once
    if (authSetupAttempted.current) return;
    authSetupAttempted.current = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const changedUser = session?.user ?? null

      // Update store with new session info
      dispatch(setAuth({ user: changedUser, session }))

      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        if (changedUser) {
          // Additional check to prevent redundant fetch for same user
          if (lastFetchedUserIdRef.current !== changedUser.id) {
            lastFetchedUserIdRef.current = changedUser.id
            dispatch(fetchCart(changedUser.id))
            dispatch(fetchWishlist(changedUser.id))
            void dispatch(checkIsAdmin(changedUser.id))
          }
        } else {
          dispatch(loadGuestCart())
        }
      }

      if (event === "SIGNED_OUT") {
        lastFetchedUserIdRef.current = null
        dispatch(clearCartState())
        dispatch(clearWishlist())
        dispatch(loadGuestCart())
      }
    })

    return () => {
      authSetupAttempted.current = false;
      authListener.subscription.unsubscribe()
    }
  }, [dispatch])

  // 2. Fetch Global Products (Removed from auto-load to optimize home page)
  // Moved to Navbar/Search for lazy-loading on demand

  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StoreInitializer>{children}</StoreInitializer>
    </Provider>
  )
}
