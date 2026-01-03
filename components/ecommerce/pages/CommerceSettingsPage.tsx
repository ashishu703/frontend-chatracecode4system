"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ecommerceApi } from "@/utils/api/ecommerce/ecommerceApi"
import { useToast } from "@/components/ui/use-toast"

export default function CommerceSettingsPage() {
  const [settings, setSettings] = useState({
    showCatalog: false,
    enableCart: false,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await ecommerceApi.getCommerceSettings()
      setSettings({
        showCatalog: data.showCatalog || false,
        enableCart: data.enableCart || false,
      })
    } catch (error) {
      console.error("Failed to fetch commerce settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value }
      setSettings(newSettings)
      await ecommerceApi.updateCommerceSettings(newSettings)
      toast({ title: "Settings updated", variant: "default" })
    } catch (error) {
      toast({ title: "Failed to update settings", variant: "destructive" })
      // Revert on error
      fetchSettings()
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Commerce</h1>
        <p className="text-gray-600">Manage your WhatsApp storefront, catalogs, products and orders.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Commerce settings</h2>

        {loading ? (
          <div className="text-center py-8">Loading settings...</div>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Show catalog in WhatsApp</h3>
                  <p className="text-sm text-gray-600">
                    When this is ON, customers can see and browse your WhatsApp product catalog.
                  </p>
                </div>
                <Switch
                  checked={settings.showCatalog}
                  onCheckedChange={(checked) => handleToggle("showCatalog", checked)}
                />
              </div>
            </Card>

            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Enable cart</h3>
                  <p className="text-sm text-gray-600">
                    When this is ON, customers can add products to a cart and place a combined order.
                  </p>
                </div>
                <Switch
                  checked={settings.enableCart}
                  onCheckedChange={(checked) => handleToggle("enableCart", checked)}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
