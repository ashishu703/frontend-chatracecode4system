// Payment utility functions

// Add days to current timestamp
export const addDaysToCurrentTimestamp = (days: number): number => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return Math.floor(currentDate.getTime() / 1000); // Convert to Unix timestamp
};

// Update user plan function
export const updateUserPlan = async (plan: any, uid: string) => {
  const planDays = parseInt(plan.plan_duration_in_days || 0);
  const timeStamp = addDaysToCurrentTimestamp(planDays);
  
  // This would typically call the backend API to update the user's plan
  // For now, we'll return the calculated data
  return {
    plan_id: plan.id,
    plan_expiration: timeStamp,
    uid
  };
};

// Format price for display
export const formatPrice = (price: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Validate payment data
export const validatePaymentData = (data: any): boolean => {
  const requiredFields = ['amount', 'planId', 'paymentMethod'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      return false;
    }
  }
  
  return true;
};

// Payment method types
export enum PaymentMethod {
  STRIPE = 'STRIPE',
  RAZORPAY = 'RAZORPAY',
  PAYPAL = 'PAYPAL',
  OFFLINE = 'OFFLINE'
}

// Payment status types
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Order interface
export interface Order {
  id: number;
  uid: string;
  payment_mode: PaymentMethod;
  amount: string;
  data: string; // JSON string of payment details
  s_token?: string; // Stripe session token
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
} 