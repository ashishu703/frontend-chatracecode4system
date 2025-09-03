"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice, PaymentMethod, PaymentStatus } from "@/utils/api/plan/payment"
import { toast } from "sonner"
import { Download, Eye, Calendar, CreditCard } from "lucide-react"

interface BillingRecord {
  id: string
  date: string
  amount: number
  plan_name: string
  payment_method: PaymentMethod
  status: PaymentStatus
  invoice_url?: string
}

export default function BillingHistory() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBillingHistory()
  }, [])

  const fetchBillingHistory = async () => {
    try {
      setLoading(true)
      // This would typically fetch from an API endpoint
      // For now, we'll use mock data
      const mockRecords: BillingRecord[] = [
        {
          id: "INV-001",
          date: "2024-01-15",
          amount: 2999,
          plan_name: "Premium Plan",
          payment_method: PaymentMethod.STRIPE,
          status: PaymentStatus.COMPLETED,
          invoice_url: "#"
        },
        {
          id: "INV-002",
          date: "2024-01-01",
          amount: 0,
          plan_name: "Basic Plan (Trial)",
          payment_method: PaymentMethod.OFFLINE,
          status: PaymentStatus.COMPLETED,
          invoice_url: "#"
        }
      ]
      setBillingRecords(mockRecords)
    } catch (error) {
      console.error('Error fetching billing history:', error)
      toast.error('Failed to fetch billing history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      case PaymentStatus.PENDING:
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>
      case PaymentStatus.FAILED:
        return <Badge className="bg-red-500 text-white">Failed</Badge>
      case PaymentStatus.CANCELLED:
        return <Badge className="bg-gray-500 text-white">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.STRIPE:
        return <CreditCard className="w-4 h-4" />
      case PaymentMethod.PAYPAL:
        return <span className="text-blue-600 font-bold text-sm">PayPal</span>
      case PaymentMethod.RAZORPAY:
        return <span className="text-blue-600 font-bold text-sm">Razorpay</span>
      case PaymentMethod.OFFLINE:
        return <span className="text-gray-600 text-sm">Bank Transfer</span>
      default:
        return <span className="text-gray-600 text-sm">Unknown</span>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownloadInvoice = (record: BillingRecord) => {
    if (record.invoice_url) {
      // This would typically download the invoice
      toast.info('Downloading invoice...')
    } else {
      toast.error('Invoice not available')
    }
  }

  const handleViewInvoice = (record: BillingRecord) => {
    if (record.invoice_url) {
      // This would typically open the invoice in a new tab
      window.open(record.invoice_url, '_blank')
    } else {
      toast.error('Invoice not available')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading billing history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-2">📄</span>
          Billing History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {billingRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No billing records found.</p>
            <p className="text-sm text-gray-500">Your payment history will appear here once you make your first purchase.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {billingRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(record.date)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{record.plan_name}</h4>
                    <p className="text-sm text-gray-600">Invoice #{record.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {record.amount === 0 ? 'Free' : formatPrice(record.amount)}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      {getPaymentMethodIcon(record.payment_method)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(record.status)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewInvoice(record)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadInvoice(record)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 