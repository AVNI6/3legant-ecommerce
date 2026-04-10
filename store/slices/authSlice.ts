import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isAdmin: boolean
  adminChecked: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAdmin: false,
  adminChecked: false,
  loading: true,
}

export const checkIsAdmin = createAsyncThunk(
  'auth/checkIsAdmin',
  async (userId: string) => {
    const { data, error } = await supabase.rpc('is_admin', { user_id: userId })
    if (error) {
      console.warn('is_admin RPC check failed:', error.message)
      return false
    }
    return !!data
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      const newUser = action.payload.user;
      const newSession = action.payload.session;

      // Only update if something actually changed to prevent app-wide re-render loops
      const userChanged = (state.user?.id !== newUser?.id);
      const sessionChanged = (state.session?.access_token !== newSession?.access_token);
      const userUpdatedAtChanged = (state.user?.updated_at !== newUser?.updated_at);
      const userMetadataChanged = JSON.stringify(state.user?.user_metadata || {}) !== JSON.stringify(newUser?.user_metadata || {});
      const appMetadataChanged = JSON.stringify(state.user?.app_metadata || {}) !== JSON.stringify(newUser?.app_metadata || {});

      if (userChanged || sessionChanged || userUpdatedAtChanged || userMetadataChanged || appMetadataChanged || state.loading) {
        state.user = newUser;
        state.session = newSession;
        state.loading = false;

        // AUTH OPTIMIZATION: Trust JWT metadata for faster admin check
        const metaRole = (newUser?.app_metadata?.role || newUser?.user_metadata?.role || "").toLowerCase();
        
        if (newUser && metaRole === "admin") {
          state.isAdmin = true;
          state.adminChecked = true;
        } else if (userChanged || !newUser) {
          state.isAdmin = false;
          state.adminChecked = false;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkIsAdmin.fulfilled, (state, action) => {
      state.isAdmin = action.payload
      state.adminChecked = true
      if (action.payload && typeof window !== 'undefined') {
        localStorage.setItem('sb-admin-verified', 'true')
      }
    })
    builder.addCase(checkIsAdmin.rejected, (state) => {
      state.isAdmin = false
      state.adminChecked = true
    })
  },
})

export const { setAuth, setLoading } = authSlice.actions
export default authSlice.reducer
