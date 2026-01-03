"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ecommerceApi } from "@/utils/api/ecommerce/ecommerceApi"
import { EcommerceHelpers } from "@/utils/helpers/ecommerceHelpers"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Truck, ShoppingCart, MessageSquare } from "lucide-react"

export default function OrderSettingsPage() {
  const [activeTab, setActiveTab] = useState("payment-methods")
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await ecommerceApi.getOrderSettings()
      setSettings(data || {})
    } catch (error) {
      console.error("Failed to fetch order settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await ecommerceApi.updateOrderSettings(settings)
      toast({ title: "Settings saved successfully", variant: "default" })
    } catch (error) {
      toast({ title: "Failed to save settings", variant: "destructive" })
    }
  }

  const updateSetting = (path: string, value: any) => {
    const keys = path.split(".")
    const newSettings = { ...settings }
    let current: any = newSettings
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    setSettings(newSettings)
  }

  const getSetting = (path: string, defaultValue: any = false) => {
    const keys = path.split(".")
    let current: any = settings
    
    for (const key of keys) {
      if (current === undefined || current === null) return defaultValue
      current = current[key]
    }
    
    return current !== undefined ? current : defaultValue
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Commerce</h1>
            <p className="text-gray-600">Manage your WhatsApp storefront, catalogs, products and orders.</p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
          >
            Save Settings
          </Button>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Order Settings</h2>
          <p className="text-sm text-gray-600">Configure order messages, payment methods, and checkout flow.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment-methods" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="checkout" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Checkout
          </TabsTrigger>
          <TabsTrigger value="status-messages" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Status Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods" className="mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Methods</h3>
              <p className="text-sm text-gray-600 mb-4">Configure available payment options for customers.</p>
            </div>

            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <label className="font-semibold text-gray-900">Cash On Delivery (COD)</label>
                <Switch
                  checked={getSetting("paymentMethods.cod.enabled", false)}
                  onCheckedChange={(checked) => updateSetting("paymentMethods.cod.enabled", checked)}
                />
              </div>
              {getSetting("paymentMethods.cod.enabled", false) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Min Order Amount</label>
                    <Input
                      type="number"
                      value={getSetting("paymentMethods.cod.minAmount", 0)}
                      onChange={(e) => updateSetting("paymentMethods.cod.minAmount", parseFloat(e.target.value) || 0)}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Max Order Amount</label>
                    <Input
                      type="text"
                      value={getSetting("paymentMethods.cod.maxAmount", "No limit")}
                      onChange={(e) => updateSetting("paymentMethods.cod.maxAmount", e.target.value)}
                      placeholder="No limit"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-900">Razorpay</label>
                <Switch
                  checked={getSetting("paymentMethods.razorpay.enabled", false)}
                  onCheckedChange={(checked) => updateSetting("paymentMethods.razorpay.enabled", checked)}
                />
              </div>
            </Card>

            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-900">UPI</label>
                <Switch
                  checked={getSetting("paymentMethods.upi.enabled", false)}
                  onCheckedChange={(checked) => updateSetting("paymentMethods.upi.enabled", checked)}
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipping Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">Configure shipping methods and delivery charges.</p>
            </div>

            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <label className="font-semibold text-gray-900">Standard Shipping</label>
                <Switch
                  checked={getSetting("shipping.standard.enabled", false)}
                  onCheckedChange={(checked) => updateSetting("shipping.standard.enabled", checked)}
                />
              </div>
              {getSetting("shipping.standard.enabled", false) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Delivery Time</label>
                    <Input
                      value={getSetting("shipping.standard.deliveryTime", "3-5 business days")}
                      onChange={(e) => updateSetting("shipping.standard.deliveryTime", e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Charges (₹)</label>
                    <Input
                      type="number"
                      value={getSetting("shipping.standard.charges", 50)}
                      onChange={(e) => updateSetting("shipping.standard.charges", parseFloat(e.target.value) || 0)}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checkout" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Address Collection</h3>
              <p className="text-sm text-gray-600 mb-4">Configure how customer delivery addresses are collected during checkout.</p>
            </div>

            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="font-semibold text-gray-900 block mb-1">Enable Address Collection</label>
                  <p className="text-sm text-gray-600">Request customer address during checkout</p>
                </div>
                <Switch
                  checked={getSetting("checkout.addressCollection.enabled", false)}
                  onCheckedChange={(checked) => updateSetting("checkout.addressCollection.enabled", checked)}
                />
              </div>

              {getSetting("checkout.addressCollection.enabled", false) && (
                <>
                  <div className="mb-4">
                    <label className="text-sm text-gray-700 mb-1 block">Collection Method</label>
                    <Input
                      value={getSetting("checkout.addressCollection.method", "Interactive (Buttons/Quick Replies)")}
                      readOnly
                      className="rounded-lg bg-gray-50"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-700 mb-2 block">Required Fields</label>
                    <p className="text-xs text-gray-600 mb-2">Select fields that must be provided by customer</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Name", "Address", "City", "Pincode", "State", "Phone"].map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${field}`}
                            checked={getSetting(`checkout.addressCollection.requiredFields.${field.toLowerCase()}`, true)}
                            onCheckedChange={(checked) => updateSetting(`checkout.addressCollection.requiredFields.${field.toLowerCase()}`, checked)}
                          />
                          <label htmlFor={`required-${field}`} className="text-sm text-gray-700">{field}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700 mb-2 block">Optional Fields</label>
                    <p className="text-xs text-gray-600 mb-2">Select fields that are optional</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Landmark", "Alternate Phone"].map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`optional-${field}`}
                            checked={getSetting(`checkout.addressCollection.optionalFields.${field.toLowerCase().replace(" ", "")}`, true)}
                            onCheckedChange={(checked) => updateSetting(`checkout.addressCollection.optionalFields.${field.toLowerCase().replace(" ", "")}`, checked)}
                          />
                          <label htmlFor={`optional-${field}`} className="text-sm text-gray-700">{field}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Checkout Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Configure checkout process and order limits.</p>
            </div>

            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="font-semibold text-gray-900 block mb-1">Auto-Confirm Orders</label>
                  <p className="text-sm text-gray-600">Automatically confirm orders without manual approval</p>
                </div>
                <Switch
                  checked={getSetting("checkout.autoConfirm", false)}
                  onCheckedChange={(checked) => updateSetting("checkout.autoConfirm", checked)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Min Order Amount (₹)</label>
                  <Input
                    type="number"
                    value={getSetting("checkout.minOrderAmount", 100)}
                    onChange={(e) => updateSetting("checkout.minOrderAmount", parseFloat(e.target.value) || 0)}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Max Order Amount (₹)</label>
                  <Input
                    type="number"
                    value={getSetting("checkout.maxOrderAmount", 50000)}
                    onChange={(e) => updateSetting("checkout.maxOrderAmount", parseFloat(e.target.value) || 0)}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Max Items Per Order</label>
                  <Input
                    type="number"
                    value={getSetting("checkout.maxItemsPerOrder", 10)}
                    onChange={(e) => updateSetting("checkout.maxItemsPerOrder", parseFloat(e.target.value) || 0)}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status-messages" className="mt-6">
          <div className="space-y-4">
            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
              <Card key={status} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 capitalize">{status}</h3>
                  <Switch
                    checked={getSetting(`statusMessages.${status}.enabled`, false)}
                    onCheckedChange={(checked) => updateSetting(`statusMessages.${status}.enabled`, checked)}
                  />
                </div>

                {getSetting(`statusMessages.${status}.enabled`, false) && (
                  <>
                    <div className="mb-4">
                      <label className="text-sm text-gray-700 mb-1 block">Message Type</label>
                      <Input
                        value="Text"
                        readOnly
                        className="rounded-lg bg-gray-50"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-sm text-gray-700 mb-1 block">Message Content</label>
                      <Textarea
                        value={getSetting(`statusMessages.${status}.message`, `Hi {{customer_name}}, Your order #{{order_id}} is ${status === "confirmed" ? "confirmed!" : `being processed. We'll update you soon!`}`)}
                        onChange={(e) => updateSetting(`statusMessages.${status}.message`, e.target.value)}
                        className="rounded-lg min-h-[100px]"
                        placeholder="Enter message with placeholders like {{customer_name}}, {{order_id}}"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 mb-1 block">Send Delay (minutes)</label>
                      <Input
                        type="number"
                        value={getSetting(`statusMessages.${status}.sendDelay`, 0)}
                        onChange={(e) => updateSetting(`statusMessages.${status}.sendDelay`, parseFloat(e.target.value) || 0)}
                        className="rounded-lg"
                        min="0"
                      />
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
