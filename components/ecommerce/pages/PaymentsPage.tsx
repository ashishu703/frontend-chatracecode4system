"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ecommerceApi } from "@/utils/api/ecommerce/ecommerceApi"
import { EcommerceHelpers } from "@/utils/helpers/ecommerceHelpers"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

export default function PaymentsPage() {
  const [configurations, setConfigurations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfigurations()
  }, [])

  const fetchConfigurations = async () => {
    try {
      setLoading(true)
      const data = await ecommerceApi.getPaymentConfigurations()
      setConfigurations(data || [])
    } catch (error) {
      console.error("Failed to fetch payment configurations:", error)
      setConfigurations([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return
    
    try {
      await ecommerceApi.deletePaymentConfiguration(id)
      toast({ title: "Configuration deleted", variant: "default" })
      fetchConfigurations()
    } catch (error) {
      toast({ title: "Failed to delete configuration", variant: "destructive" })
    }
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
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
          >
            Add configuration
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment configurations</h2>

        {loading ? (
          <div className="text-center py-8">Loading configurations...</div>
        ) : configurations.length === 0 ? (
          <Card className="p-6 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-700">No payment configurations found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configurations.map((config) => (
              <Card key={config.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{config.name}</h3>
                  <Badge className={config.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {config.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  {config.provider && <div>Provider: {config.provider}</div>}
                  {config.paymentGatewayMid && <div>Payment Gateway MID: {config.paymentGatewayMid}</div>}
                  {config.mcc && <div>MCC: {config.mcc} - {config.mccDescription || "Test MCC Code"}</div>}
                  {config.purposeCode && <div>Purpose Code: {config.purposeCode} - {config.purposeCodeDescription || "Test Purpose Code"}</div>}
                  {config.upiVpa && <div>UPI VPA: {config.upiVpa}</div>}
                  <div>Created: {EcommerceHelpers.formatDate(config.createdAt)}</div>
                  <div>Updated: {EcommerceHelpers.formatDate(config.updatedAt)}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Update Data Endpoint
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(config.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
