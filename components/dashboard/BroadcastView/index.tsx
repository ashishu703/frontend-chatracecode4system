 "use client"
import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import HomePage from "./HomePage"
import PrebuiltTemplatesPage from "./PrebuiltTemplatesPage"
import { BroadcastTemplateBuilder } from "./CreateTemplatePage"
import SavedTemplatesPage from "./SavedTemplatesPage"
import BroadcastPage from "./BroadcastPage"
import BroadcastAnalyticsPage from "./BroadcastAnalyticsPage"
import { Template, TemplateButton } from "./types"

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
   const [selectedCategory, setSelectedCategory] = useState("")
   const [currentTemplate, setCurrentTemplate] = useState<Template>({
     id: "",
     name: "",
     category: "marketing",
     language: "English (US)",
     status: "DRAFT",
     lastUpdated: new Date().toLocaleDateString(),
     body: "",
     buttons: [],
     variables: [],
     catalogEnabled: false,
   })
   const [savedTemplates, setSavedTemplates] = useState<Template[]>([])

   const addVariable = (text: string) => {
     const matches = text.match(/\{\{(\d+)\}\}/g)
     if (matches) {
       const variables = matches.map((match) => match.replace(/[{}]/g, ""))
       setCurrentTemplate((prev) => ({
         ...prev,
         variables: [...new Set(variables)],
       }))
     }
   }

   const addButton = (type: TemplateButton["type"]) => {
     const newButton: TemplateButton = {
       id: Date.now().toString(),
       type,
       text: "",
     }
     setCurrentTemplate((prev) => ({
       ...prev,
       buttons: [...prev.buttons, newButton],
     }))
   }

   const updateButton = (id: string, updates: Partial<TemplateButton>) => {
     setCurrentTemplate((prev) => ({
       ...prev,
       buttons: prev.buttons.map((btn) => (btn.id === id ? { ...btn, ...updates } : btn)),
     }))
   }

   const removeButton = (id: string) => {
     setCurrentTemplate((prev) => ({
       ...prev,
       buttons: prev.buttons.filter((btn) => btn.id !== id),
     }))
   }

   const saveTemplate = () => {
     const template = {
       ...currentTemplate,
       id: currentTemplate.id || Date.now().toString(),
       lastUpdated: new Date().toLocaleDateString(),
     }
     setSavedTemplates((prev) => {
       const existing = prev.findIndex((t) => t.id === template.id)
       if (existing >= 0) {
         const updated = [...prev]
         updated[existing] = template
         return updated
       }
       return [...prev, template]
     })
     setCurrentPage("saved-templates")
   }

   const sendForApproval = () => {
     setCurrentTemplate((prev) => ({ ...prev, status: "PENDING" }))
     saveTemplate()
   }

   const useTemplate = (template: Template) => {
     setCurrentTemplate({ ...template, id: "", status: "DRAFT", lastUpdated: new Date().toLocaleDateString() })
     setCurrentPage("create-template")
   }

   switch (currentPage) {
     case "home":
       return <HomePage setCurrentPage={setCurrentPage} />
    case "prebuilt-templates":
      return (
        <PrebuiltTemplatesPage
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          useTemplate={useTemplate}
        />
      )
     case "create-template":
       return <BroadcastTemplateBuilder />
     case "saved-templates":
       return (
         <SavedTemplatesPage
           savedTemplates={savedTemplates}
           setCurrentTemplate={setCurrentTemplate}
           setCurrentPage={setCurrentPage}
         />
       )
     case "broadcast":
       return <BroadcastPage setCurrentPage={setCurrentPage} />
     case "broadcast-analytics":
       return <BroadcastAnalyticsPage />
     default:
       return <HomePage setCurrentPage={setCurrentPage} />
   }
 }

