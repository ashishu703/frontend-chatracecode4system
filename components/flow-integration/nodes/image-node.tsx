"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload, Square, Check, HelpCircle, Save, X } from "lucide-react"
import type { NodeData } from "@/types/flow"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import { useState } from "react"

export function ImageNode({ data, selected, id }: NodeProps<NodeData>) {
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode } = useNodeContext()

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
    <Card className={`w-[320px] bg-white border border-gray-200 ${selected ? "ring-2 ring-blue-500" : ""}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />

      {/* Header */}
      <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <span className="font-medium text-sm">Image Message</span>
        <div className="flex items-center gap-1">
          <button onClick={handleSave} className="p-1" title="Save">
            <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
          </button>
          <button onClick={handleClose} className="p-1" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Upload Area */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-[120px]">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-gray-500 font-medium">Upload</span>
        </div>

        {/* Captions Textarea */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Captions (Optional)</label>
          <Textarea
            placeholder=""
            className="min-h-[80px] resize-none border-gray-300"
            defaultValue={data?.config?.caption || ""}
          />
        </div>

        {/* Option Input */}
        <div className="flex items-center space-x-2">
          <Input placeholder="Enter an option" className="flex-1 border-gray-300" defaultValue="" />
          <HelpCircle className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />

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
    </Card>
  )
}

export default ImageNode
