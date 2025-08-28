import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from "./slices/authSlice"
import dashboardReducer from "./slices/dashboardSlice"
import uiReducer from "./slices/uiSlice"
import subscriptionReducer from "./slices/subscriptionSlice"
import agentAuthReducer from "./slices/agentAuthSlice"
import agentDashboardReducer from "./slices/agentDashboardSlice"

// Configure persistence for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated', 'connectedPlatforms'],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    subscription: subscriptionReducer,
    agentAuth: agentAuthReducer,
    agentDashboard: agentDashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
