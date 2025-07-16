"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, FolderOpen, Play, Pause, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Node, Edge } from "reactflow"
import type { NodeData, FlowTemplate } from "@/lib/types"
import { TemplateManager } from "./template-manager"

// Add this prop to FlowHeaderProps interface
interface FlowHeaderProps {
  onSave: () => void
  onLoad: (flowId: string) => void
  isPreviewMode: boolean
  onTogglePreview: () => void
  nodes: Node<NodeData>[]
  edges: Edge[]
  onLoadTemplate: (template: FlowTemplate) => void
}

export function FlowHeader({
  onSave,
  onLoad,
  isPreviewMode,
  onTogglePreview,
  nodes,
  edges,
  onLoadTemplate,
}: FlowHeaderProps) {
  const [flowId, setFlowId] = useState("")
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)

  const handleLoad = () => {
    if (flowId.trim()) {
      onLoad(flowId)
      setIsLoadDialogOpen(false)
      setFlowId("")
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Chatbot Flow Builder</h1>
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm text-gray-500">Visual conversation designer</span>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePreview}
            className="flex items-center space-x-2 bg-transparent"
          >
            {isPreviewMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPreviewMode ? "Exit Preview" : "Preview"}</span>
          </Button>

          <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Flow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Existing Flow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Enter Flow ID" value={flowId} onChange={(e) => setFlowId(e.target.value)} />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsLoadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLoad}>Load Flow</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <TemplateManager nodes={nodes} edges={edges} onLoadTemplate={onLoadTemplate} />

          <Button onClick={onSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Flow
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
