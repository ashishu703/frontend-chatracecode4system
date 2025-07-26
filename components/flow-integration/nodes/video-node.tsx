"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Lock, X, Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function VideoNode({ id }: any) {
  const [captions, setCaptions] = useState("")
  const [option, setOption] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode } = useNodeContext()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleAddOption = () => {
    if (option.trim()) {
      // Handle adding the option
      console.log("Adding option:", option)
      setOption("")
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
      <div className="w-[320px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
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
              onChange={(e) => setCaptions(e.target.value)}
              className="min-h-[80px] resize-none border-gray-300"
            />
          </div>

          {/* Option Input */}
          <div className="mt-4 flex items-center space-x-2">
            <Input
              placeholder="Enter an option"
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddOption()
                }
              }}
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleAddOption}
              className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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

export default VideoNode
