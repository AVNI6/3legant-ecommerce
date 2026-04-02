import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BlogState {
  items: any[]
  page: number
  totalCount: number
  hasMore: boolean
  initialized: boolean
}

const initialState: BlogState = {
  items: [],
  page: 1,
  totalCount: 0,
  hasMore: true,
  initialized: false,
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setInitialBlogs: (state, action: PayloadAction<{ items: any[], totalCount: number }>) => {
      // Only initialize if not already initialized
      if (!state.initialized) {
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.hasMore = action.payload.items.length < action.payload.totalCount
        state.initialized = true
      }
    },
    appendBlogs: (state, action: PayloadAction<any[]>) => {
      state.items = [...state.items, ...action.payload]
      state.hasMore = state.items.length < state.totalCount
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    resetBlogState: (state) => {
      state.items = []
      state.page = 1
      state.totalCount = 0
      state.hasMore = true
      state.initialized = false
    }
  },
})

export const { setInitialBlogs, appendBlogs, setPage, resetBlogState } = blogSlice.actions
export default blogSlice.reducer
