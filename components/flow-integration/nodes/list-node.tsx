"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, Info, MessageSquare, Save, X, Plus, Trash2, Play } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
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

  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  const title = formData.title || "List Message"
  const messageNumber = data?.messageNumber || 1
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId, duplicateNode } = useNodeContext()
  const isStartNode = startNodeId === id

  // Initialize state from data if not already set
  useEffect(() => {
    if (data) {
      setFormData({
        header: data.header || "",
        body: data.body || "",
        footer: data.footer || "",
        menuButton: data.menuButton || "",
        title: data.title || "",
        options: data.options || [""],
      })
    }
  }, [data?.header, data?.body, data?.footer, data?.menuButton, data?.title, data?.options])

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

  const handleDialogSave = () => {
    if (templateName.trim()) {
      setShowDialog(false)
      toast({ title: "Template saved successfully!", variant: "default" })
      setTemplateName("")
    } else {
      toast({ title: "Template name is required.", variant: "destructive" })
    }
  }

  const handleClose = () => {
    deleteNode(id)
  }

  const handleSetStartNode = useCallback(() => {
    if (setStartNodeId) {
      if (isStartNode) {
        setStartNodeId(null)
        toast({ title: "Start node removed", variant: "default" })
      } else {
        setStartNodeId(id)
        toast({ title: "Start node set!", variant: "default" })
      }
    }
  }, [id, setStartNodeId, toast, isStartNode])

  const handleCopy = useCallback(() => {
    if (duplicateNode) {
      duplicateNode(id)
      toast({ title: "Node copied successfully!", variant: "default" })
    }
  }, [id, duplicateNode, toast])

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
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
      
      {/* Hover Action Buttons */}
      {isHovered && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1 z-10">
          <button 
            onClick={handleSetStartNode} 
            className="p-1.5 hover:bg-green-50 rounded transition-colors" 
            title={isStartNode ? "Remove as start node" : "Set as start node"}
          >
            <Play className={`w-4 h-4 ${isStartNode ? "text-green-600 fill-green-600" : "text-green-600"}`} />
          </button>
          <button 
            onClick={handleCopy} 
            className="p-1.5 hover:bg-blue-50 rounded transition-colors" 
            title="Copy"
          >
            <Copy className="w-4 h-4 text-blue-600" />
            </button>
          <button 
            onClick={handleClose} 
            className="p-1.5 hover:bg-red-50 rounded transition-colors" 
            title="Delete"
          >
            <X className="w-4 h-4 text-red-600" />
            </button>
        </div>
      )}

      <div className={`w-[320px] bg-white rounded-lg shadow-md ${selected ? "ring-2 ring-blue-500" : "border border-gray-200"}`}>
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">
                {title} #{messageNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">List Message</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-3 py-2 space-y-3">
          {/* Header Input */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">HEADER</label>
            <Input
              placeholder="Header"
              value={formData.header}
              onChange={(e) => handleInputChange("header", e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Body Textarea */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">BODY</label>
            <Textarea
              placeholder="Body"
              value={formData.body}
              onChange={(e) => handleInputChange("body", e.target.value)}
              className="p-2.5 min-h-[60px] resize-none border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Footer Input */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">FOOTER</label>
            <Input
              placeholder="Footer"
              value={formData.footer}
              onChange={(e) => handleInputChange("footer", e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Menu Button Input */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">MENU BUTTON</label>
            <Input
              placeholder="Menu Button"
              value={formData.menuButton}
              onChange={(e) => handleInputChange("menuButton", e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Title Section */}
          <div className="bg-gray-100 p-2 rounded-lg">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">TITLE</div>
            <Input
              placeholder="Maximum 20 characters allowed"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value.slice(0, 20))}
              className="p-2 border border-gray-300 rounded-lg text-sm"
              maxLength={20}
            />
          </div>

          {/* Options Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">OPTIONS</label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2 relative">
                {/* Connection handle for each option */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`option-${index}`}
                  className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: '-6px' }}
                />
                
                <Input
                  placeholder="Maximum 20 characters allowed"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value.slice(0, 20))}
                  className="text-sm flex-1 pr-8 p-2 border border-gray-300 rounded-lg"
                  maxLength={20}
                />
                {formData.options.length > 1 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="bg-red-400 hover:bg-red-500 text-white p-1.5 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index === formData.options.length - 1 && (
                  <button
                    onClick={addOption}
                    className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded transition-colors"
                    title="Add"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Continue Section */}
          <div className="flex items-center justify-end pt-2 relative">
            <span className="text-sm text-gray-700 font-medium mr-2">Continue</span>
            <Handle
              type="source"
              position={Position.Right}
              id="continue"
              className="!w-5 !h-5 !bg-gray-400 !border-2 !border-white !rounded-full absolute right-0 top-1/2 transform -translate-y-1/2"
              style={{ right: '-10px' }}
            />
          </div>
          </div>
        </div>

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
