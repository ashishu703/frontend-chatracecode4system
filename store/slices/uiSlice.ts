import { createSlice } from "@reduxjs/toolkit"

interface UIState {
  sidebarOpen: boolean
  loading: boolean
}

const initialState: UIState = {
  sidebarOpen: true,
  loading: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { toggleSidebar, setSidebarOpen, setLoading } = uiSlice.actions
export default uiSlice.reducer
