"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Info, MessageSquare, Save, X, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import type { NodeData } from "@/types/flow-integration/flow"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function ListNode({ data, selected, id }: NodeProps<NodeData>) {
  const [formData, setFormData] = useState({
    header: data?.header || "",
    body: data?.body || "",
    footer: data?.footer || "",
    menuButton: data?.menuButton || "",
    title: data?.title || "",
    options: data?.options || [""],
  })

  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode, updateNode } = useNodeContext()

  // Initialize state from data if not already set
  useEffect(() => {
    if (data?.header && !formData.header) {
      setFormData(prev => ({ ...prev, header: data.header }))
    }
    if (data?.body && !formData.body) {
      setFormData(prev => ({ ...prev, body: data.body }))
    }
    if (data?.footer && !formData.footer) {
      setFormData(prev => ({ ...prev, footer: data.footer }))
    }
    if (data?.menuButton && !formData.menuButton) {
      setFormData(prev => ({ ...prev, menuButton: data.menuButton }))
    }
    if (data?.title && !formData.title) {
      setFormData(prev => ({ ...prev, title: data.title }))
    }
    if (data?.options && !formData.options.length) {
      setFormData(prev => ({ ...prev, options: data.options }))
    }
  }, [data, formData])

  const addOption = () => {
    const newOptions = [...formData.options, ""]
    setFormData(prev => ({ ...prev, options: newOptions }))
    if (updateNode) {
      updateNode(id, {
        ...data,
        options: newOptions
      })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
    if (updateNode) {
      updateNode(id, {
        ...data,
        options: newOptions
      })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_: string, i: number) => i !== index)
      setFormData(prev => ({ ...prev, options: newOptions }))
      if (updateNode) {
        updateNode(id, {
          ...data,
          options: newOptions
        })
      }
    }
  }

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
    if (updateNode) {
      updateNode(id, {
        ...data,
        [field]: value
      })
    }
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      <Card className={`w-[320px] ${selected ? "ring-2 ring-blue-500" : ""} bg-white shadow-lg`}>
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
              <div key={index} className="flex items-center space-x-2 mb-2 relative">
                {/* Connection handle for each option */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`option-${index}`}
                  className="w-3 h-3 bg-blue-500 border-0 absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: '-6px' }}
                />
                
                <Input
                  placeholder="Maximum 20 characters allowed"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value.slice(0, 20))}
                  className="text-sm flex-1 pr-8"
                  maxLength={20}
                />
                {formData.options.length > 1 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="bg-red-400 hover:bg-red-500 text-white p-2 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index === formData.options.length - 1 && (
                  <button
                    onClick={addOption}
                    className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded transition-colors"
                    title="Add"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

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

export default ListNode
