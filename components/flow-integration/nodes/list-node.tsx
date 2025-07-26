"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Info, MessageSquare, Save, X } from "lucide-react"
import { useState } from "react"
import type { NodeData } from "@/types/flow-integration/flow"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function ListNode({ data, selected, id }: NodeProps<NodeData>) {
  const [formData, setFormData] = useState({
    header: "",
    body: "",
    footer: "",
    menuButton: "",
    title: "",
    options: [""],
  })

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }))
  }

  const addOption = () => {
    if (formData.options.length < 8) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }))
    }
  }

  return (
    <Card className={`w-[320px] ${selected ? "ring-2 ring-blue-500" : ""} bg-white shadow-lg`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />

      {/* Header */}
      <div className="bg-blue-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium text-sm">List Message</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSave} className="p-1" title="Save">
            <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
          </button>
          <button onClick={handleClose} className="p-1" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-3">
        {/* Header Input */}
        <div>
          <Input
            placeholder="Header"
            value={formData.header}
            onChange={(e) => handleInputChange("header", e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Body Textarea */}
        <div>
          <Textarea
            placeholder="Body"
            value={formData.body}
            onChange={(e) => handleInputChange("body", e.target.value)}
            className="text-sm min-h-[60px] resize-none"
          />
        </div>

        {/* Footer Input */}
        <div>
          <Input
            placeholder="Footer"
            value={formData.footer}
            onChange={(e) => handleInputChange("footer", e.target.value)}
            className="text-sm border-2 border-black focus:border-black"
          />
        </div>

        {/* Menu Button Input */}
        <div>
          <Input
            placeholder="Menu Button"
            value={formData.menuButton}
            onChange={(e) => handleInputChange("menuButton", e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Section Count Info */}
        <div className="text-xs text-gray-600">Maximum 8 sections allowed</div>

        {/* Title Section */}
        <div className="bg-gray-100 p-2 rounded">
          <div className="text-sm font-medium text-blue-600 mb-2">Title</div>
          <Input
            placeholder="Maximum 20 characters allowed"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value.slice(0, 20))}
            className="text-sm"
            maxLength={20}
          />
        </div>

        {/* Options Section */}
        <div>
          <div className="text-xs text-gray-600 mb-2">Enter options</div>
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                placeholder="Maximum 20 characters allowed"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value.slice(0, 20))}
                className="text-sm flex-1"
                maxLength={20}
              />
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          ))}

          {formData.options.length < 8 && (
            <Button variant="outline" size="sm" onClick={addOption} className="w-full text-xs bg-transparent">
              Add Option
            </Button>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />

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
    </Card>
  )
}

export default ListNode
