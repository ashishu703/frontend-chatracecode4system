"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"
import GeneralSettings from "./settings/General"
import ChannelsSettings from "./settings/Channels"
import IntegrationsSettings from "./settings/Integrations"
import ErrorLogsSettings from "./settings/ErrorLogs"

export default function ChatbotAdminSettings() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Chatbot Settings</h1>
            <p className="text-gray-600">Configure your chatbot's behavior and integrations</p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center border-b border-gray-200">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "general"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("channels")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "channels"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "integrations"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              Integrations
            </button>
            <button
              onClick={() => setActiveTab("error-logs")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "error-logs"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-500 hover:text-red-600"
              }`}
            >
              Error Logs
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "channels" && <ChannelsSettings />}
            {activeTab === "integrations" && <IntegrationsSettings />}
            {activeTab === "error-logs" && <ErrorLogsSettings />}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  )
}