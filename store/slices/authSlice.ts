import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: string
  username: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  connectedPlatforms: string[]
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  connectedPlatforms: [],
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.connectedPlatforms = []
    },
    connectPlatform: (state, action: PayloadAction<string>) => {
      if (!state.connectedPlatforms.includes(action.payload)) {
        state.connectedPlatforms.push(action.payload)
      }
    },
  },
})

export const { login, logout, connectPlatform } = authSlice.actions
export default authSlice.reducer
