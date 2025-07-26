"use client"

import { ReactFlow, type Node, type Edge, Background, Controls, Handle, Position } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import React, { useState } from "react"
import { Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"

// TODO: Replace this stub with your actual AssignAgentNode implementation
export function AssignAgentNode({ data, selected, id }: any) {
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
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />
      <div style={{ padding: 12, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Assign Agent Node</span>
          <span style={{ display: 'flex', gap: 4 }}>
            <button onClick={handleSave} title="Save" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <Save className={isSaved ? 'text-green-400' : ''} style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={handleClose} title="Close" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </span>
        </div>
        <pre style={{ fontSize: 12, color: '#374151', whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
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
  );
}

const nodeTypes = {
  assignAgent: AssignAgentNode,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "assignAgent",
    position: { x: 250, y: 100 },
    data: {
      config: {
        label: "Assign Agent",
        agentId: "agent@example.com",
        fallback: "Default",
      },
    },
  },
]

const initialEdges: Edge[] = []

export default function FlowPage() {
  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow nodes={initialNodes} edges={initialEdges} nodeTypes={nodeTypes} fitView className="bg-gray-50">
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
