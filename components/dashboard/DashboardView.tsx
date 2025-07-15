"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"

interface DashboardData {
  totalChats: number;
  totalChatbots: number;
  totalContacts: number;
  totalFlows: number;
  totalBroadcasts: number;
  totalTemplates: number;
  // Add more fields as needed for recent chats, quick stats, etc.
}

export default function DashboardView({ data }: { data?: DashboardData }) {
  const statsCards = [
    { title: "Total Chats", value: data?.totalChats ?? 0, icon: "fas fa-comments", color: "text-blue-600" },
    { title: "Total Chatbots", value: data?.totalChatbots ?? 0, icon: "fas fa-robot", color: "text-green-600" },
    { title: "Total Contacts", value: data?.totalContacts ?? 0, icon: "fas fa-users", color: "text-purple-600" },
    { title: "Total Chatbot Flows", value: data?.totalFlows ?? 0, icon: "fas fa-project-diagram", color: "text-orange-600" },
    { title: "Total Broadcasts", value: data?.totalBroadcasts ?? 0, icon: "fas fa-broadcast-tower", color: "text-red-600" },
    { title: "Total Templates", value: data?.totalTemplates ?? 0, icon: "fas fa-file-alt", color: "text-indigo-600" },
  ]

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

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-chart-line mr-2 text-blue-600"></i>
            Dashboard Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Welcome to your MBG dashboard! Here you can monitor all your automation activities, manage your chatbots,
            and track your business communications.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
