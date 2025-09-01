"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SubscriptionStatus } from "@/utils/api/plan/plans"
import { formatPrice } from "@/utils/api/plan/payment"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Calendar, Check, X, AlertTriangle } from "lucide-react"

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true)
      // This would typically come from the user's profile or a dedicated endpoint
      // For now, we'll simulate the data
      const mockSubscription: SubscriptionStatus = {
        active: true,
        plan_id: 1,
        plan_name: "Premium Plan",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        features: {
          allow_tag: true,
          allow_note: true,
          allow_chatbot: true,
          allow_api: true,
        }
      }
      setSubscription(mockSubscription)
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      toast.error('Failed to fetch subscription status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!subscription) return null

    if (subscription.active) {
      const expiryDate = new Date(subscription.expires_at)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 7) {
        return (
          <Badge className="bg-yellow-500 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expires Soon
          </Badge>
        )
      } else {
        return (
          <Badge className="bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      }
    } else {
      return (
        <Badge className="bg-red-500 text-white">
          <X className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      )
    }
  }

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading subscription...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-2xl mr-2">💳</span>
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No active subscription found.</p>
            <Button onClick={() => router.push('/plans')} className="bg-blue-600 hover:bg-blue-700">
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <span className="text-2xl mr-2">💳</span>
            Subscription Status
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">{subscription.plan_name}</h3>
            <p className="text-sm text-gray-600">Current Plan</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              Expires: {formatExpiryDate(subscription.expires_at)}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              {subscription.features.allow_tag ? (
                <Check className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <X className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="text-sm">Tags</span>
            </div>
            <div className="flex items-center">
              {subscription.features.allow_note ? (
                <Check className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <X className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="text-sm">Notes</span>
            </div>
            <div className="flex items-center">
              {subscription.features.allow_chatbot ? (
                <Check className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <X className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="text-sm">Chatbot</span>
            </div>
            <div className="flex items-center">
              {subscription.features.allow_api ? (
                <Check className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <X className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="text-sm">API Access</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={() => router.push('/plans')}
            variant="outline"
            className="flex-1"
          >
            Change Plan
          </Button>
          <Button
            onClick={() => router.push('/billing')}
            variant="outline"
            className="flex-1"
          >
            Billing History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 