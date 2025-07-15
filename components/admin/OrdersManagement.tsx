"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Order {
  id: number
  name: string
  email: string
  mobile: string
  message: string
  date: string
  amount: string
  status: string
}

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [orders] = useState<Order[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      mobile: "+1234567890",
      message: "Basic Plan Purchase",
      date: "2024-01-15",
      amount: "500 INR",
      status: "Completed",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      mobile: "+1234567891",
      message: "Pro Plan Purchase",
      date: "2024-01-14",
      amount: "1000 INR",
      status: "Pending",
    },
  ])

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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Mobile</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Message</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Amount</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-200 px-4 py-2">{order.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{order.email}</td>
                    <td className="border border-gray-200 px-4 py-2">{order.mobile}</td>
                    <td className="border border-gray-200 px-4 py-2">{order.message}</td>
                    <td className="border border-gray-200 px-4 py-2">{order.amount}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">{order.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">Showing 1 to 2 of 2 entries</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
