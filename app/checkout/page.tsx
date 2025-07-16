"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { userPlansAPI, Plan } from "@/utils/api/plans"
import { formatPrice, PaymentMethod } from "@/utils/payment"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, Banknote, Check } from "lucide-react"
import { FaPaypal } from "react-icons/fa"
import serverHandler from '@/utils/serverHandler';
// Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

function CheckoutPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get('plan')
  
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [gateways, setGateways] = useState<any>({})

  useEffect(() => {
    if (planId) {
      fetchPlanDetails()
      fetchGateways()
    } else {
      router.push('/plans')
    }
  }, [planId])

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
      setGateways(response.data?.data || {});
    } catch (error) {
      setGateways({})
    }
  }

  const handlePayment = async () => {
    console.log('Button clicked!')
    console.log('Selected payment method:', selectedPaymentMethod, 'Plan:', plan)
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
        window.location.href = (response as any).session.url
      }
    } catch (error) {
      throw error
    }
  }

  const handleRazorpayPayment = async () => {
    try {
      await loadRazorpayScript()
      const orderRes = await userPlansAPI.createRazorpayOrder(plan!.id, plan!.price)
      if (!(orderRes && orderRes.success && orderRes.order)) {
        toast.error('Failed to create Razorpay order')
        return
      }
      const options = {
        key: gateways.rz_key || orderRes.key, 
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        order_id: orderRes.order.id,
        name: 'Subscription',
        description: plan!.title,
        handler: async function (response: any) {
          await userPlansAPI.payWithRazorpay(response.razorpay_payment_id, plan!, orderRes.order.amount)
          toast.success('Payment successful!')
          router.push('/dashboard')
        },
        prefill: {},
        theme: { color: '#3399cc' }
      }
      // @ts-ignore
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      toast.error('Razorpay error')
    }
  }

  const handlePayPalPayment = async () => {
    toast.info('PayPal integration coming soon')
    // Here you would render the PayPal button and on approval call userPlansAPI.payWithPayPal
  }

  const handleOfflinePayment = async () => {
    toast.success('Offline payment instructions sent to your email')
    router.push('/dashboard')
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

  // Only show active payment methods
  const stripeActive = gateways.pay_stripe_id || gateways.stripe_active
  const rzActive = gateways.rz_id || gateways.rz_active
  const paypalActive = gateways.pay_paypal_id || gateways.paypal_active
  const offlineActive = gateways.pay_offline_key || gateways.offline_active

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/plans')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
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
                    Complete Purchase
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