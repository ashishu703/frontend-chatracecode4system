"use client"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { MessageSquare, ChevronRight } from "lucide-react"
import type { NodeData } from "@/types/flow-integration/flow"
import NodeActions, { NodeActionType } from "./NodeActions";
import { useState } from "react";
import { useNodeContext } from "../node-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useEffect } from "react";
import { toast } from "sonner";
import { NodeContentPreview } from "../NodeContentPreview"

// Content type label mapping (should match node-config-panel)
const contentTypes = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "card", label: "Card" },
  { value: "carousel", label: "Carousel" },
  { value: "audio", label: "Audio" },
  { value: "getUserData", label: "Get User Data" },
  { value: "video", label: "Video" },
  { value: "optionsList", label: "Options List" },
  { value: "videoTemplate", label: "Video Template" },
  { value: "messagePro", label: "Message Pro" },
  { value: "gif", label: "GIF" },
  { value: "typingNotification", label: "Typing Notification" },
  { value: "requestFile", label: "Request File" },
  { value: "actions", label: "Actions" },
  { value: "whatsappFlows", label: "WhatsApp Flows" },
  { value: "viewCatalog", label: "View Catalog" },
  { value: "sendProducts", label: "Send Products" },
  { value: "location", label: "Location" },
  { value: "whatsappMessenger", label: "WhatsApp Messenger" },
];

export function TextNode({ data, selected, id }: NodeProps<any>) {
  const state = data.data?.state || {};
  const quickRepliesCount = state.quickReplies?.length || 0;
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(state.label || "Send Message");
  const { updateNode, deleteNode, setStartNode } = useNodeContext();

  // Get the label for the current content type
  const contentTypeLabel = contentTypes.find((t) => t.value === state.contentType)?.label || "Send Message";

  useEffect(() => {
    setRenameValue(state.label || "Send Message");
  }, [state.label]);

  const handleAction = (action: NodeActionType) => {
    switch (action) {
      case "preview":
        setShowPreview(true);
        break;
      case "rename":
        setShowRename(true);
        break;
      case "delete":
        deleteNode(id);
        toast.success("Node deleted");
        break;
      case "setStart":
        setStartNode(id);
        toast.success("Set as starting step");
        break;
      case "getLink":
        navigator.clipboard.writeText(window.location.href + "#" + id);
        toast.success("Link copied!");
        break;
      case "getId":
        navigator.clipboard.writeText(id);
        toast.success("Step ID copied!");
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
      className={`min-w-[200px] relative ${selected ? "ring-2 ring-blue-500" : ""} ${data.data?.isStart ? "ring-4 ring-green-500" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      {hovered && (
        <NodeActions onAction={handleAction} />
      )}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-blue-500 rounded">
            <MessageSquare className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-sm">{contentTypeLabel}</span>
          <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
        </div>
        {/* Live content preview inside node */}
        <NodeContentPreview state={state} selectedContentType={state.contentType || "text"} />
        {quickRepliesCount > 0 && <p className="text-xs text-gray-500 mt-1">{quickRepliesCount} quick replies</p>}
        {state.delay && <p className="text-xs text-gray-500 mt-1">Delay: {state.delay}ms</p>}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Message</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="p-4">
            <div className="font-bold mb-2">{state.label || "Send Message"}</div>
            <div className="text-gray-700">{state.content}</div>
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

export default TextNode;
