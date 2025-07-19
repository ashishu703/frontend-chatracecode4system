"use client"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import type { NodeData } from "@/types/flow-integration/flow"
import { ExternalLink } from "lucide-react";

export function StartNode({ selected }: NodeProps<any>) {
  return (
    <div className={`min-w-[200px] min-h-[40px] border-2 border-gray-400 rounded-lg bg-white ${selected ? "ring-2 ring-blue-500" : ""}`}></div>
  );
}

export function StartFlowNode({ data, selected }: NodeProps<any>) {
  return (
    <div
      className={`min-w-[280px] min-h-[120px] bg-white rounded-xl border-2 ${selected ? "border-blue-500" : "border-blue-300"} shadow-sm relative`}
      style={{ boxShadow: selected ? '0 0 0 2px #3b82f6' : undefined }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-b border-blue-200">
        <ExternalLink className="h-4 w-4 text-blue-400" />
        <span className="font-semibold text-gray-700 text-base">Start Flow #1</span>
      </div>
      {/* Dashed box */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-lg mx-4 my-3 py-3">
        <span className="font-bold text-gray-700">Send Flow</span>
        <span className="text-gray-500 text-sm">Click to select a flow</span>
      </div>
      {/* Continue label */}
      <div className="absolute bottom-2 right-4 flex items-center gap-1 text-gray-700">
        <span className="text-base">Continue</span>
        <span className="inline-block w-4 h-4 border-2 border-gray-400 rounded-full"></span>
      </div>
    </div>
  );
}
