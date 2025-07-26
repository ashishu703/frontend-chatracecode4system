"use client"

import type React from "react"
import { useState } from "react"
import { FileText, X, Upload, Plus, Save } from "lucide-react"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function DocumentMessage({ id }: any) {
  const [captions, setCaptions] = useState("")
  const [option, setOption] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode } = useNodeContext()

  const handleAddOption = () => {
    if (option.trim()) {
      setOptions([...options, option.trim()])
      setOption("")
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

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />
      <div className="w-full max-w-md mx-auto bg-white border border-gray-300 rounded-lg overflow-hidden">
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
              onChange={(e) => setCaptions(e.target.value)}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Option Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter an option"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleAddOption}
              className="px-3 py-3 border border-gray-300 rounded-md hover:bg-gray-50 bg-white transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Display added options */}
          {options.length > 0 && (
            <div className="space-y-2">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-gray-700">{opt}</span>
                  <button onClick={() => removeOption(index)} className="p-1 hover:bg-gray-200 rounded">
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

export { DocumentMessage as DocumentNode };
