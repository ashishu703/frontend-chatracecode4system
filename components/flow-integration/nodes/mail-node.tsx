"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Mail, X, Upload, Plus, Trash2, Link2, Copy, Play } from "lucide-react"
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
  fromEmail: string,
  toEmail: string,
  subject: string,
  preheader: string,
  headline: string,
  text: string,
  imageUrl: string,
  title: string,
  messageNumber: number,
  options: any[],
  uploadedFile: File | null = null
) => ({
  type: "mailMessage" as const,
  data: {
    state: {
      label: "Send Email",
      from: fromEmail || "",
      to: toEmail || "",
      subject: subject || "",
      preheader: preheader || "",
      headline: headline || "",
      text: text || "",
      image: imageUrl || ""
    }
  },
  title,
  messageNumber,
  fromEmail,
  toEmail,
  subject,
  preheader,
  headline,
  text,
  imageUrl,
  imageFile: uploadedFile,
  options
})

export function MailNode({ data, selected, id }: any) {
  const [fromEmail, setFromEmail] = useState("")
  const [toEmail, setToEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [preheader, setPreheader] = useState("")
  const [headline, setHeadline] = useState("")
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [title, setTitle] = useState("Mail Node")
  const [messageNumber, setMessageNumber] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [useUrlInput, setUseUrlInput] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId, duplicateNode } = useNodeContext()
  const [options, setOptions] = useState(() => initializeOptions(data?.options))
  const isStartNode = startNodeId === id

  useEffect(() => {
    setFromEmail(data?.fromEmail || "")
    setToEmail(data?.toEmail || "")
    setSubject(data?.subject || "")
    setPreheader(data?.preheader || "")
    setHeadline(data?.headline || "")
    setText(data?.text || "")
    setImageUrl(data?.imageUrl || "")
    setTitle(data?.title || "Mail Node")
    setMessageNumber(data?.messageNumber || 1)
    setOptions(initializeOptions(data?.options))
  }, [data])

  const syncData = useCallback((customData = {}) => {
    const newData = buildNodeData(fromEmail, toEmail, subject, preheader, headline, text, imageUrl, title, messageNumber, options, uploadedFile)
    updateNode?.(id, { ...newData, ...customData })
  }, [fromEmail, toEmail, subject, preheader, headline, text, imageUrl, title, messageNumber, options, uploadedFile, updateNode, id])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Error", description: "Invalid image file. Allowed: JPG, PNG, GIF, WEBP", variant: "destructive" })
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
      const newData = buildNodeData(fromEmail, toEmail, subject, preheader, headline, text, url, title, messageNumber, options, file)
      updateNode?.(id, { ...newData, imageFile: file })
    }, 0)
    
    toast({ title: "Success", description: "Image uploaded", variant: "default" })
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    setUploadedFile(null)
  }

  const handleUrlBlur = () => {
    syncData()
  }

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'fromEmail':
        setFromEmail(value)
        break
      case 'toEmail':
        setToEmail(value)
        break
      case 'subject':
        setSubject(value)
        break
      case 'preheader':
        setPreheader(value)
        break
      case 'headline':
        setHeadline(value)
        break
      case 'text':
        setText(value)
        break
    }
  }

  const handleFieldBlur = () => {
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
        type: "email",
        email: {
          from: fromEmail,
          to: toEmail,
          subject: subject,
          preheader: preheader,
          headline: headline,
          text: text,
          image: imageUrl
        }
      },
      title: templateName,
      type: "EMAIL"
    }

    try {
      const response = await serverHandler.post("/api/templet/add_new", payload)
      if ((response.data as any)?.success) {
        setShowDialog(false)
        toast({ title: "Template saved!", variant: "default" })
        setTemplateName("")
      } else {
        toast({ title: "Error", description: (response.data as any)?.msg || "Failed to save", variant: "destructive" })
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

  const handleCopy = useCallback(() => {
    if (duplicateNode) {
      duplicateNode(id)
      toast({ title: "Node copied successfully!", variant: "default" })
    }
  }, [id, duplicateNode, toast])

  const addOption = () => {
    const newOptions = [...options, { id: `opt-${Date.now()}`, value: "" }]
    setOptions(newOptions)
    setTimeout(() => {
      const newData = buildNodeData(fromEmail, toEmail, subject, preheader, headline, text, imageUrl, title, messageNumber, newOptions, uploadedFile)
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
      const newData = buildNodeData(fromEmail, toEmail, subject, preheader, headline, text, imageUrl, title, messageNumber, newOptions, uploadedFile)
      updateNode?.(id, { ...newData, options: newOptions })
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
              <Mail className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">
                {title} #{messageNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Send Email</p>
            </div>
          </div>
        </div>

        {/* Email Form */}
        <div className="px-3 py-2 space-y-3">
          {/* From Email */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">FROM EMAIL</label>
            <Input
              placeholder="Enter sender email..."
              value={fromEmail}
              onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
              onBlur={handleFieldBlur}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* To Email */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">TO EMAIL</label>
            <Input
              placeholder="Enter recipient email..."
              value={toEmail}
              onChange={(e) => handleFieldChange('toEmail', e.target.value)}
              onBlur={handleFieldBlur}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">SUBJECT</label>
            <Input
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => handleFieldChange('subject', e.target.value)}
              onBlur={handleFieldBlur}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Preheader */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">PREHEADER</label>
            <Input
              placeholder="Enter email preheader..."
              value={preheader}
              onChange={(e) => handleFieldChange('preheader', e.target.value)}
              onBlur={handleFieldBlur}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Headline */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">HEADLINE</label>
            <Input
              placeholder="Enter email headline..."
              value={headline}
              onChange={(e) => handleFieldChange('headline', e.target.value)}
              onBlur={handleFieldBlur}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">IMAGE</label>
            <div className="flex justify-center gap-2 mb-2">
              <button onClick={() => setUseUrlInput(false)} className={`text-xs px-3 py-1.5 rounded-lg ${!useUrlInput ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                Upload Image
              </button>
              <button onClick={() => setUseUrlInput(true)} className={`text-xs px-3 py-1.5 rounded-lg ${useUrlInput ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                Add Link
              </button>
            </div>

            {!useUrlInput ? (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id={`image-upload-${id}`} />
                <label htmlFor={`image-upload-${id}`} className="cursor-pointer">
                  <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1.5" />
                  <span className="text-gray-600 font-medium text-xs">
                    {uploadedFile ? uploadedFile.name : "Upload Image"}
                  </span>
                  {uploadedFile && (
                    <div className="mt-1 text-xs text-gray-500">
                      Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
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
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  autoFocus
                />
              </div>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Email image" className="w-full h-24 object-cover rounded-lg border border-gray-300" />
              </div>
            )}
          </div>

          {/* Text */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">TEXT</label>
            <Textarea
              placeholder="Enter email content..."
              value={text}
              onChange={(e) => handleFieldChange('text', e.target.value)}
              onBlur={handleFieldBlur}
              className="min-h-[60px] p-2.5 resize-none border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Unsubscribe Text */}
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              You received this email from <strong>{fromEmail || "PAGENAME"}</strong>. If you would like to unsubscribe, <a href="#" className="text-green-600 underline">click here</a>.
            </p>
          </div>

          {/* Options */}
          <div className="mt-2 space-y-2">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 relative">
                <Handle
                  type="source"
                  position={Position.Right}
                  id={option.id}
                  className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: "-6px" }}
                />
                <Input
                  placeholder="Enter an option"
                  value={option.value}
                  onChange={(e) => updateOption(index, e.target.value)}
                  onBlur={() => handleOptionBlur(index)}
                  className="flex-1 pr-8 p-2 border border-gray-300 rounded-lg text-sm"
                />
                {options.length > 1 && (
                  <button onClick={() => removeOption(index)} className="bg-red-400 hover:bg-red-500 text-white p-1.5 rounded transition-colors" title="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index === options.length - 1 && (
                  <button onClick={addOption} className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded transition-colors" title="Add">
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

export default MailNode 