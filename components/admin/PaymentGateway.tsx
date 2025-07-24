"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import serverHandler from "@/utils/serverHandler"

interface PaymentSettings {
  id?: number;
  pay_offline_id: string | null;
  pay_offline_key: string | null;
  offline_active: boolean | number;
  pay_stripe_id: string;
  pay_stripe_key: string;
  stripe_active: boolean | number;
  pay_paypal_id: string;
  pay_paypal_key: string;
  paypal_active: boolean | number;
  rz_id: string;
  rz_key: string;
  rz_active: boolean | number;
  createdAt?: string;
  updatedAt?: string;
}

export default function PaymentGateway() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<PaymentSettings>({
    pay_offline_id: "",
    pay_offline_key: "",
    offline_active: false,
    pay_stripe_id: "",
    pay_stripe_key: "",
    stripe_active: false,
    pay_paypal_id: "",
    pay_paypal_key: "",
    paypal_active: false,
    rz_id: "",
    rz_key: "",
    rz_active: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      setFetching(true)
      const res = await serverHandler.get("/api/admin/get_payment_gateway_admin")
      const data = (res as any).data
      if (data.success && data.data) {
        setSettings({
          ...data.data,
          offline_active: !!data.data.offline_active,
          stripe_active: !!data.data.stripe_active,
          paypal_active: !!data.data.paypal_active,
          rz_active: !!data.data.rz_active,
        })
      } else {
        throw new Error("Failed to fetch payment settings")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch payment settings",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        ...settings,
        offline_active: settings.offline_active ? 1 : 0,
        stripe_active: settings.stripe_active ? 1 : 0,
        paypal_active: settings.paypal_active ? 1 : 0,
        rz_active: settings.rz_active ? 1 : 0,
      }
      const res = await serverHandler.post("/api/admin/update_pay_gateway", payload)
      const data = (res as any).data
      if (data.success) {
        toast({
          title: "Success",
          description: data.msg || "Payment gateway settings saved successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        throw new Error(data.msg || "Failed to save payment settings")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save payment settings",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
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
          {/* Offline Gateway */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Offline Payment</h3>
              <Switch
                checked={!!settings.offline_active}
                onCheckedChange={checked => setSettings(s => ({ ...s, offline_active: checked }))}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offline-id">Offline ID</Label>
                <Input
                  id="offline-id"
                  value={settings.pay_offline_id || ""}
                  onChange={e => setSettings(s => ({ ...s, pay_offline_id: e.target.value }))}
                  placeholder="Offline ID"
                />
              </div>
              <div>
                <Label htmlFor="offline-key">Offline Key</Label>
                <Input
                  id="offline-key"
                  value={settings.pay_offline_key || ""}
                  onChange={e => setSettings(s => ({ ...s, pay_offline_key: e.target.value }))}
                  placeholder="Offline Key"
                />
              </div>
            </div>
          </div>

          {/* Stripe Gateway */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stripe Gateway</h3>
              <Switch
                checked={!!settings.stripe_active}
                onCheckedChange={checked => setSettings(s => ({ ...s, stripe_active: checked }))}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stripe-id">Publishable Key</Label>
                <Input
                  id="stripe-id"
                  value={settings.pay_stripe_id || ""}
                  onChange={e => setSettings(s => ({ ...s, pay_stripe_id: e.target.value }))}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <Label htmlFor="stripe-key">Secret Key</Label>
                <Input
                  id="stripe-key"
                  type="password"
                  value={settings.pay_stripe_key || ""}
                  onChange={e => setSettings(s => ({ ...s, pay_stripe_key: e.target.value }))}
                  placeholder="sk_test_..."
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          {/* Razorpay Gateway */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Razorpay Gateway</h3>
              <Switch
                checked={!!settings.rz_active}
                onCheckedChange={checked => setSettings(s => ({ ...s, rz_active: checked }))}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="razorpay-id">Key ID</Label>
                <Input
                  id="razorpay-id"
                  value={settings.rz_id || ""}
                  onChange={e => setSettings(s => ({ ...s, rz_id: e.target.value }))}
                  placeholder="rzp_test_..."
                />
              </div>
              <div>
                <Label htmlFor="razorpay-key">Key Secret</Label>
                <Input
                  id="razorpay-key"
                  type="password"
                  value={settings.rz_key || ""}
                  onChange={e => setSettings(s => ({ ...s, rz_key: e.target.value }))}
                  placeholder="your_secret_key"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          {/* PayPal Gateway */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">PayPal Gateway</h3>
              <Switch
                checked={!!settings.paypal_active}
                onCheckedChange={checked => setSettings(s => ({ ...s, paypal_active: checked }))}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paypal-id">Client ID</Label>
                <Input
                  id="paypal-id"
                  value={settings.pay_paypal_id || ""}
                  onChange={e => setSettings(s => ({ ...s, pay_paypal_id: e.target.value }))}
                  placeholder="your_client_id"
                />
              </div>
              <div>
                <Label htmlFor="paypal-key">Client Secret</Label>
                <Input
                  id="paypal-key"
                  type="password"
                  value={settings.pay_paypal_key || ""}
                  onChange={e => setSettings(s => ({ ...s, pay_paypal_key: e.target.value }))}
                  placeholder="your_client_secret"
                  autoComplete="current-password"
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
