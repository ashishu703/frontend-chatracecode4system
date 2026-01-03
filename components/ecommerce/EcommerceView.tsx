"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/store"
import { setCurrentView } from "@/store/slices/dashboardSlice"
import EcommerceLayout from "./EcommerceLayout"
import OverviewPage from "./pages/OverviewPage"
import CatalogsPage from "./pages/CatalogsPage"
import ProductsPage from "./pages/ProductsPage"
import OrdersPage from "./pages/OrdersPage"
import PaymentsPage from "./pages/PaymentsPage"
import CommerceSettingsPage from "./pages/CommerceSettingsPage"
import OrderSettingsPage from "./pages/OrderSettingsPage"

export default function EcommerceView() {
  const dispatch = useDispatch()
  const { currentView } = useSelector((state: RootState) => state.dashboard)
  const [activeView, setActiveView] = useState("ecommerce-overview")

  useEffect(() => {
    // Set default view if coming from sidebar
    if (currentView === "ecommerce") {
      setActiveView("ecommerce-overview")
      dispatch(setCurrentView("ecommerce-overview"))
    } else if (currentView.startsWith("ecommerce-")) {
      setActiveView(currentView)
    }
  }, [currentView, dispatch])

  const handleViewChange = (view: string) => {
    setActiveView(view)
    dispatch(setCurrentView(view))
    try {
      localStorage.setItem('dashboardCurrentView', view)
    } catch {}
  }

  const renderContent = () => {
    switch (activeView) {
      case "ecommerce-overview":
        return <OverviewPage />
      case "ecommerce-catalogs":
        return <CatalogsPage />
      case "ecommerce-products":
        return <ProductsPage />
      case "ecommerce-orders":
        return <OrdersPage />
      case "ecommerce-payments":
        return <PaymentsPage />
      case "ecommerce-commerce-settings":
        return <CommerceSettingsPage />
      case "ecommerce-order-settings":
        return <OrderSettingsPage />
      default:
        return <OverviewPage />
    }
  }

  return (
    <EcommerceLayout currentView={activeView} onViewChange={handleViewChange}>
      {renderContent()}
    </EcommerceLayout>
  )
}
