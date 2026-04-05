import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlogState {
  items: any[]
  page: number
  totalCount: number
  hasMore: boolean
  initialized: boolean
  loading: boolean
}

const initialState: BlogState = {
  items: [],
  page: 1,
  totalCount: 0,
  hasMore: true,
  initialized: false,
  loading: false,
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setInitialBlogs: (state, action: PayloadAction<{ items: any[], totalCount: number }>) => {
      state.items = action.payload.items
      state.totalCount = action.payload.totalCount
      state.hasMore = action.payload.items.length < action.payload.totalCount
      state.initialized = true
      state.loading = false
    },
    setBlogs: (state, action: PayloadAction<{ items: any[], totalCount: number, replace?: boolean }>) => {
      if (action.payload.replace) {
        state.items = action.payload.items
      } else {
        state.items = [...state.items, ...action.payload.items]
      }
      state.totalCount = action.payload.totalCount
      state.hasMore = state.items.length < action.payload.totalCount
      state.loading = false
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    resetBlogState: (state) => {
      state.items = []
      state.page = 1
      state.totalCount = 0
      state.hasMore = true
      state.initialized = false
      state.loading = false
    }
  },
})

export const { setInitialBlogs, setBlogs, setPage, setLoading, resetBlogState } = blogSlice.actions
export default blogSlice.reducer
