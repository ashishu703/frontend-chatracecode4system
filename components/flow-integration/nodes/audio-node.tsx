"use client"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Volume2 } from "lucide-react"
import type { NodeData } from "@/types/flow"

export function AudioNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <Card className={`min-w-[200px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-green-500 rounded">
            <Volume2 className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-sm">{data.config.label}</span>
        </div>
        <p className="text-xs text-gray-600 truncate">{data.config.url || "No audio URL set"}</p>
        {data.config.autoPlay && <p className="text-xs text-gray-500 mt-1">Auto-play enabled</p>}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
    </Card>
  )
}

export default AudioNode;
