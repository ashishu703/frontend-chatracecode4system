"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import serverHandler from "@/utils/serverHandler"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: number
  uid: string
  payment_mode: string
  amount: string
  data: string
  s_token: string | null
  createdAt: string
  updatedAt: string
}

interface OrdersResponse {
  success: boolean
  data: Order[]
  pagination: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

const fetchOrders = async (page: number, limit: number, search: string): Promise<OrdersResponse> => {
  // If API supports search, add &search=${encodeURIComponent(search)}
  const url = `/api/admin/get_orders?page=${page}&limit=${limit}` + (search ? `&search=${encodeURIComponent(search)}` : "")
  const res = await serverHandler.get(url)
  return res.data as OrdersResponse
}

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const { toast } = useToast ? useToast() : { toast: () => {} }

  const { data, isLoading, isError } = useQuery<OrdersResponse>({
    queryKey: ["get-orders", page, limit, searchTerm],
    queryFn: () => fetchOrders(page, limit, searchTerm),
    keepPreviousData: true,
    onError: (error: any) => {
      toast({ title: "Error", description: error?.response?.data?.msg || "Failed to load orders", variant: "destructive" })
    },
  })

  const orders = data?.data || []
  const pagination = data?.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: limit }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">📦</span>
              Orders Management
            </CardTitle>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">UID</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Payment Mode</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Amount</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Razorpay Order ID</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : isError ? (
                  <tr><td colSpan={6} className="text-center py-8 text-red-500">Failed to load orders</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">No orders found.</td></tr>
                ) : orders.map(order => {
                  let razorpayOrderId = "-"
                  try {
                    const parsed = order.data ? JSON.parse(order.data) : {}
                    razorpayOrderId = parsed.razorpay_order_id || "-"
                  } catch {}
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-200 px-4 py-2">{order.id}</td>
                      <td className="border border-gray-200 px-4 py-2">{order.uid}</td>
                      <td className="border border-gray-200 px-4 py-2">{order.payment_mode}</td>
                      <td className="border border-gray-200 px-4 py-2">{order.amount}</td>
                      <td className="border border-gray-200 px-4 py-2">{razorpayOrderId}</td>
                      <td className="border border-gray-200 px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              {pagination.totalItems > 0
                ? `Showing ${(pagination.currentPage - 1) * pagination.pageSize + 1} to ${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of ${pagination.totalItems} entries`
                : 'No entries'}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant="outline"
                  size="sm"
                  className={pagination.currentPage === i + 1 ? "bg-blue-600 text-white" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
