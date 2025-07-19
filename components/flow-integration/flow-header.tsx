"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, FolderOpen, Play, Pause, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
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
  flowTitle: string;
  setFlowTitle: (title: string) => void;
}

export function FlowHeader({
  onSave,
  onLoad,
  isPreviewMode,
  onTogglePreview,
  nodes,
  edges,
  onLoadTemplate,
  flowTitle,
  setFlowTitle,
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
          <Input
            className="text-xl font-semibold text-gray-900 w-64"
            value={flowTitle}
            onChange={e => setFlowTitle(e.target.value)}
            placeholder="Flow Title"
            aria-label="Flow Title"
          />
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-sm text-gray-500">Visual conversation designer</span>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={onSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Flow
          </Button>
        </div>
      </div>
    </header>
  )
}
