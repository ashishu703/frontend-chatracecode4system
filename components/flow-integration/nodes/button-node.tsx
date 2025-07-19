"use client"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { MousePointer } from "lucide-react"
import type { NodeData } from "@/types/flow"
import NodeActions, { NodeActionType } from "./NodeActions";
import { useState, useEffect } from "react";
import { useNodeContext } from "../node-context";
import { toast } from "sonner";

export function ButtonNode({ data, selected, id }: NodeProps<any>) {
  const state = data.data?.state || {};
  const buttonCount = state.buttons?.length || 0;
  const [hovered, setHovered] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(state.label || "Button");
  const { updateNode, deleteNode, duplicateNode, setStartNode } = useNodeContext();

  useEffect(() => {
    setRenameValue(state.label || "Button");
  }, [state.label]);

  const handleAction = (action: NodeActionType) => {
    switch (action) {
      case "rename":
        setShowRename(true);
        break;
      case "duplicate":
        duplicateNode(id);
        toast.success("Node duplicated");
        break;
      case "delete":
        deleteNode(id);
        toast.success("Node deleted");
        break;
      case "setStart":
        setStartNode(id);
        toast.success("Set as starting step");
        break;
      default:
        break;
    }
  };

  const handleRenameSave = () => {
    updateNode(id, {
      ...data,
      data: {
        ...data.data,
        state: {
          ...state,
          label: renameValue,
        },
      },
    });
    setShowRename(false);
    toast.success("Node renamed");
  };

  return (
    <Card
      className={`min-w-[200px] relative ${selected ? "ring-2 ring-blue-500" : ""} ${data.isStart ? "ring-4 ring-green-500" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
      {hovered && <NodeActions onAction={handleAction} />}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-indigo-500 rounded">
            <MousePointer className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-sm">{state.label || "Button"}</span>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{state.text}</p>
        <p className="text-xs text-gray-500 mt-1">
          {buttonCount} button{buttonCount !== 1 ? "s" : ""}
        </p>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
    </Card>
  );
}

export default ButtonNode;
