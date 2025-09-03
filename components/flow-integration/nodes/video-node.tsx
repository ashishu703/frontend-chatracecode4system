"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Upload, X, Plus, Save, Trash2, Edit, Star, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"

const initializeOptions = (optionsData: any[]) => {
  if (!optionsData || !Array.isArray(optionsData) || optionsData.length === 0) {
    return [{ id: `opt-${Date.now()}`, value: "" }]
  }
  return optionsData.map((opt, index) => {
    if (typeof opt === "object" && opt.id && typeof opt.value !== "undefined") return opt
    return {
      id: `opt-${Date.now()}-${index}`,
      value: typeof opt === "string" ? opt : ""
    }
  })
}

const buildNodeData = (
  videoUrl: string,
  captions: string,
  title: string,
  messageNumber: number,
  options: any[],
  uploadedFile: File | null = null
) => ({
  type: "videoMessage",
  data: {
    state: {
      state: {
        msgContent: {
          video: {
            link: videoUrl || "",
            caption: captions || ""
          }
        }
      }
    }
  },
  title,
  messageNumber,
  videoUrl,
  captions,
  videoFile: uploadedFile,
  options
})

export function VideoNode({ data, selected, id }: any) {
  const [captions, setCaptions] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState("Video Message")
  const [messageNumber, setMessageNumber] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [useUrlInput, setUseUrlInput] = useState(false)
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId } = useNodeContext()
  const [options, setOptions] = useState(() => initializeOptions(data?.options))
  const isStartNode = startNodeId === id

  useEffect(() => {
    setCaptions(data?.captions || "")
    setUploadedFile(data?.videoFile || null)
    setVideoUrl(data?.videoUrl || "")
    setTitle(data?.title || "Video Message")
    setMessageNumber(data?.messageNumber || 1)
    setOptions(initializeOptions(data?.options))
  }, [data])

  const syncData = useCallback((customData = {}) => {
    const newData = buildNodeData(videoUrl, captions, title, messageNumber, options, uploadedFile)
    updateNode?.(id, { ...newData, ...customData })
  }, [videoUrl, captions, title, messageNumber, options, uploadedFile, updateNode, id])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast({ title: "Error", description: "Invalid video file", variant: "destructive" })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Error", description: "Max file size is 50MB", variant: "destructive" })
      return
    }

    const url = URL.createObjectURL(file)
    setUploadedFile(file)
    setVideoUrl(url)
    setUseUrlInput(false)
    
    // Sync data after state updates
    setTimeout(() => {
      const newData = buildNodeData(url, captions, title, messageNumber, options, file)
      updateNode?.(id, { ...newData, videoFile: file })
    }, 0)
    
    toast({ title: "Success", description: "Video uploaded", variant: "default" })
  }

  // Fixed: Remove immediate syncData call that was causing re-renders
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setVideoUrl(url)
    setUploadedFile(null)
    // Don't call syncData immediately on every keystroke
  }

  // Add blur handler to sync data when user finishes typing
  const handleUrlBlur = () => {
    syncData()
  }

  const handleCaptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaptions(e.target.value)
  }

  // Add blur handler for captions
  const handleCaptionsBlur = () => {
    syncData()
  }

  const handleSave = () => setShowDialog(true)

  const handleDialogSave = async () => {
    if (!templateName.trim()) {
      toast({ title: "Template name is required", variant: "destructive" })
      return
    }

    setIsSaving(true)
    const payload = {
      content: {
        type: "video",
        video: {
          url: videoUrl,
          name: uploadedFile?.name || "",
          size: uploadedFile?.size || 0,
          type: uploadedFile?.type || "",
          captions: captions || ""
        }
      },
      title: templateName,
      type: "VIDEO"
    }

    try {
      const response = await serverHandler.post("/api/templet/add_new", payload)
      if (response.data?.success) {
        setIsSaved(true)
        setShowDialog(false)
        toast({ title: "Template saved!", variant: "default" })
        setTimeout(() => setIsSaved(false), 2000)
      } else {
        toast({ title: "Error", description: response.data?.msg || "Failed to save", variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.msg || "Failed to save", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTitleEdit = () => setIsEditingTitle(true)
  const handleTitleSave = () => {
    setIsEditingTitle(false)
    syncData()
  }

  const handleSetStartNode = useCallback(() => {
    setStartNodeId?.(id)
    toast({ title: "Start node set!", variant: "default" })
  }, [id, setStartNodeId, toast])

  const addOption = () => {
    const newOptions = [...options, { id: `opt-${Date.now()}`, value: "" }]
    setOptions(newOptions)
    setTimeout(() => {
      const newData = buildNodeData(videoUrl, captions, title, messageNumber, newOptions, uploadedFile)
      updateNode?.(id, { ...newData, options: newOptions })
    }, 0)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = options.map((opt, i) => (i === index ? { ...opt, value } : opt))
    setOptions(newOptions)
  }

  const handleOptionBlur = (index: number) => {
    syncData()
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    setTimeout(() => {
      const newData = buildNodeData(videoUrl, captions, title, messageNumber, newOptions, uploadedFile)
      updateNode?.(id, { ...newData, options: newOptions })
    }, 0)
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />
      <div className={`w-[320px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm ${selected ? "ring-2 ring-blue-500" : ""}`}>
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyPress={(e) => e.key === "Enter" && handleTitleSave()}
                className="bg-white text-gray-800 px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
                autoFocus
              />
            ) : (
              <span className="font-medium text-sm">{title} #{messageNumber}</span>
            )}
            <button onClick={handleTitleEdit} className="p-1 hover:bg-blue-600 rounded transition-colors" title="Edit title">
              <Edit className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSetStartNode} className="p-1 hover:bg-blue-600 rounded transition-colors" title="Set Start">
              <Star className={`w-4 h-4 ${isStartNode ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
            </button>
            <button onClick={handleSave} className="p-1" title="Save">
              <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
            </button>
            <button onClick={() => deleteNode(id)} className="p-1" title="Delete">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload area */}
        <div className="p-4">
          <div className="flex justify-center gap-4 mb-2">
            <button onClick={() => setUseUrlInput(false)} className={`text-sm px-3 py-1 rounded ${!useUrlInput ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              Upload File
            </button>
            <button onClick={() => setUseUrlInput(true)} className={`text-sm px-3 py-1 rounded ${useUrlInput ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              Paste URL
            </button>
          </div>

          {!useUrlInput ? (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" id={`video-upload-${id}`} />
              <label htmlFor={`video-upload-${id}`} className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-600 font-medium">
                  {uploadedFile ? uploadedFile.name : "Upload Video"}
                </span>
                {uploadedFile && (
                  <div className="mt-2 text-sm text-gray-500">
                    Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link2 className="text-gray-400" />
              <Input
                placeholder="Paste video URL..."
                value={videoUrl}
                onChange={handleUrlChange}
                onBlur={handleUrlBlur}
                autoFocus
              />
            </div>
          )}

          {videoUrl && (
            <div className="mt-4">
              <video controls className="w-full rounded-lg border border-gray-300" src={videoUrl}>
                Your browser does not support video.
              </video>
            </div>
          )}

          <div className="mt-4">
            <Textarea
              placeholder="Captions (optional)"
              value={captions}
              onChange={handleCaptionsChange}
              onBlur={handleCaptionsBlur}
              className="min-h-[80px] resize-none border-gray-300"
            />
          </div>

          <div className="mt-4 space-y-2">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 relative">
                <Handle
                  type="source"
                  position={Position.Right}
                  id={option.id}
                  className="w-3 h-3 bg-blue-500 border-0 absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: "-6px" }}
                />
                <Input
                  placeholder="Enter an option"
                  value={option.value}
                  onChange={(e) => updateOption(index, e.target.value)}
                  onBlur={() => handleOptionBlur(index)}
                  className="flex-1 pr-8"
                />
                {options.length > 1 && (
                  <button onClick={() => removeOption(index)} className="bg-red-400 hover:bg-red-500 text-white p-2 rounded transition-colors" title="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index === options.length - 1 && (
                  <button onClick={addOption} className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded transition-colors" title="Add">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog for saving template */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <button
              className="bg-green-500 text-white rounded px-3 py-1 mt-2 disabled:opacity-50"
              onClick={handleDialogSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VideoNode