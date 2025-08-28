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

// Get initial state from localStorage if available
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      connectedPlatforms: [],
    }
  }

  try {
    const userLS = localStorage.getItem('user')
    const token = localStorage.getItem('serviceToken')
    
    if (userLS && token) {
      const user = JSON.parse(userLS)
      if (user && user.id && user.username) {
        return {
          user,
          isAuthenticated: true,
          connectedPlatforms: [],
        }
      }
    }
  } catch (error) {
    console.error('Failed to restore auth state:', error)
  }

  return {
    user: null,
    isAuthenticated: false,
    connectedPlatforms: [],
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
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
