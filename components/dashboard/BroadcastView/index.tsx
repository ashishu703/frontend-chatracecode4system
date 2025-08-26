 "use client"
import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import PrebuiltTemplatesPage from "./PrebuiltTemplatesPage"
import { BroadcastTemplateBuilder } from "./CreateTemplatePage"
import SavedTemplatesPage from "./SavedTemplatesPage"
import BroadcastPage from "./BroadcastPage"
import BroadcastAnalyticsPage from "./BroadcastAnalyticsPage"

export default function WhatsAppTemplateManager() {
  // Get the current view from Redux to determine which page to show
  const { currentView } = useSelector((state: RootState) => state.dashboard)
  
  const [currentPage, setCurrentPage] = useState(
    "home" as
      | "home"
      | "prebuilt-templates"
      | "create-template"
      | "saved-templates"
      | "broadcast"
      | "broadcast-analytics"
  )

  // Update current page based on Redux state
  useEffect(() => {
    if (currentView === "broadcast-analytics") {
      setCurrentPage("broadcast-analytics")
    } else if (currentView === "create-template") {
      setCurrentPage("create-template")
    } else if (currentView === "prebuilt-template") {
      setCurrentPage("prebuilt-templates")
    } else if (currentView === "saved-templates") {
      setCurrentPage("saved-templates")
    } else if (currentView === "broadcast-messages") {
      setCurrentPage("broadcast")
    } else if (currentView === "broadcast") {
      setCurrentPage("home")
    }
  }, [currentView])


   switch (currentPage) {
    case "prebuilt-templates":
      return <PrebuiltTemplatesPage 
        selectedCategory=""
        setSelectedCategory={() => {}}
        useTemplate={() => {}}
      />
     case "create-template":
       return <BroadcastTemplateBuilder />
     case "saved-templates":
       return <SavedTemplatesPage />
     case "broadcast":
       return <BroadcastPage />
     case "broadcast-analytics":
       return <BroadcastAnalyticsPage />
     default:
       return <BroadcastAnalyticsPage />
   }
 }

