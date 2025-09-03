"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import { NodeData } from "@/types/flow-integration/flow"

export function ApiRequestNode({ data, selected, id }: NodeProps<NodeData>) {
  const [selectedMethod, setSelectedMethod] = useState("GET")
  const [url, setUrl] = useState("https://example.com")
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }])
  const [isExpanded, setIsExpanded] = useState(true)
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode } = useNodeContext()

  const methods = ["GET", "POST", "PUT", "DELETE"]

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }])
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const handleTryApi = () => {
    console.log("Trying API:", { method: selectedMethod, url, headers })
    // Add your API call logic here
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

  if (!isExpanded) {
    return (
      <Card className={`min-w-[200px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
        <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(true)}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Request API</span>
            <span className="text-xs text-gray-500">{selectedMethod}</span>
          </div>
        </div>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      </Card>
    )
  }

  return (
    <Card className={`w-[320px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />

      {/* Header */}
      <div className="bg-teal-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <span className="font-medium">Request API</span>
        <div className="flex items-center gap-1">
          <button onClick={handleSave} className="p-1" title="Save">
            <svg className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          </button>
          <button onClick={handleClose} className="p-1" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 text-center">
          You can use the API response in the next target-connected node like {"{{foreach}}"}
        </p>

        {/* HTTP Methods */}
        <div className="flex gap-2">
          {methods.map((method) => (
            <Button
              key={method}
              variant={selectedMethod === method ? "default" : "outline"}
              size="sm"
              className={`text-xs px-3 py-1 ${
                selectedMethod === method ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-gray-600 border-gray-300"
              }`}
              onClick={() => setSelectedMethod(method)}
            >
              {method}
            </Button>
          ))}
        </div>

        {/* URL Input */}
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="text-sm"
        />

        {/* Headers Section */}
        <div className="bg-green-50 p-3 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Add header (optional)</span>
          </div>

          {headers.map((header, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={header.key}
                onChange={(e) => updateHeader(index, "key", e.target.value)}
                placeholder="Header name"
                className="text-sm bg-white"
              />
              <Input
                value={header.value}
                onChange={(e) => updateHeader(index, "value", e.target.value)}
                placeholder="Header value"
                className="text-sm bg-white"
              />
              {headers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => removeHeader(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full text-blue-500 border-blue-300 hover:bg-blue-50 bg-transparent"
            onClick={addHeader}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Try API Button */}
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={handleTryApi}>
          Try This API
        </Button>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />

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

export default ApiRequestNode
