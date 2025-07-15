"use client"

import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { setCurrentView } from "@/store/slices/dashboardSlice"
import Image from "next/image"

const adminMenuItems = [
  { id: "dashboard", label: "Dashboard", iconClass: "fas fa-tachometer-alt" },
  { id: "plans", label: "Plans Management", iconClass: "fas fa-credit-card" },
  { id: "users", label: "User Management", iconClass: "fas fa-users" },
  { id: "payment", label: "Payment Gateway", iconClass: "fas fa-wallet" },
  { id: "leads", label: "Leads Manage", iconClass: "fas fa-chart-line" },
  { id: "faqs", label: "FAQs", iconClass: "fas fa-question-circle" },
  { id: "testimonials", label: "Testimonials", iconClass: "fas fa-star" },
  { id: "orders", label: "Orders", iconClass: "fas fa-box" },
  { id: "social", label: "Social Login", iconClass: "fas fa-link" },
  { id: "config", label: "App Configuration", iconClass: "fas fa-cog" },
  { id: "smtp", label: "SMTP Settings", iconClass: "fas fa-envelope" },
]

export default function AdminSidebar() {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const { currentView } = useSelector((state: RootState) => state.dashboard)

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image
            src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1752042604/mbg_logo_l7xfr2.png"
            alt="Admin Logo"
            width={32}
            height={32}
            className="rounded"
          />
          {sidebarOpen && <span className="text-xl font-bold text-gray-800">Admin Panel</span>}
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-4">
        {adminMenuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => dispatch(setCurrentView(item.id))}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
              currentView === item.id ? "bg-blue-100 border-r-2 border-blue-600" : ""
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className={`${item.iconClass} text-gray-600 ${sidebarOpen ? "mr-3" : ""}`}></i>
            {sidebarOpen && (
              <span className={`text-gray-700 ${currentView === item.id ? "font-semibold text-blue-600" : ""}`}>
                {item.label}
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-800 text-center">
            <b>© MBG 2025</b>
            <br />
            <b>All rights reserved</b>
          </p>
        </div>
      )}
    </motion.div>
  )
}
