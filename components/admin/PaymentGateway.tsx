"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { adminPlansAPI } from "@/utils/api/plans"
import { toast } from "sonner"

interface PaymentSettings {
  pay_stripe_key: string;
  pay_stripe_id: string;
  rz_id: string;
  rz_key: string;
  pay_paypal_id: string;
  pay_paypal_key: string;
}

export default function PaymentGateway() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<PaymentSettings>({
    pay_stripe_key: "",
    pay_stripe_id: "",
    rz_id: "",
    rz_key: "",
    pay_paypal_id: "",
    pay_paypal_key: "",
  })

  // Fetch payment settings on component mount
  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      setFetching(true)
      const response = await adminPlansAPI.getPaymentGatewaySettings()
      if ((response as any).success && (response as any).data) {
        const data = (response as any).data
        setSettings({
          pay_stripe_key: data.pay_stripe_key || "",
          pay_stripe_id: data.pay_stripe_id || "",
          rz_id: data.rz_id || "",
          rz_key: data.rz_key || "",
          pay_paypal_id: data.pay_paypal_id || "",
          pay_paypal_key: data.pay_paypal_key || "",
        })
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
      toast.error('Failed to fetch payment settings')
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await adminPlansAPI.updatePaymentGatewaySettings(settings)
      if ((response as any).success) {
        toast.success('Payment gateway settings saved successfully')
      }
    } catch (error) {
      console.error('Error saving payment settings:', error)
      toast.error('Failed to save payment settings')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Loading payment settings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-2xl mr-2">💰</span>
            Payment Gateways
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stripe Gateway */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stripe Gateway</h3>
              <Switch
                checked={!!settings.pay_stripe_id}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    pay_stripe_id: checked ? settings.pay_stripe_id : "",
                    pay_stripe_key: checked ? settings.pay_stripe_key : "",
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stripe-id">Publishable Key</Label>
                <Input
                  id="stripe-id"
                  value={settings.pay_stripe_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pay_stripe_id: e.target.value,
                    })
                  }
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <Label htmlFor="stripe-key">Secret Key</Label>
                <Input
                  id="stripe-key"
                  type="password"
                  value={settings.pay_stripe_key || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pay_stripe_key: e.target.value,
                    })
                  }
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </div>

          {/* Razorpay Gateway */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Razorpay Gateway</h3>
              <Switch
                checked={!!settings.rz_id}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    rz_id: checked ? settings.rz_id : "",
                    rz_key: checked ? settings.rz_key : "",
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="razorpay-id">Key ID</Label>
                <Input
                  id="razorpay-id"
                  value={settings.rz_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rz_id: e.target.value,
                    })
                  }
                  placeholder="rzp_test_..."
                />
              </div>
              <div>
                <Label htmlFor="razorpay-key">Key Secret</Label>
                <Input
                  id="razorpay-key"
                  type="password"
                  value={settings.rz_key || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rz_key: e.target.value,
                    })
                  }
                  placeholder="your_secret_key"
                />
              </div>
            </div>
          </div>

          {/* PayPal Gateway */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">PayPal Gateway</h3>
              <Switch
                checked={!!settings.pay_paypal_id}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    pay_paypal_id: checked ? settings.pay_paypal_id : "",
                    pay_paypal_key: checked ? settings.pay_paypal_key : "",
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paypal-id">Client ID</Label>
                <Input
                  id="paypal-id"
                  value={settings.pay_paypal_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pay_paypal_id: e.target.value,
                    })
                  }
                  placeholder="your_client_id"
                />
              </div>
              <div>
                <Label htmlFor="paypal-key">Client Secret</Label>
                <Input
                  id="paypal-key"
                  type="password"
                  value={settings.pay_paypal_key || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pay_paypal_key: e.target.value,
                    })
                  }
                  placeholder="your_client_secret"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
              <i className="fas fa-save mr-2"></i>
              Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">© All rights reserved</div>
    </div>
  )
}
