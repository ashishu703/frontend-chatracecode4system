"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ecommerceApi } from "@/utils/api/ecommerce/ecommerceApi"
import { EcommerceHelpers } from "@/utils/helpers/ecommerceHelpers"
import { useToast } from "@/components/ui/use-toast"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await ecommerceApi.getOrders()
      setOrders(data.orders || [])
      setTotalOrders(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ecommerceApi.updateOrderStatus(orderId, newStatus)
      toast({ title: "Order status updated", variant: "default" })
      fetchOrders()
    } catch (error) {
      toast({ title: "Failed to update order status", variant: "destructive" })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Commerce</h1>
        <p className="text-gray-600">Manage your WhatsApp storefront, catalogs, products and orders.</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <span className="text-sm text-gray-600">{totalOrders} orders</span>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card className="p-6 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-700">No orders found.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Order #{order.orderId || order.id}
                    </h3>
                    <div className="flex gap-2 mb-2">
                      <Badge className={EcommerceHelpers.getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge className={EcommerceHelpers.getStatusColor(order.paymentStatus)}>
                        Payment: {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div>Customer: {order.customerPhone || order.customer}</div>
                  <div>Catalog ID: {order.catalogId}</div>
                  <div>Total: {EcommerceHelpers.formatCurrency(order.total, order.currency || "INR")}</div>
                  <div>Created: {EcommerceHelpers.formatDate(order.createdAt)}</div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Items:</div>
                  <div className="space-y-1">
                    {order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{EcommerceHelpers.formatCurrency(item.price * item.quantity, order.currency || "INR")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
