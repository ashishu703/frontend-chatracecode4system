import React from "react";
import { Eye, Play, Link2, Fingerprint, Pencil, Copy, Trash } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export type NodeActionType =
  | "preview"
  | "setStart"
  | "getLink"
  | "getId"
  | "rename"
  | "duplicate"
  | "delete";

export interface NodeActionsProps {
  onAction: (action: NodeActionType) => void;
  className?: string;
}

export const actions = [
  { type: "preview", icon: Eye, label: "Preview" },
  { type: "setStart", icon: Play, label: "Set as Starting Step" },
  { type: "getLink", icon: Link2, label: "Get Published Link" },
  { type: "getId", icon: Fingerprint, label: "Get Step ID" },
  { type: "rename", icon: Pencil, label: "Rename" },
  { type: "duplicate", icon: Copy, label: "Duplicate" },
  { type: "delete", icon: Trash, label: "Delete" },
];

export const NodeActions: React.FC<NodeActionsProps & {
  disabledActions?: NodeActionType[];
  customTooltips?: Partial<Record<NodeActionType, string>>;
}> = ({ onAction, className, disabledActions = [], customTooltips = {} }) => {
  return (
    <TooltipProvider>
      <div
        className={`flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-md px-2 py-1 absolute -top-10 left-1/2 -translate-x-1/2 z-50 ${className || ""}`}
        style={{ minWidth: 260 }}
      >
        {actions.map(({ type, icon: Icon, label }) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onAction(type as NodeActionType)}
                className={`hover:bg-gray-100 rounded p-1 transition-colors ${disabledActions.includes(type as NodeActionType) ? "opacity-50 pointer-events-none" : ""}`}
                aria-label={label}
                disabled={disabledActions.includes(type as NodeActionType)}
              >
                <Icon className="w-5 h-5 text-gray-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{customTooltips[type as NodeActionType] || label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default NodeActions; 