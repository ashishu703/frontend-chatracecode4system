"use client"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { UserPlus, ChevronRight } from "lucide-react"
import type { NodeData } from "@/types/flow"

export function AssignAgentNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <Card className={`min-w-[200px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-orange-500 rounded">
            <UserPlus className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-sm">{data.config.label}</span>
          <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
        </div>
        <p className="text-xs text-gray-600 truncate">{data.config.agentId || "No agent selected"}</p>
        <p className="text-xs text-gray-500 mt-1">Fallback: {data.config.fallback}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
    </Card>
  )
}
