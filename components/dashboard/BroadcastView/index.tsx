 "use client"
import React from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import SavedTemplatesPage from "./SavedTemplatesPage"
import BroadcastAnalyticsPage from "./BroadcastAnalyticsPage"
import { BroadcastTemplateBuilder } from "./CreateTemplatePage"

export default function WhatsAppTemplateManager() {
  // Get the current view from Redux to determine which page to show
  const { currentView } = useSelector((state: RootState) => state.dashboard)

  // Show CreateTemplatePage for "create-template"
  if (currentView === "create-template") {
    return <BroadcastTemplateBuilder />
  }

  // Show SavedTemplatesPage for "template"
  if (currentView === "template") {
    return <SavedTemplatesPage />
  }
  
  // Default to BroadcastAnalyticsPage for "broadcast" or any other view
  return <BroadcastAnalyticsPage />
}

