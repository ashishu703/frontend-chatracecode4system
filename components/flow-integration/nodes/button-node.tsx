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

export function ButtonMessageForm({ id }: any) {
  const [captions, setCaptions] = useState("")
  const [options, setOptions] = useState([""])
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode } = useNodeContext()

  const handleAddOption = () => {
    setOptions([...options, ""])
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleCopy = () => {
    const formData = {
      captions,
      options: options.filter((option) => option.trim() !== ""),
    }
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2))
    toast.success("Form data copied to clipboard")
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
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-orange-400 px-4 py-3 flex items-center justify-between">
            <h2 className="text-white font-medium text-sm">Button Message</h2>
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
            {/* Captions Textarea */}
            <div>
              <Textarea
                placeholder="Captions (Optional)"
                value={captions}
                onChange={(e) => setCaptions(e.target.value)}
                className="min-h-[120px] resize-none border-gray-200 text-gray-600 placeholder:text-gray-400"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Enter an option"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 border-gray-200 text-gray-600 placeholder:text-gray-400"
                  />
                  {index === options.length - 1 ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-gray-400 hover:bg-gray-500 border-gray-400"
                      onClick={handleAddOption}
                    >
                      <Plus className="h-4 w-4 text-white" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-red-400 hover:bg-red-500 border-red-400"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4 text-white" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
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

export { ButtonMessageForm as ButtonNode };
