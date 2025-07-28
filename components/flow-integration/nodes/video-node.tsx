"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Lock, X, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function VideoNode({ data, selected, id }: any) {
  const [captions, setCaptions] = useState(data?.captions || "")
  const [options, setOptions] = useState(data?.options || [""])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

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
      <div className={`w-[320px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm ${selected ? "ring-2 ring-blue-500" : ""}`}>
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-medium">Video Message</span>
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="p-1" title="Save">
              <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
            </button>
            <button onClick={handleClose} className="p-1" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-4">
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" id="video-upload" />
            <label htmlFor="video-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-600 font-medium">{uploadedFile ? uploadedFile.name : "Upload"}</span>
            </label>
          </div>

          {/* Captions */}
          <div className="mt-4">
            <Textarea
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
              className="min-h-[80px] resize-none border-gray-300"
            />
          </div>

          {/* Options */}
          <div className="mt-4 space-y-2">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2 relative">
                {/* Connection handle for each option */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`option-${index}`}
                  className="w-3 h-3 bg-blue-500 border-0 absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: '-6px' }}
                />
                
                <Input
                  placeholder="Enter an option"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 pr-8"
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

export default VideoNode
