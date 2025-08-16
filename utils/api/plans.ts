import serverHandler from '../serverHandler';

// Plan interface matching the database schema
export interface Plan {
  id: number;
  title: string;
  short_description: string;
  allow_tag: boolean;
  allow_note: boolean;
  allow_chatbot: boolean;
  contact_limit: number;
  allow_api: boolean;
  is_trial: boolean;
  price: number;
  price_strike?: number;
  plan_duration_in_days: number;
}

// Admin Plan Management
export const adminPlansAPI = {
  // Add new plan
  addPlan: async (planData: Omit<Plan, 'id'>) => {
    const response = await serverHandler.post('/api/admin/add_plan', planData);
    return response.data;
  },

  // Get all plans
  getPlans: async () => {
    const response = await serverHandler.get('/api/admin/get_plans');
    return response.data;
  },

  // Delete plan
  deletePlan: async (planId: number) => {
    const response = await serverHandler.post('/api/admin/del_plan', { id: planId });
    return response.data;
  },

  // Update user's plan (admin)
  updateUserPlan: async (uid: string, planId: number) => {
    const response = await serverHandler.post('/api/admin/update_plan', { uid, planId });
    return response.data;
  },

  // Get payment gateway settings
  getPaymentGatewaySettings: async () => {
    const response = await serverHandler.get('/api/admin/get_payment_gateway_admin');
    return response.data;
  },

  // Update payment gateway settings
  updatePaymentGatewaySettings: async (settings: {
    pay_stripe_key: string;
    pay_stripe_id: string;
    rz_id: string;
    rz_key: string;
    pay_paypal_id: string;
    pay_paypal_key: string;
  }) => {
    const response = await serverHandler.post('/api/admin/update_pay_gateway', settings);
    return response.data;
  }
};

// User Plan Operations
export const userPlansAPI = {
  // Get available plans for users
  getPlans: async () => {
    const response = await serverHandler.get('/api/user/get_plans');
    return response.data;
  },

  // Get plan details by ID
  getPlanDetails: async (planId: number) => {
    const response = await serverHandler.post('plan_details', { id: planId });
    return response.data;
  },

  // Start free trial
  startFreeTrial: async (planId: number) => {
    const response = await serverHandler.post('/api/user/start_free_trial', { planId });
    return response.data;
  },

  // Create Stripe session
  createStripeSession: async (planId: number) => {
    const response = await serverHandler.post('/api/user/create_stripe_session', { planId });
    return response.data;
  },

  // Pay with Razorpay
  payWithRazorpay: async (paymentId: string, plan: Plan, amount: string) => {
    const response = await serverHandler.post('/api/user/pay_with_razorpay', {
      rz_payment_id: paymentId,
      plan,
      amount
    });
    return response.data;
  },

  // Pay with PayPal
  payWithPayPal: async (orderId: string, plan: Plan) => {
    const response = await serverHandler.post('/api/user/pay_with_paypal', {
      orderID: orderId,
      plan
    });
    return response.data;
  },

  // Create Razorpay order
  createRazorpayOrder: async (planId: number, amount: number) => {
    const response = await serverHandler.post('/api/user/create_razorpay_order', { planId, amount });
    return response.data;
  }
};

// Subscription status interface
export interface SubscriptionStatus {
  active: boolean;
  plan_id: number;
  plan_name: string;
  expires_at: string;
  features: {
    allow_tag: boolean;
    allow_note: boolean;
    allow_chatbot: boolean;
    allow_api: boolean;
  };
} 