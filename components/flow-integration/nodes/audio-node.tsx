"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Lock, X, Plus, Save } from "lucide-react"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

export function AudioNode({ id }: any) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [optionText, setOptionText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode } = useNodeContext()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
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

  const handleAddOption = () => {
    if (optionText.trim()) {
      console.log("Adding option:", optionText)
      setOptionText("")
    }
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />
      <div className="w-[400px] bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-pink-400 px-4 py-3 flex items-center justify-between">
          <span className="text-white font-medium">Audio Message</span>
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
          <div
            onClick={handleUploadClick}
            className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <span className="text-gray-600 font-medium">{audioFile ? audioFile.name : "Upload"}</span>
          </div>

          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
        </div>

        {/* Input Section */}
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter an option"
              value={optionText}
              onChange={(e) => setOptionText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
            />
            <button
              onClick={handleAddOption}
              className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Audio Player (if file is uploaded) */}
        {audioFile && (
          <div className="px-4 pb-4">
            <audio controls className="w-full">
              <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
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

export default AudioNode
