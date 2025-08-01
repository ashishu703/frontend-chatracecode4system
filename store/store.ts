import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import dashboardReducer from "./slices/dashboardSlice"
import uiReducer from "./slices/uiSlice"
import subscriptionReducer from "./slices/subscriptionSlice"
import agentAuthReducer from "./slices/agentAuthSlice"
import agentDashboardReducer from "./slices/agentDashboardSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    subscription: subscriptionReducer,
    agentAuth: agentAuthReducer,
    agentDashboard: agentDashboardReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
