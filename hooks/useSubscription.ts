import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { 
  fetchPlans, 
  fetchPlanDetails, 
  startFreeTrial, 
  createStripeSession,
  setSelectedPlan,
  setCurrentSubscription,
  clearError
} from '@/store/slices/subscriptionSlice'
import type { Plan, SubscriptionStatus } from '@/utils/api/plan/plans'

export function useSubscription() {
  const dispatch = useDispatch()
  const {
    plans,
    currentSubscription,
    loading,
    error,
    selectedPlan,
    paymentProcessing
  } = useSelector((state: RootState) => state.subscription)

  const getPlans = () => {
    dispatch(fetchPlans())
  }

  const getPlanDetails = (planId: number) => {
    dispatch(fetchPlanDetails(planId))
  }

  const handleStartTrial = (planId: number) => {
    dispatch(startFreeTrial(planId))
  }

  const handleStripePayment = (planId: number) => {
    dispatch(createStripeSession(planId))
  }

  const selectPlan = (plan: Plan | null) => {
    dispatch(setSelectedPlan(plan))
  }

  const updateSubscription = (subscription: SubscriptionStatus | null) => {
    dispatch(setCurrentSubscription(subscription))
  }

  const clearSubscriptionError = () => {
    dispatch(clearError())
  }

  return {
    // State
    plans,
    currentSubscription,
    loading,
    error,
    selectedPlan,
    paymentProcessing,
    
    // Actions
    getPlans,
    getPlanDetails,
    handleStartTrial,
    handleStripePayment,
    selectPlan,
    updateSubscription,
    clearSubscriptionError,
  }
} 