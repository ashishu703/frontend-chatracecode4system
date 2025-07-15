import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface DashboardStats {
  totalChats: number
  totalChatbots: number
  totalContacts: number
  totalFlows: number
  totalBroadcasts: number
  totalTemplates: number
}

interface DashboardState {
  currentView: string
  stats: DashboardStats
}

const initialState: DashboardState = {
  currentView: "dashboard",
  stats: {
    totalChats: 0,
    totalChatbots: 0,
    totalContacts: 0,
    totalFlows: 0,
    totalBroadcasts: 0,
    totalTemplates: 0,
  },
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<string>) => {
      state.currentView = action.payload
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
})

export const { setCurrentView, updateStats } = dashboardSlice.actions
export default dashboardSlice.reducer
