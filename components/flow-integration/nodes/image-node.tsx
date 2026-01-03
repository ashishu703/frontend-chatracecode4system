"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Upload, X, Link2, Copy, Image as ImageIcon, Play } from "lucide-react"
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
  imageUrl: string,
  captions: string,
  title: string,
  messageNumber: number,
  options: any[],
  uploadedFile: File | null = null
) => ({
  type: "imageMessage",
  data: {
    state: {
      state: {
        msgContent: {
          image: {
            link: imageUrl || "",
            caption: captions || ""
          }
        }
      }
    }
  },
  title,
  messageNumber,
  imageUrl,
  captions,
  imageFile: uploadedFile,
  options
})

export function ImageNode({ data, selected, id }: any) {
  const [captions, setCaptions] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [title, setTitle] = useState("Send Image")
  const [messageNumber, setMessageNumber] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId } = useNodeContext()
  const [options, setOptions] = useState(() => initializeOptions(data?.options))
  const isStartNode = startNodeId === id

  useEffect(() => {
    setCaptions(data?.captions || "")
    setUploadedFile(data?.imageFile || null)
    setImageUrl(data?.imageUrl || "")
    setTitle(data?.title || "Send Image")
    setMessageNumber(data?.messageNumber || 1)
    setOptions(initializeOptions(data?.options))
    if (data?.keywords && Array.isArray(data.keywords)) {
      const kwArray = data.keywords.map((kw: any, idx: number) => ({
        id: kw.id || `kw-${Date.now()}-${idx}`,
        value: typeof kw === 'string' ? kw : (kw.value || '')
      }))
      const result = [...kwArray]
      for (let i = 0; i < result.length && i < 10; i++) {
        if (result[i].value.trim() && (i === result.length - 1)) {
          result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" })
        }
      }
      setKeywords(result.slice(0, 11))
    } else if (data?.options && Array.isArray(data.options)) {
      const opts = initializeOptions(data.options).map(opt => ({ id: opt.id, value: opt.value }))
      const result = [...opts]
      for (let i = 0; i < result.length && i < 10; i++) {
        if (result[i].value.trim() && (i === result.length - 1)) {
          result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" })
        }
      }
      setKeywords(result.slice(0, 11))
    }
  }, [data])

  const syncData = useCallback((customData = {}) => {
    const newData = buildNodeData(imageUrl, captions, title, messageNumber, options, uploadedFile)
    updateNode?.(id, { ...newData, ...customData })
  }, [imageUrl, captions, title, messageNumber, options, uploadedFile, updateNode, id])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Invalid image file", variant: "destructive" })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Error", description: "Max file size is 10MB", variant: "destructive" })
      return
    }

    const url = URL.createObjectURL(file)
    setUploadedFile(file)
    setImageUrl(url)
    setUseUrlInput(false)
    
    // Sync data after state updates
    setTimeout(() => {
      const newData = buildNodeData(url, captions, title, messageNumber, options, file)
      updateNode?.(id, { ...newData, imageFile: file })
    }, 0)
    
    toast({ title: "Success", description: "Image uploaded", variant: "default" })
  }

  // Fixed: Remove immediate syncData call that was causing re-renders
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
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

  const handleSave = () => {
    setShowDialog(true)
  }

  const handleDialogSave = async () => {
    if (!templateName.trim()) {
      toast({ title: "Template name is required", variant: "destructive" })
      return
    }

    setIsSaving(true)
    const payload = {
      content: {
        type: "image",
        image: {
          url: imageUrl,
          name: uploadedFile?.name || "",
          size: uploadedFile?.size || 0,
          type: uploadedFile?.type || "",
          captions: captions || ""
        }
      },
      title: templateName,
      type: "IMAGE"
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

  const { duplicateNode } = useNodeContext()
  const handleCopy = useCallback(() => {
    if (duplicateNode) {
      duplicateNode(id)
      toast({ title: "Node copied successfully!", variant: "default" })
    }
  }, [id, duplicateNode, toast])

  // Initialize keywords - show next field when current has value, up to 11 max
  const [keywords, setKeywords] = useState(() => {
    if (data?.keywords && Array.isArray(data.keywords)) {
      const kwArray = data.keywords.map((kw: any, idx: number) => ({
        id: kw.id || `kw-${Date.now()}-${idx}`,
        value: typeof kw === 'string' ? kw : (kw.value || '')
      }))
      const result = [...kwArray]
      for (let i = 0; i < result.length && i < 10; i++) {
        if (result[i].value.trim() && (i === result.length - 1)) {
          result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" })
        }
      }
      return result.slice(0, 11)
    }
    const opts = options.length > 0 ? options.map(opt => ({ id: opt.id, value: opt.value })) : [{ id: `kw-${Date.now()}`, value: "" }]
    const result = [...opts]
    for (let i = 0; i < result.length && i < 10; i++) {
      if (result[i].value.trim() && (i === result.length - 1)) {
        result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" })
      }
    }
    return result.slice(0, 11)
  })

  const keywordInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords]
    newKeywords[index] = { ...newKeywords[index], value }
    
    if (value.trim() && index === newKeywords.length - 1 && newKeywords.length < 11) {
      newKeywords.push({ id: `kw-${Date.now()}`, value: "" })
    }
    
    if (!value.trim()) {
      for (let i = newKeywords.length - 1; i > index; i--) {
        if (!newKeywords[i].value.trim()) {
          newKeywords.pop()
        } else {
          break
        }
      }
    }
    
    setKeywords(newKeywords)
    setTimeout(() => {
      const newData = buildNodeData(imageUrl, captions, title, messageNumber, newKeywords, uploadedFile)
      updateNode?.(id, { ...newData, keywords: newKeywords, options: newKeywords })
    }, 0)
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
            onClick={() => deleteNode(id)} 
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
              <ImageIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">
                {title} #{messageNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Image Message</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-3">
          {/* Upload/Paste URL Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setUseUrlInput(false)} 
              className={`flex-1 text-sm px-3 py-2 rounded-lg transition-colors ${!useUrlInput ? "bg-gray-200 text-gray-700 font-medium" : "bg-gray-50 text-gray-500"}`}
            >
              Upload File
            </button>
            <button 
              onClick={() => setUseUrlInput(true)} 
              className={`flex-1 text-sm px-3 py-2 rounded-lg transition-colors ${useUrlInput ? "bg-gray-200 text-gray-700 font-medium" : "bg-gray-50 text-gray-500"}`}
            >
              Paste URL
            </button>
          </div>

          {/* Upload Area */}
          {!useUrlInput ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id={`image-upload-${id}`} />
              <label htmlFor={`image-upload-${id}`} className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-gray-700 font-medium">Click to upload</span>
                {uploadedFile && (
                  <div className="mt-2 text-sm text-gray-500">
                    {uploadedFile.name} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link2 className="text-gray-400 w-4 h-4" />
              <Input
                placeholder="Paste image URL..."
                value={imageUrl}
                onChange={handleUrlChange}
                onBlur={handleUrlBlur}
                className="flex-1"
                autoFocus
              />
            </div>
          )}

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-4">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full rounded-lg border border-gray-300 max-h-48 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  toast({ title: "Error", description: "Failed to load image", variant: "destructive" })
                }}
              />
            </div>
          )}

          {/* CAPTION Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">CAPTION</label>
            <Textarea
              placeholder="Add caption"
              value={captions}
              onChange={handleCaptionsChange}
              onBlur={handleCaptionsBlur}
              className="min-h-[60px] resize-none border-gray-300 rounded-lg p-2.5"
            />
          </div>

          {/* KEYWORDS Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">KEYWORDS</label>
            <div className="space-y-2">
              {keywords.map((keyword, index) => (
                <div key={keyword.id} className="flex items-center gap-2 relative">
                  <Input
                    ref={(el) => {
                      keywordInputRefs.current[keyword.id] = el;
                    }}
                    placeholder={`Keyword ${index + 1}`}
                    value={keyword.value}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    className="flex-1 pr-8 rounded-full p-2 border border-gray-300"
                  />
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={keyword.id}
                    className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white absolute right-2 top-1/2 transform -translate-y-1/2"
                    style={{ right: '8px' }}
                  />
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

export default ImageNode
