"use client"

import SubscriptionStatus from "@/components/subscription/SubscriptionStatus"
import BillingHistory from "@/components/subscription/BillingHistory"

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and view billing history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SubscriptionStatus />
          <BillingHistory />
        </div>
      </div>
    </div>
  )
} 