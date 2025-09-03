import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Plan, SubscriptionStatus } from '@/utils/api/plan/plans'
import { userPlansAPI } from '@/utils/api/plan/plans'

interface SubscriptionState {
  plans: Plan[]
  currentSubscription: SubscriptionStatus | null
  loading: boolean
  error: string | null
  selectedPlan: Plan | null
  paymentProcessing: boolean
}

const initialState: SubscriptionState = {
  plans: [],
  currentSubscription: null,
  loading: false,
  error: null,
  selectedPlan: null,
  paymentProcessing: false,
}

// Async thunks
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async () => {
    const response = await userPlansAPI.getPlans()
    return response
  }
)

export const fetchPlanDetails = createAsyncThunk(
  'subscription/fetchPlanDetails',
  async (planId: number) => {
    const response = await userPlansAPI.getPlanDetails(planId)
    return response
  }
)

export const startFreeTrial = createAsyncThunk(
  'subscription/startFreeTrial',
  async (planId: number) => {
    const response = await userPlansAPI.startFreeTrial(planId)
    return response
  }
)

export const createStripeSession = createAsyncThunk(
  'subscription/createStripeSession',
  async (planId: number) => {
    const response = await userPlansAPI.createStripeSession(planId)
    return response
  }
)

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSelectedPlan: (state, action: PayloadAction<Plan | null>) => {
      state.selectedPlan = action.payload
    },
    setCurrentSubscription: (state, action: PayloadAction<SubscriptionStatus | null>) => {
      state.currentSubscription = action.payload
    },
    setPaymentProcessing: (state, action: PayloadAction<boolean>) => {
      state.paymentProcessing = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false
        if ((action.payload as any).success) {
          state.plans = (action.payload as any).data
        }
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch plans'
      })
      
      // Fetch plan details
      .addCase(fetchPlanDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlanDetails.fulfilled, (state, action) => {
        state.loading = false
        if ((action.payload as any).success) {
          state.selectedPlan = (action.payload as any).data
        }
      })
      .addCase(fetchPlanDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch plan details'
      })
      
      // Start free trial
      .addCase(startFreeTrial.pending, (state) => {
        state.paymentProcessing = true
        state.error = null
      })
      .addCase(startFreeTrial.fulfilled, (state, action) => {
        state.paymentProcessing = false
        if ((action.payload as any).success) {
          // Update current subscription if needed
          // This would typically come from the response
        }
      })
      .addCase(startFreeTrial.rejected, (state, action) => {
        state.paymentProcessing = false
        state.error = action.error.message || 'Failed to start free trial'
      })
      
      // Create Stripe session
      .addCase(createStripeSession.pending, (state) => {
        state.paymentProcessing = true
        state.error = null
      })
      .addCase(createStripeSession.fulfilled, (state, action) => {
        state.paymentProcessing = false
        if ((action.payload as any).success) {
          // Redirect to Stripe checkout
          window.location.href = (action.payload as any).session.url
        }
      })
      .addCase(createStripeSession.rejected, (state, action) => {
        state.paymentProcessing = false
        state.error = action.error.message || 'Failed to create payment session'
      })
  },
})

export const { 
  setSelectedPlan, 
  setCurrentSubscription, 
  setPaymentProcessing, 
  clearError 
} = subscriptionSlice.actions

export default subscriptionSlice.reducer 