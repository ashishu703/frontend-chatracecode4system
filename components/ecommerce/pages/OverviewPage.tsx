"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ecommerceApi } from "@/utils/api/ecommerce/ecommerceApi"

export default function OverviewPage() {
  const [connectedCatalogs, setConnectedCatalogs] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const data = await ecommerceApi.getOverview()
      setConnectedCatalogs(data.connectedCatalogs || 0)
    } catch (error) {
      console.error("Failed to fetch overview data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Commerce</h1>
        <p className="text-gray-600">Manage your WhatsApp storefront, catalogs, products and orders.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Commerce overview</h2>
        <Card className="p-6 rounded-lg border border-gray-200">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">CONNECTED CATALOGS</div>
          <div className="text-4xl font-bold text-gray-900 mb-4">{loading ? "..." : connectedCatalogs}</div>
          <p className="text-sm text-gray-600">
            Start by connecting a Meta product catalog from your WhatsApp Business account.
          </p>
        </Card>
      </div>
    </div>
  )
}
