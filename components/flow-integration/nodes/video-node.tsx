"use client"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Video } from "lucide-react"
import type { NodeData } from "@/types/flow"

export function VideoNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <Card className={`min-w-[200px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500" />
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-red-500 rounded">
            <Video className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-sm">{data.config.label}</span>
        </div>
        <p className="text-xs text-gray-600 truncate">{data.config.url || "No video URL set"}</p>
        {data.config.caption && <p className="text-xs text-gray-500 mt-1">{data.config.caption}</p>}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-red-500" />
    </Card>
  )
}
