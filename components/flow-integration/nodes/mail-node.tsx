import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { NodeData } from "@/types/flow-integration/flow";
import { Card } from "@/components/ui/card";
import { Mail, ChevronRight } from "lucide-react";
import NodeActions, { NodeActionType } from "./NodeActions";
import { useState, useEffect } from "react";
import { useNodeContext } from "../node-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

// Define a type for mail node state
export type MailNodeState = {
  label?: string;
  from?: string;
  to?: string;
  subject?: string;
  preheader?: string;
  headline?: string;
  text?: string;
  image?: string;
  button?: string;
};

export function MailNode({ data }: NodeProps<Node<NodeData>>) {
  // Type-cast state to MailNodeState for mail-specific fields
  const state = (data.data && (data.data as any).data?.state) ? (data.data as any).data.state as MailNodeState : {} as MailNodeState;
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(state.label || "Send Email");
  const [isStart, setIsStart] = useState(false);
  const { updateNode, deleteNode, duplicateNode, setStartNode } = useNodeContext();

  useEffect(() => {
    setRenameValue(state.label || "Send Email");
  }, [state.label]);

  const handleAction = (action: NodeActionType) => {
    switch (action) {
      case "preview":
        setShowPreview(true);
        break;
      case "rename":
        setShowRename(true);
        break;
      case "duplicate":
        duplicateNode(data.id as string);
        toast.success("Node duplicated");
        break;
      case "delete":
        deleteNode(data.id as string);
        toast.success("Node deleted");
        break;
      case "setStart":
        setStartNode(data.id as string);
        setIsStart(true);
        toast.success("Set as starting step");
        break;
      case "getLink":
        navigator.clipboard.writeText(window.location.href + "#" + data.id);
        toast.success("Link copied!");
        break;
      case "getId":
        navigator.clipboard.writeText(String(data.id));
        toast.success("Step ID copied!");
        break;
      default:
        break;
    }
  };

  const handleRenameSave = () => {
    updateNode(String(data.id), {
      type: data.type,
      data: {
        ...(data.data && (data.data as any).data),
        state: {
          ...((data.data && (data.data as any).data?.state) || {}),
          ...( { label: renameValue } as MailNodeState ),
        },
      },
    });
    setShowRename(false);
    toast.success("Node renamed");
  };

  return (
    <Card
      className={`min-w-[240px] relative ${data.selected ? "ring-2 ring-blue-500" : ""} ${isStart ? "ring-4 ring-green-500" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      {hovered && (
        <NodeActions onAction={handleAction} />
      )}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-green-600 rounded">
            <Mail className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-sm">{state.label || "Send Email"}</span>
          <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
        </div>
        <div className="text-xs text-gray-600">
          <div><b>From:</b> {state.from || "-"}</div>
          <div><b>To:</b> {state.to || "-"}</div>
          <div><b>Subject:</b> {state.subject || "-"}</div>
          <div><b>Preheader:</b> {state.preheader || "-"}</div>
          <div><b>Headline:</b> {state.headline || "-"}</div>
          <div><b>Text:</b> {state.text || "-"}</div>
          <div><b>Image:</b> {state.image || "-"}</div>
          <div><b>Button:</b> {state.button || "-"}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Email</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="p-4 space-y-2">
            <div className="font-bold">{state.subject || "No Subject"}</div>
            <div className="text-gray-700">{state.text || "No Content"}</div>
            <div><b>From:</b> {state.from || "-"}</div>
            <div><b>To:</b> {state.to || "-"}</div>
            <div><b>Preheader:</b> {state.preheader || "-"}</div>
            <div><b>Headline:</b> {state.headline || "-"}</div>
            <div><b>Image:</b> {state.image || "-"}</div>
            <div><b>Button:</b> {state.button || "-"}</div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Rename Dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Node</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <input
              className="border rounded px-2 py-1"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              autoFocus
            />
            <button className="bg-blue-500 text-white rounded px-3 py-1 mt-2" onClick={handleRenameSave}>Save</button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default MailNode; 