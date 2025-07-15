"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"

interface AdminDashboardData {
  totalUsers: number;
  activePlans?: number;
  totalRevenue?: number | string;
  newLeads?: number;
  supportTickets?: number;
  systemHealth?: string;
  // Add more fields as needed for charts, signups/orders by month, etc.
}

export default function AdminDashboardView({ data }: { data?: AdminDashboardData }) {
  const statsCards = [
    { title: "Total Users", value: data?.totalUsers ?? 0, icon: "fas fa-users", color: "text-blue-600" },
    { title: "Active Plans", value: data?.activePlans ?? 0, icon: "fas fa-credit-card", color: "text-green-600" },
    { title: "Total Revenue", value: data?.totalRevenue ?? 0, icon: "fas fa-rupee-sign", color: "text-purple-600" },
    { title: "New Leads", value: data?.newLeads ?? 0, icon: "fas fa-chart-line", color: "text-orange-600" },
    { title: "Support Tickets", value: data?.supportTickets ?? 0, icon: "fas fa-ticket-alt", color: "text-red-600" },
    { title: "System Health", value: data?.systemHealth ?? 0, icon: "fas fa-heartbeat", color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <i className={`${stat.icon} text-xl ${stat.color}`}></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      
    </div>
  )
}
