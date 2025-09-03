"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { userPlansAPI, Plan } from "@/utils/api/plan/plans"
import { formatPrice } from "@/utils/api/plan/payment"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Star } from "lucide-react"

export default function PlansDisplay() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await userPlansAPI.getPlans()
      if ((response as any).success) {
        setPlans((response as any).data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Failed to fetch plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan)
    router.push(`/checkout?plan=${plan.id}`)
  }

  const handleStartTrial = async (plan: Plan) => {
    try {
      const response = await userPlansAPI.startFreeTrial(plan.id)
      if ((response as any).success) {
        toast.success('Free trial started successfully!')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error starting trial:', error)
      toast.error('Failed to start free trial')
    }
  }

  const getFeatureIcon = (enabled: boolean) => {
    return enabled ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <div className="w-4 h-4 border border-gray-300 rounded" />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading plans...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. All plans include our core features with different limits and capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
              plan.is_trial ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <CardHeader className="text-center pb-4">
                {plan.is_trial && (
                  <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Trial
                  </Badge>
                )}
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {plan.title}
                </CardTitle>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  </div>
                  {plan.price_strike && plan.price_strike > 0 && (
                    <div className="text-lg text-gray-500 line-through">
                      {formatPrice(plan.price_strike)}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    per {plan.plan_duration_in_days} days
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center text-sm">
                  {plan.short_description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Contact Limit</span>
                    <span className="text-sm font-medium">{plan.contact_limit.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tags</span>
                    {getFeatureIcon(plan.allow_tag)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notes</span>
                    {getFeatureIcon(plan.allow_note)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chatbot</span>
                    {getFeatureIcon(plan.allow_chatbot)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Access</span>
                    {getFeatureIcon(plan.allow_api)}
                  </div>
                </div>

                <div className="pt-4">
                  {plan.is_trial ? (
                    <Button
                      onClick={() => handleStartTrial(plan)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Start Free Trial
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Subscribe Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>All plans include 24/7 support and a 30-day money-back guarantee.</p>
      </div>
    </div>
  )
} 