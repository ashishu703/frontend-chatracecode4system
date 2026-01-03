"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"
import { useToast } from "@/hooks/use-toast"

interface Flow {
  title: string
  flow_id: string
  is_default: boolean
}

export default function GeneralSettings() {
  const [selectedFallback, setSelectedFallback] = useState("")
  const [flows, setFlows] = useState<Flow[]>([])
  const [loadingFlows, setLoadingFlows] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoadingFlows(true)
        const response = await serverHandler.get("/api/chat_flow/get_all")
        const data = response.data as { success: boolean; data: Flow[] }
        if (data.success && data.data) {
          setFlows(data.data)
          const defaultFlow = data.data.find((flow) => flow.is_default)
          if (defaultFlow) {
            setSelectedFallback(defaultFlow.flow_id)
          }
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch flows",
          variant: "destructive",
        })
      } finally {
        setLoadingFlows(false)
      }
    }

    fetchFlows()
  }, [toast])

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
          <div className="space-y-2">
            <Label htmlFor="fallback-flow" className="text-sm font-medium">
              Default Flow
            </Label>
            <Select value={selectedFallback} onValueChange={setSelectedFallback} disabled={loadingFlows}>
              <SelectTrigger>
                <SelectValue placeholder={loadingFlows ? "Loading flows..." : "Select default flow"} />
              </SelectTrigger>
              <SelectContent>
                {flows.map((flow) => (
                  <SelectItem key={flow.flow_id} value={flow.flow_id}>
                    {flow.title} {flow.is_default && "(Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              If the user message doesn't match any keyword and the AI fails, this flow will be sent. The selected flow will be set as default immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 