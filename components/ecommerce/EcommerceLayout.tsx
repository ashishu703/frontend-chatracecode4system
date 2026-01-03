"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

interface EcommerceSubNavItem {
  id: string
  label: string
  icon: string
  description: string
}

const subNavItems: EcommerceSubNavItem[] = [
  { id: "ecommerce-overview", label: "Overview", icon: "fas fa-store", description: "High-level view of your..." },
  { id: "ecommerce-catalogs", label: "Catalogs", icon: "fas fa-th", description: "Manage connected produc..." },
  { id: "ecommerce-products", label: "Products", icon: "fas fa-box", description: "Browse and manage..." },
  { id: "ecommerce-orders", label: "Orders", icon: "fas fa-shopping-bag", description: "Track orders coming from..." },
  { id: "ecommerce-payments", label: "Payments", icon: "fas fa-credit-card", description: "Monitor payment status an..." },
  { id: "ecommerce-commerce-settings", label: "Commerce Settings", icon: "fas fa-sliders-h", description: "Configure e-commerce rule..." },
  { id: "ecommerce-order-settings", label: "Order Settings", icon: "fas fa-cog", description: "Configure order messages,..." },
]

interface EcommerceLayoutProps {
  currentView: string
  onViewChange: (view: string) => void
  children: React.ReactNode
}

export default function EcommerceLayout({ currentView, onViewChange, children }: EcommerceLayoutProps) {
  const [subNavOpen, setSubNavOpen] = useState(true)

  return (
    <div className="flex h-full bg-gray-50">
      {/* E-commerce Sub-Navigation Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${subNavOpen ? "w-64" : "w-0"} overflow-hidden`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-900 text-lg">E-commerce</h2>
            <button
              onClick={() => setSubNavOpen(!subNavOpen)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 text-gray-500 transition-transform ${subNavOpen ? "" : "rotate-180"}`} />
            </button>
          </div>
          <p className="text-xs text-gray-500">WhatsApp storefront & orders</p>
        </div>

        <nav className="py-2">
          {subNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-start px-4 py-3 text-left transition-colors ${
                currentView === item.id
                  ? "bg-blue-50 border-r-2 border-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <i className={`${item.icon} ${currentView === item.id ? "text-blue-600" : "text-gray-600"} mt-0.5 mr-3`}></i>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${currentView === item.id ? "text-blue-600" : "text-gray-700"}`}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
