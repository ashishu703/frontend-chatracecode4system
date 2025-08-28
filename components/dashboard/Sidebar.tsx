"use client"

import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { setCurrentView } from "@/store/slices/dashboardSlice"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

const menuItems = [
  { id: "dashboard", label: "Analytics", icon: "fas fa-tachometer-alt" },
  { id: "inbox", label: "Inbox", icon: "fas fa-inbox" },
  { id: "phonebook", label: "Contacts", icon: "fas fa-address-book" },
  {
    id: "broadcast",
    label: "Broadcast",
    icon: "fas fa-broadcast-tower",
    children: [
      { id: "broadcast-analytics", label: "Analytics", icon: "fas fa-chart-line" },
      { id: "create-template", label: "Create Template", icon: "fas fa-plus-circle" },
      { id: "prebuilt-template", label: "Prebuilt Template", icon: "fas fa-layer-group" },
      { id: "saved-templates", label: "Saved Templates", icon: "fas fa-save" },
      { id: "broadcast-messages", label: "Broadcast", icon: "fas fa-paper-plane" }
    ]
  },
  // { id: "flows", label: "Flows", icon: "fas fa-project-diagram" },
  // { id: "templates", label: "Meta Templates", icon: "fas fa-file-alt" },
  // { id: "features", label: "Chat Widget", icon: "fas fa-comment-dots" },
  { id: "chatbot", label: "Auto Response", icon: "fas fa-robot" },
  { id: "allflows", label: "All Flows", icon: "fas fa-folder" },
  { id: "automation", label: "Automation Tools", icon: "fas fa-cogs" },
  { id: "settings", label: "Settings", icon: "fas fa-cog" },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const { currentView } = useSelector((state: RootState) => state.dashboard)

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleMenuClick = (itemId: string, hasChildren?: boolean) => {
    if (hasChildren) {
      setOpenDropdown(openDropdown === itemId ? null : itemId)
    } else {
      dispatch(setCurrentView(itemId))
      try {
        localStorage.setItem('dashboardCurrentView', itemId)
      } catch {}
    }
  }

     return (
     <div
       className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${
         sidebarOpen ? "w-64" : "w-16"
       }`}
      style={{
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image
            src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1752042604/mbg_logo_l7xfr2.png"
            alt="MBG Logo"
            width={32}
            height={32}
            className="rounded"
          />
          {sidebarOpen && <span className="text-xl font-bold text-gray-800">MBG</span>}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 overflow-y-auto no-scrollbar" style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div key={item.id}>
            {/* Parent Item */}
            <motion.button
              onClick={() => handleMenuClick(item.id, !!item.children)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                currentView === item.id ? "bg-blue-100 border-r-2 border-blue-600" : ""
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <i className={`${item.icon} text-gray-600 ${sidebarOpen ? "mr-3" : ""}`}></i>
                {sidebarOpen && (
                  <span className={`text-gray-700 ${currentView === item.id ? "font-semibold text-blue-600" : ""}`}>
                    {item.label}
                  </span>
                )}
              </div>
              {sidebarOpen && item.children && (
                <i
                  className={`fas fa-chevron-${openDropdown === item.id ? "up" : "down"} text-gray-500 text-xs`}
                ></i>
              )}
            </motion.button>

            {/* Dropdown Children */}
            {item.children && openDropdown === item.id && sidebarOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="ml-10 border-l border-gray-200"
              >
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => { dispatch(setCurrentView(child.id)); try { localStorage.setItem('dashboardCurrentView', child.id) } catch {} }}
                    className={`w-full flex items-center px-4 py-2 text-left hover:bg-blue-50 text-gray-600 ${
                      currentView === child.id ? "bg-blue-100 text-blue-600 font-semibold" : ""
                    }`}
                  >
                    <i className={`${child.icon} text-gray-500 mr-3`}></i>
                    {child.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-500 text-center">
            <b>© MBG 2025</b>
            <br />
            <b>All rights reserved</b>
          </p>
        </div>
      )}
    </div>
  )
}
