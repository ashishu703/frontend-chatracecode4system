import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Agent {
  uid: string
  name: string
  email: string
  mobile: string
  is_active: number
  comments?: string
  created_at: string
  updated_at: string
}

interface AgentAuthState {
  agent: Agent | null
  isAuthenticated: boolean
  token: string | null
}

const initialState: AgentAuthState = {
  agent: null,
  isAuthenticated: false,
  token: null,
}

const agentAuthSlice = createSlice({
  name: "agentAuth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Agent>) => {
      state.agent = action.payload
      state.isAuthenticated = true
      localStorage.setItem('agent', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.agent = null
      state.isAuthenticated = false
      state.token = null
      localStorage.removeItem('agent')
      localStorage.removeItem('agentToken')
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem('agentToken', action.payload)
    },
    updateAgent: (state, action: PayloadAction<Partial<Agent>>) => {
      if (state.agent) {
        state.agent = { ...state.agent, ...action.payload }
        localStorage.setItem('agent', JSON.stringify(state.agent))
      }
    },
  },
})

export const { login, logout, setToken, updateAgent } = agentAuthSlice.actions
export default agentAuthSlice.reducer 