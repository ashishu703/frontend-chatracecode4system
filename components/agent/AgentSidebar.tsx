"use client"

import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { setCurrentView } from "@/store/slices/agentDashboardSlice"
import { useAgentAuth } from '@/hooks/useAgentAuth';
import { useRouter } from 'next/navigation';
import Image from "next/image"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { id: "inbox", label: "Inbox", icon: "fas fa-inbox" },
  { id: "tasks", label: "Tasks", icon: "fas fa-tasks" },
]

export default function AgentSidebar() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { logout } = useAgentAuth()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const { currentView } = useSelector((state: RootState) => state.agentDashboard)

  const handleLogout = () => {
    logout()
    router.push('/agent/login')
  }

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image
            src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
            alt="Code 4 System Logo"
            width={32}
            height={32}
            className="rounded"
          />
          {sidebarOpen && <span className="text-xl font-bold text-gray-800">code 4 system</span>}
        </div>
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => {
              dispatch(setCurrentView(item.id))
            }}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
              currentView === item.id ? "bg-blue-100 border-r-2 border-blue-600" : ""
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className={`${item.icon} text-gray-600 ${sidebarOpen ? "mr-3" : ""}`}></i>
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
          <p className="text-xs text-gray-500 text-center">
            <b>© code 4 system 2025</b>
            <br />
            <b>All rights reserved</b>
          </p>
        </div>
      )}
    </motion.div>
  )
} 