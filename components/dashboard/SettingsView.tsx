"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"
import GeneralSettings from "./settings/General"
import ChannelsSettings from "./settings/Channels"
import AdminsSettings from "./settings/Admins"
import AccountManagementSettings from "./settings/AccountManagement"

export default function ChatbotAdminSettings() {
  // New state to manage the active tab/section
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
              onClick={() => setActiveTab("admins")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "admins"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "account"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Account Management
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* General Integration Section */}
            {activeTab === "general" && <GeneralSettings />}

            {/* Channels Integration Section */}
            {activeTab === "channels" && <ChannelsSettings />}

            {/* Admins Section */}
            {activeTab === "admins" && <AdminsSettings />}

            {/* Account Management Section */}
            {activeTab === "account" && <AccountManagementSettings />}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  )
}