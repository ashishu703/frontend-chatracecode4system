"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Clock, Save } from "lucide-react"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

interface DisableChatModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (datetime: string, timezone: string) => void
  recipientName?: string
}

export function DisableChatNode({ id }: any) {
  const [selectedDateTime, setSelectedDateTime] = useState("2025-07-25T02:12")
  const [timezone] = useState("Asia/Calcutta")
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode } = useNodeContext()

  const handleSave = () => {
    setShowDialog(true)
  }
  const handleDialogSave = () => {
    if (templateName.trim()) {
      setIsSaved(true)
      setShowDialog(false)
      toast({ title: "Template saved successfully!", variant: "success" })
      setTimeout(() => setIsSaved(false), 2000)
    } else {
      toast({ title: "Template name is required.", variant: "destructive" })
    }
  }
  const handleClose = () => {
    deleteNode(id)
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />
      <Card className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
          <h2 className="font-medium">Disable chat till</h2>
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="p-1" title="Save">
              <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
            </button>
            <button onClick={handleClose} className="p-1" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700 text-center">
            Select the timestamp until you want the chatbot to stop responding
          </p>

          {/* Timezone Display */}
          <div className="bg-green-100 border border-green-200 rounded p-3 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">{timezone}</span>
          </div>

          {/* DateTime Input */}
          <div className="relative">
            <input
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-800 border-0" />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter template name"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <button
              className="bg-green-500 text-white rounded px-3 py-1 mt-2"
              onClick={handleDialogSave}
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
