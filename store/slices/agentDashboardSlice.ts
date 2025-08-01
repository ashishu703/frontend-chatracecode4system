import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AgentDashboardState {
  currentView: string
  conversations: any[]
  activeSessions: any[]
  notifications: any[]
}

const initialState: AgentDashboardState = {
  currentView: "dashboard",
  conversations: [],
  activeSessions: [],
  notifications: [],
}

const agentDashboardSlice = createSlice({
  name: "agentDashboard",
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentView = action.payload
    },
    setConversations: (state, action: PayloadAction<any[]>) => {
      state.conversations = action.payload
    },
    setActiveSessions: (state, action: PayloadAction<any[]>) => {
      state.activeSessions = action.payload
    },
    setNotifications: (state, action: PayloadAction<any[]>) => {
      state.notifications = action.payload
    },
    addConversation: (state, action: PayloadAction<any>) => {
      state.conversations.unshift(action.payload)
    },
    updateConversation: (state, action: PayloadAction<{ id: string; updates: any }>) => {
      const index = state.conversations.findIndex(conv => conv.id === action.payload.id)
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...action.payload.updates }
      }
    },
    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(conv => conv.id !== action.payload)
    },
  },
})

export const {
  setCurrentView,
  setConversations,
  setActiveSessions,
  setNotifications,
  addConversation,
  updateConversation,
  removeConversation
} = agentDashboardSlice.actions
export default agentDashboardSlice.reducer 