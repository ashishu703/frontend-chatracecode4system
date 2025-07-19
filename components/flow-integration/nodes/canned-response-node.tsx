import React from "react";
import { Handle, Position } from "@xyflow/react";

export default function CannedResponseNode({ data }: any) {
  return (
    <div className="rounded border bg-white shadow p-3 min-w-[180px]">
      <div className="font-semibold text-blue-700 mb-1">Canned Response</div>
      <div className="text-xs text-gray-700 mb-1">{data.config.label || "No label"}</div>
      <div className="text-xs text-gray-500 mb-1">
        {data.config.text || data.config.templateName || "No response set"}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 