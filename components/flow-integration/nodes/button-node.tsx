"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Copy, X, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function ButtonMessageForm({ id, data, selected }: any) {
  const [captions, setCaptions] = useState(data?.captions || "")
  const [options, setOptions] = useState(data?.options || [""])
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  const [title, setTitle] = useState(data?.title || "Button Message")
  const [messageNumber, setMessageNumber] = useState(data?.messageNumber || 1)
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId, duplicateNode } = useNodeContext()
  const isStartNode = startNodeId === id

  const handleAddOption = () => {
    const newOptions = [...options, ""]
    setOptions(newOptions)
    if (updateNode) updateNode(id, { ...data, options: newOptions })
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    if (updateNode) updateNode(id, { ...data, options: newOptions })
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (updateNode) updateNode(id, { ...data, options: newOptions })
    }
  }

  const handleCaptionsChange = (value: string) => {
    setCaptions(value)
    if (updateNode) updateNode(id, { ...data, captions: value })
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

  const handleSave = () => {
    setShowDialog(true)
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
              <p className="text-xs text-gray-500 mt-0.5">Button Message</p>
            </div>
            </div>
          </div>

          {/* Content */}
        <div className="px-3 py-2 space-y-3">
            {/* Captions Textarea */}
            <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">CAPTIONS (OPTIONAL)</label>
              <Textarea
                placeholder="Captions (Optional)"
                value={captions}
              onChange={(e) => handleCaptionsChange(e.target.value)}
              className="min-h-[60px] p-2.5 resize-none border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Options */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">OPTIONS</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 relative">
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`option-${index}`}
                    className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white absolute right-0 top-1/2 transform -translate-y-1/2"
                    style={{ right: '-6px' }}
                  />
                  <Input
                    placeholder="Enter an option"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 pr-8 p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {index === options.length - 1 ? (
                    <button
                      onClick={handleAddOption}
                      className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded transition-colors"
                      title="Add"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="bg-red-400 hover:bg-red-500 text-white p-1.5 rounded transition-colors"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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

export { ButtonMessageForm as ButtonNode };
