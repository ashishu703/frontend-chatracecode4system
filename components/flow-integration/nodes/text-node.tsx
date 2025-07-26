"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Save, X, Plus, Trash2, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import serverHandler from "@/utils/serverHandler"

export function TextNode({ data, selected, id }: NodeProps<any>) {
  const [message, setMessage] = useState(data?.message || "")
  const [options, setOptions] = useState(data?.options || [""])
  const [isSaved, setIsSaved] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(data?.title || "Simple Message")
  const [messageNumber, setMessageNumber] = useState(data?.messageNumber || 1)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { deleteNode, updateNode } = useNodeContext()

  // Initialize state from data if not already set
  useEffect(() => {
    if (data?.title && !title) {
      setTitle(data.title)
    }
    if (data?.messageNumber && !messageNumber) {
      setMessageNumber(data.messageNumber)
    }
    if (data?.message && !message) {
      setMessage(data.message)
    }
    if (data?.options && !options.length) {
      setOptions(data.options)
    }
  }, [data, title, messageNumber, message, options])

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

  const handleDialogSave = async () => {
    if (templateName.trim()) {
      setIsSaving(true)
      
      // Prepare the payload according to the required format
      const payload = {
        content: {
          type: "text",
          text: {
            preview_url: true,
            body: message || ""
          }
        },
        title: templateName,
        type: "TEXT"
      };

      try {
        // Make API call to save template
        const response = await serverHandler.post('/api/templet/add_new', payload);
        
        if ((response.data as any).success) {
          setIsSaved(true)
          setShowDialog(false)
          toast({ title: "Template saved successfully!", variant: "default" })
          setTimeout(() => setIsSaved(false), 2000)
        } else {
          toast({ title: "Error", description: (response.data as any).msg || "Failed to save template", variant: "destructive" })
        }
      } catch (error: any) {
        console.error('Error saving template:', error);
        console.error('Error response:', error.response?.data);
        console.error('Payload sent:', payload);
        toast({ 
          title: "Error", 
          description: error.response?.data?.msg || error.message || "Failed to save template", 
          variant: "destructive" 
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      toast({ title: "Template name is required.", variant: "destructive" })
    }
  }

  const handleClose = () => {
    deleteNode(id)
  }

  const handleTitleEdit = () => {
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    if (updateNode) {
      updateNode(id, {
        ...data,
        title
      })
    }
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    }
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />

      <Card className={`w-[280px] overflow-hidden ${selected ? "ring-2 ring-blue-500" : ""}`}>
        {/* Header */}
        <div className="bg-red-400 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyPress={handleTitleKeyPress}
                className="bg-white text-gray-800 px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
                autoFocus
              />
            ) : (
              <span className="font-medium text-sm">{title} #{messageNumber}</span>
            )}
            <button 
              onClick={handleTitleEdit} 
              className="p-1 hover:bg-red-500 rounded transition-colors"
              title="Edit title"
            >
              <Edit className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="p-1" title="Save">
              <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
            </button>
            <button onClick={handleClose} className="p-1" title="Close">
              <X className="w-4 h-4" />
            </button>
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSaving) {
                      handleDialogSave()
                    }
                  }}
                  autoFocus
                />
                <DialogFooter>
                  <button
                    className="bg-green-500 text-white rounded px-3 py-1 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDialogSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
                      <textarea
              value={message}
              onChange={(e) => {
                const newMessage = e.target.value
                setMessage(newMessage)
                if (updateNode) {
                  updateNode(id, {
                    ...data,
                    message: newMessage
                  })
                }
              }}
              className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your message here"
            />

          <div className="space-y-1">
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-1 relative">
                {/* Connection handle for each option */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`option-${index}`}
                  className="w-3 h-3 bg-blue-500 border-0 absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: '-6px' }}
                />
                
                <input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8"
                  placeholder="Enter an option"
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
      </Card>

      {/* Dynamic keyword handles for edge connections */}
      {(data?.state?.keyword || []).map((keyword: string, idx: number) => (
        <Handle
          key={keyword}
          type="source"
          position={Position.Right}
          id={keyword}
          style={{ top: 80 + idx * 16, background: '#2563eb' }}
        />
      ))}
      {/* Always render the catch-all handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="{{OTHER_MSG}}"
        style={{ top: 80 + ((data?.state?.keyword?.length || 0) * 16), background: '#10b981' }}
      />
    </div>
  )
}

export default TextNode
