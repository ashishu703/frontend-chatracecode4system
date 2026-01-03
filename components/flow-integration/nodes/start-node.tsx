"use client"
import { type NodeProps } from "@xyflow/react"
import { Play } from "lucide-react";

export function StartNode({ selected }: NodeProps<any>) {
  return (
    <div className={`min-w-[120px] min-h-[36px] border border-gray-300 rounded-full bg-white shadow-sm flex items-center justify-center gap-2 px-4 ${selected ? "ring-2 ring-blue-500" : ""}`}>
      <Play className="w-4 h-4 text-red-500 fill-red-500" />
      <span className="text-sm font-medium text-gray-700">Start</span>
    </div>
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
