"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FileText, X, Upload, Plus, Save, Trash2 } from "lucide-react"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function DocumentMessage({ data, selected, id }: any) {
  const [captions, setCaptions] = useState(data?.captions || "")
  const [options, setOptions] = useState(data?.options || [""])
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode, updateNode } = useNodeContext()

  // Initialize state from data if not already set
  useEffect(() => {
    if (data?.captions && !captions) {
      setCaptions(data.captions)
    }
    if (data?.options && !options.length) {
      setOptions(data.options)
    }
  }, [data, captions, options])

  const addOption = () => {
    const newOptions = [...options, ""]
    setOptions(newOptions)
    if (updateNode) {
      updateNode(id, {
        ...data,
        options: newOptions
      })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    if (updateNode) {
      updateNode(id, {
        ...data,
        options: newOptions
      })
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_: string, i: number) => i !== index)
      setOptions(newOptions)
      if (updateNode) {
        updateNode(id, {
          ...data,
          options: newOptions
        })
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("File uploaded:", file.name)
      // Handle file upload logic here
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

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />
      <div className={`w-full max-w-md mx-auto bg-white border border-gray-300 rounded-lg overflow-hidden ${selected ? "ring-2 ring-blue-500" : ""}`}>
        {/* Header */}
        <div className="bg-teal-500 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-medium text-white">Document Message</span>
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
          {/* Upload Area */}
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
            <div className="bg-gray-200 rounded-lg p-12 text-center hover:bg-gray-100 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 text-gray-500 mx-auto mb-2" />
              <span className="text-gray-600 text-sm">Upload</span>
            </div>
          </div>

          {/* Captions Textarea */}
          <div>
            <textarea
              placeholder="Captions (Optional)"
              value={captions}
              onChange={(e) => {
                const newCaptions = e.target.value
                setCaptions(newCaptions)
                if (updateNode) {
                  updateNode(id, {
                    ...data,
                    captions: newCaptions
                  })
                }
              }}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2 relative">
                {/* Connection handle for each option */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`option-${index}`}
                  className="w-3 h-3 bg-teal-500 border-0 absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: '-6px' }}
                />
                
                <input
                  type="text"
                  placeholder="Enter an option"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-8"
                />
                {options.length > 1 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="bg-red-400 hover:bg-red-500 text-white p-2 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index === options.length - 1 && (
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

export { DocumentMessage as DocumentNode };
