"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, Copy, Play, Globe } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import { NodeData } from "@/types/flow-integration/flow"

export function ApiRequestNode({ data, selected, id }: NodeProps<NodeData>) {
  const [selectedMethod, setSelectedMethod] = useState(data?.selectedMethod || "GET")
  const [url, setUrl] = useState(data?.url || "https://example.com/api")
  const [headers, setHeaders] = useState(data?.headers || [{ key: "Content-Type", value: "application/json" }])
  const [requestBody, setRequestBody] = useState(data?.requestBody || "")
  const [title, setTitle] = useState(data?.title || "API Request")
  const [messageNumber, setMessageNumber] = useState(data?.messageNumber || 1)
  const [isHovered, setIsHovered] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId } = useNodeContext()
  const isStartNode = startNodeId === id

  useEffect(() => {
    if (data?.selectedMethod) setSelectedMethod(data.selectedMethod)
    if (data?.url) setUrl(data.url)
    if (data?.headers) setHeaders(data.headers)
    if (data?.requestBody) setRequestBody(data.requestBody)
    if (data?.title) setTitle(data.title)
    if (data?.messageNumber) setMessageNumber(data.messageNumber)
  }, [data])

  const methods = ["GET", "POST", "PUT", "DELETE"]

  const syncData = useCallback(() => {
    if (updateNode) {
      updateNode(id, {
        ...data,
        selectedMethod,
        url,
        headers,
        requestBody,
        title,
        messageNumber,
        type: "requestAPI"
      })
    }
  }, [selectedMethod, url, headers, requestBody, title, messageNumber, updateNode, id, data])

  const addHeader = () => {
    const newHeaders = [...headers, { key: "", value: "" }]
    setHeaders(newHeaders)
    setTimeout(() => syncData(), 0)
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index)
    setHeaders(newHeaders)
    setTimeout(() => syncData(), 0)
  }

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method)
    setTimeout(() => syncData(), 0)
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
  }

  const handleUrlBlur = () => {
    syncData()
  }

  const handleRequestBodyChange = (value: string) => {
    setRequestBody(value)
  }

  const handleRequestBodyBlur = () => {
    syncData()
  }

  const handleTryApi = () => {
    console.log("Trying API:", { method: selectedMethod, url, headers, requestBody })
    toast({ title: "API request sent", variant: "default" })
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

  const handleSave = () => {
    setShowDialog(true)
  }

  const handleDialogSave = () => {
    if (templateName.trim()) {
      setShowDialog(false)
      toast({ title: "Template saved successfully!", variant: "default" })
      setTemplateName("")
    } else {
      toast({ title: "Template name is required.", variant: "destructive" })
    }
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
              <Globe className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {title} #{messageNumber}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">External HTTP Call</p>
                </div>
                <Button
                  size="sm"
                  className={`h-6 px-3 text-xs rounded-full ${
                    selectedMethod === "GET" ? "bg-blue-500 hover:bg-blue-600 text-white" : 
                    selectedMethod === "POST" ? "bg-green-500 hover:bg-green-600 text-white" :
                    selectedMethod === "PUT" ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                    "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {selectedMethod}
                </Button>
              </div>
            </div>
        </div>
      </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-3">
          {/* REQUEST METHOD Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">REQUEST METHOD</label>
        <div className="flex gap-2">
          {methods.map((method) => (
                <button
              key={method}
                  onClick={() => handleMethodChange(method)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMethod === method
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {method}
                </button>
          ))}
            </div>
        </div>

          {/* REQUEST URL Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">REQUEST URL</label>
        <Input
          value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://example.com/api"
              className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* HEADERS Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">HEADERS</label>
              <span className="text-xs text-gray-500">{headers.length} defined</span>
            </div>
            <div className="space-y-2">
          {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
              <Input
                value={header.key}
                onChange={(e) => updateHeader(index, "key", e.target.value)}
                    onBlur={syncData}
                    placeholder="Content-Type"
                    className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Input
                value={header.value}
                onChange={(e) => updateHeader(index, "value", e.target.value)}
                    onBlur={syncData}
                    placeholder="application/json"
                    className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
            </div>
          ))}
              <button
            onClick={addHeader}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
                <Plus className="w-4 h-4" />
                Add Header
              </button>
            </div>
          </div>

          {/* REQUEST BODY Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">REQUEST BODY (OPTIONAL)</label>
              <span className="text-xs text-gray-500">JSON SUPPORTED</span>
            </div>
            <Textarea
              value={requestBody}
              onChange={(e) => handleRequestBodyChange(e.target.value)}
              onBlur={handleRequestBodyBlur}
              placeholder="[ ]"
              className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>

          {/* Try This API Button */}
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium"
            onClick={handleTryApi}
          >
          Try This API
        </Button>

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

export default ApiRequestNode
