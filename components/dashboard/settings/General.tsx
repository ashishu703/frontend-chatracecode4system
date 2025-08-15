"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Data (unchanged from your original code)
const countries = [
  { value: "us", label: "United States", flag: "🇺🇸" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { value: "ca", label: "Canada", flag: "🇨🇦" },
  { value: "au", label: "Australia", flag: "🇦🇺" },
  { value: "de", label: "Germany", flag: "🇩🇪" },
  { value: "fr", label: "France", flag: "🇫🇷" },
  { value: "es", label: "Spain", flag: "🇪🇸" },
  { value: "it", label: "Italy", flag: "🇮🇹" },
  { value: "jp", label: "Japan", flag: "🇯🇵" },
  { value: "br", label: "Brazil", flag: "🇧🇷" },
]

const fallbackFlows = [
  { value: "default", label: "Default Support Flow" },
  { value: "escalation", label: "Human Escalation Flow" },
  { value: "feedback", label: "Feedback Collection Flow" },
  { value: "custom", label: "Custom Response Flow" },
]

export default function GeneralSettings() {
  // State for different form inputs
  const [developmentMode, setDevelopmentMode] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedFallback, setSelectedFallback] = useState("")

  const handleSaveSettings = () => {
    console.log("Saving general settings:", {
      developmentMode,
      selectedCountry,
      selectedFallback,
    })
    // Here you would typically make an API call to save the settings
  }

  return (
    <motion.div
      key="general"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-6 w-6 text-blue-600" />🔧 General Integration
          </CardTitle>
          <CardDescription>Configure basic chatbot behavior and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fallback Flow */}
            <div className="space-y-2">
              <Label htmlFor="fallback-flow" className="text-sm font-medium">
                Fallback Flow
              </Label>
              <Select value={selectedFallback} onValueChange={setSelectedFallback}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fallback flow" />
                </SelectTrigger>
                <SelectContent>
                  {fallbackFlows.map((flow) => (
                    <SelectItem key={flow.value} value={flow.value}>
                      {flow.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                If the user message doesn't match any keyword and the AI fails, this flow will be sent.
              </p>
            </div>

            {/* Default Country */}
            <div className="space-y-2">
              <Label htmlFor="default-country" className="text-sm font-medium">
                Default Country
              </Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select the main country your business serves. This sets the default contact language and time
                when the contact's country isn't known.
              </p>
            </div>
          </div>

          {/* Development Mode */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dev-mode" className="text-sm font-medium">
                  Development Mode
                </Label>
                <p className="text-xs text-gray-500">
                  Your bot will work only for bot admins. Enable this option if you are building your bot and
                  don't want non-admins to use the bot.
                </p>
              </div>
              <Switch id="dev-mode" checked={developmentMode} onCheckedChange={setDevelopmentMode} />
            </div>
            {!developmentMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-xs text-amber-700">Bot functionality is enabled for all users.</p>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
              Save General Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 