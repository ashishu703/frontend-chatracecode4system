"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { userPlansAPI, Plan } from "@/utils/api/plan/plans"
import { formatPrice, PaymentMethod } from "@/utils/api/plan/payment"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, Banknote, Check } from "lucide-react"
import { FaPaypal } from "react-icons/fa"
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { useAuth } from '@/hooks/useAuth';
// Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    try {
      if (document.getElementById('razorpay-sdk')) {
        console.log('Razorpay script already loaded');
        return resolve(true);
      }
      
      console.log('Loading Razorpay script...');
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Razorpay script loading timeout'));
      }, 10000); // 10 second timeout
      
      script.onload = () => {
        clearTimeout(timeout);
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Failed to load Razorpay script:', error);
        reject(new Error('Failed to load Razorpay script'));
      };
    document.body.appendChild(script);
    } catch (error) {
      console.error('Error in loadRazorpayScript:', error);
      reject(error);
    }
  });
};

function CheckoutPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get('plan')
  const fromRegister = searchParams.get('from') === 'register'
  const { register } = useAuth()
  
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [gateways, setGateways] = useState<any>({})
  const [pendingRegistration, setPendingRegistration] = useState<any>(null)

  // Determine which payment methods are active based on gateway settings
  const stripeActive = gateways?.stripe_active === true || gateways?.stripe_active === "true" || gateways?.stripe_active === 1
  const rzActive = gateways?.rz_active === true || gateways?.rz_active === "true" || gateways?.rz_active === 1
  const paypalActive = gateways?.paypal_active === true || gateways?.paypal_active === "true" || gateways?.paypal_active === 1
  const offlineActive = gateways?.offline_active === true || gateways?.offline_active === "true" || gateways?.offline_active === 1

  useEffect(() => {
    if (planId) {
      fetchPlanDetails()
      fetchGateways()
      
      // If coming from registration, get the pending registration data
      if (fromRegister) {
        const storedData = localStorage.getItem('pendingRegistration')
        if (storedData) {
          try {
            setPendingRegistration(JSON.parse(storedData))
          } catch (error) {
            console.error('Error parsing registration data:', error)
          }
        }
      }
    } else {
      router.push('/plans')
    }
  }, [planId, fromRegister])

  const fetchPlanDetails = async () => {
    try {
      setLoading(true)
      const response = await userPlansAPI.getPlanDetails(parseInt(planId!))
      if ((response as any).success) {
        setPlan((response as any).data)
      }
    } catch (error) {
      console.error('Error fetching plan details:', error)
      toast.error('Failed to fetch plan details')
      router.push('/plans')
    } finally {
      setLoading(false)
    }
  }

  const fetchGateways = async () => {
    try {
      const response = await serverHandler.get('/api/user/get_payment_details');
      setGateways((response as any).data?.data || {});
    } catch (error) {
      console.error('Error fetching gateways:', error);
      setGateways({})
    }
  }

  // Helper function to handle registration after successful payment
  const handleRegistrationAfterPayment = async () => {
    if (!fromRegister || !pendingRegistration) {
      return false;
    }

    try {
      // Register the user
      await register(
        pendingRegistration.email,
        pendingRegistration.name,
        pendingRegistration.password,
        pendingRegistration.mobile_with_country_code,
        pendingRegistration.acceptPolicy,
        pendingRegistration.plan_id
      );
      
      // Clear pending registration data
      localStorage.removeItem('pendingRegistration');
      
      // Show success message with light green color
      toast.success('Account registration successful!', {
        style: {
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        }
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Registration failed after payment:', error);
      toast.error('Payment successful but registration failed. Please contact support.');
      router.push('/register');
      return false;
    }
  }

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !plan) {
      toast.error('Please select a payment method')
      return
    }

    setProcessing(true)

    try {
      switch (selectedPaymentMethod) {
        case PaymentMethod.STRIPE:
          await handleStripePayment()
          break
        case PaymentMethod.RAZORPAY:
          await handleRazorpayPayment()
          break
        case PaymentMethod.PAYPAL:
          await handlePayPalPayment()
          break
        case PaymentMethod.OFFLINE:
          await handleOfflinePayment()
          break
        default:
          toast.error('Invalid payment method')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleStripePayment = async () => {
    try {
      const response = await userPlansAPI.createStripeSession(plan!.id)
      if ((response as any).success) {
        // Store registration data in sessionStorage for Stripe redirect
        if (fromRegister && pendingRegistration) {
          sessionStorage.setItem('pendingRegistration', JSON.stringify(pendingRegistration));
          toast.info('Redirecting to Stripe. After payment, you will be redirected back to complete registration.');
        }
        window.location.href = (response as any).session.url
      }
    } catch (error) {
      throw error
    }
  }

  const handleRazorpayPayment = async () => {
    try {
      // Validate plan and payment method
      if (!plan || !plan.id || !plan.price) {
        throw new Error('Invalid plan data');
      }
      
      if (!selectedPaymentMethod) {
        throw new Error('No payment method selected');
      }
      
      console.log('Starting Razorpay payment for plan:', plan);
      
      await loadRazorpayScript()
      const orderRes = await userPlansAPI.createRazorpayOrder(plan.id, plan.price)
      
      console.log('Razorpay order response:', orderRes)
      
      if (!(orderRes && (orderRes as any).success && (orderRes as any).order_id)) {
        console.error('Razorpay order creation failed:', orderRes)
        toast.error('Failed to create Razorpay order')
        return
      }
      
      const options = {
        key: (orderRes as any).key, 
        amount: (orderRes as any).amount,
        currency: (orderRes as any).currency,
        name: (orderRes as any).name || 'Subscription',
        description: (orderRes as any).description || plan!.title,
        notes: (orderRes as any).notes || {},
        theme: { color: '#3399cc' },
        // Remove order_id as it's not needed for standard checkout
        // Add required parameters for better integration
        modal: {
          ondismiss: function() {
            console.log('Razorpay modal dismissed')
            toast.info('Payment cancelled')
          }
        },
        handler: async function (response: any) {
          try {
            console.log('Razorpay payment response:', response)
            
            // Validate payment response
            if (!response.razorpay_payment_id) {
              throw new Error('Invalid payment response from Razorpay');
            }
            
            console.log('Processing payment with backend...');
            
            // Process the payment with backend
            const backendResponse = await userPlansAPI.payWithRazorpay(
              response.razorpay_payment_id, 
              plan!, 
              (orderRes as any).amount
            );
            
            console.log('Backend payment response:', backendResponse);
            
            if (backendResponse && (backendResponse as any).success) {
              // If user came from registration, register them first
              if (fromRegister && pendingRegistration) {
                const registrationSuccess = await handleRegistrationAfterPayment();
                if (!registrationSuccess) {
                  return; // Error handling is done in the helper function
                }
              } else {
                // Normal payment success flow
                toast.success('Payment successful!');
                router.push('/dashboard');
              }
            } else {
              throw new Error('Backend payment processing failed');
            }
          } catch (error) {
            console.error('Error processing Razorpay payment:', error)
            toast.error('Payment processing failed: ' + (error as any).message || 'Unknown error')
            
            // Don't redirect on error, let user try again
            setProcessing(false);
          }
        },
        // Add error handler
        prefill: {
          name: '', // Will be filled if user is logged in
          email: '', // Will be filled if user is logged in
          contact: '' // Will be filled if user is logged in
        },
        // Add additional options for better UX
        retry: {
          enabled: true,
          max_count: 3
        },
        remember_customer: true
      }
      
      console.log('Razorpay options:', options)
      
      // Validate Razorpay options
      if (!options.key || !options.amount || !options.currency) {
        throw new Error('Missing required Razorpay parameters');
      }
      
      // Check if Razorpay is available
      if (typeof window !== 'undefined' && !(window as any).Razorpay) {
        throw new Error('Razorpay SDK not loaded properly');
      }
      
      // @ts-ignore
      const rzp = new window.Razorpay(options)
      
      // Add error handling for Razorpay instance
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        toast.error('Payment failed: ' + (response.error.description || 'Unknown error'));
      });
      
      rzp.on('payment.cancelled', function () {
        console.log('Razorpay payment cancelled');
        toast.info('Payment cancelled');
      });
      
      rzp.open()
    } catch (error) {
      console.error('Razorpay error:', error)
      toast.error('Razorpay error: ' + (error as any).message || 'Unknown error')
    }
  }

  const handlePayPalPayment = async () => {
    try {
      // For PayPal, we'll handle registration immediately since it's not fully integrated
      if (fromRegister && pendingRegistration) {
        toast.info('PayPal integration coming soon. For now, please use another payment method.');
      } else {
        toast.info('PayPal integration coming soon');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast.error('PayPal payment failed');
    }
  }

  const handleOfflinePayment = async () => {
    try {
      // For offline payment, we need to handle registration immediately
      if (fromRegister && pendingRegistration) {
        const registrationSuccess = await handleRegistrationAfterPayment();
        if (registrationSuccess) {
          toast.success('Offline payment instructions sent to your email');
          // Registration and redirect will be handled by handleRegistrationAfterPayment
        }
      } else {
        toast.success('Offline payment instructions sent to your email');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Offline payment error:', error);
      toast.error('Failed to process offline payment');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading checkout...</span>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <Button onClick={() => router.push('/plans')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {fromRegister && pendingRegistration ? (
              <Button
                variant="ghost"
                onClick={() => router.push('/register')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Registration
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => router.push('/plans')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Plans
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {fromRegister && pendingRegistration ? 'Complete Registration & Payment' : 'Complete Your Purchase'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-600">{plan.short_description}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  </div>
                  {plan.price_strike && plan.price_strike > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(plan.price_strike)}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{plan.plan_duration_in_days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contact Limit</span>
                  <span>{plan.contact_limit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tags</span>
                  <span>{plan.allow_tag ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Notes</span>
                  <span>{plan.allow_note ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Chatbot</span>
                  <span>{plan.allow_chatbot ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>API Access</span>
                  <span>{plan.allow_api ? '✓' : '✗'}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{plan.price === 0 ? 'Free' : formatPrice(plan.price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedPaymentMethod || ''}
                onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
              >
                {stripeActive && (
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={PaymentMethod.STRIPE} id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center cursor-pointer">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Credit/Debit Card (Stripe)
                    </Label>
                  </div>
                )}
                {rzActive && (
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={PaymentMethod.RAZORPAY} id="razorpay" />
                    <Label htmlFor="razorpay" className="flex items-center cursor-pointer">
                      <Banknote className="w-5 h-5 mr-2" />
                      Razorpay
                    </Label>
                  </div>
                )}
                {paypalActive && (
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={PaymentMethod.PAYPAL} id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                      <FaPaypal className="w-5 h-5 mr-2" />
                      PayPal
                    </Label>
                  </div>
                )}
                {offlineActive && (
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={PaymentMethod.OFFLINE} id="offline" />
                    <Label htmlFor="offline" className="flex items-center cursor-pointer">
                      <Banknote className="w-5 h-5 mr-2" />
                      Bank Transfer
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {/* Registration Flow Note */}
              {fromRegister && pendingRegistration && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 text-center">
                    <strong>Note:</strong> After payment, your account will be created automatically and you'll be redirected to login.
                  </p>
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {fromRegister && pendingRegistration ? 'Complete Registration & Payment' : 'Complete Purchase'}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading checkout...</span>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
} 