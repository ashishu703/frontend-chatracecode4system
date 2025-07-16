"use client"

import type React from "react"
import type { Node } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import type { NodeData } from "@/types/flow"
import {
  MessageSquare,
  ImageIcon,
  Volume2,
  Video,
  FileText,
  MousePointer,
  List,
  UserPlus,
  XCircle,
  Zap,
} from "lucide-react"

const nodeCategories = [
  {
    title: "Message Nodes",
    nodes: [
      { type: "text", label: "Text Message", icon: MessageSquare, color: "bg-blue-500" },
      { type: "image", label: "Image", icon: ImageIcon, color: "bg-purple-500" },
      { type: "audio", label: "Audio", icon: Volume2, color: "bg-green-500" },
      { type: "video", label: "Video", icon: Video, color: "bg-red-500" },
      { type: "document", label: "Document", icon: FileText, color: "bg-gray-500" },
      { type: "button", label: "Button", icon: MousePointer, color: "bg-indigo-500" },
      { type: "list", label: "List", icon: List, color: "bg-teal-500" },
    ],
  },
  {
    title: "Action Nodes",
    nodes: [
      { type: "assignAgent", label: "Assign to Agent", icon: UserPlus, color: "bg-orange-500" },
      { type: "disableChat", label: "Disable Chat", icon: XCircle, color: "bg-red-600" },
      { type: "apiRequest", label: "API Request", icon: Zap, color: "bg-yellow-500" },
    ],
  },
]

interface NodeSidebarProps {
  onAddNode?: (node: Node<NodeData>) => void
}

export function NodeSidebar({ onAddNode }: NodeSidebarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const getDefaultConfig = (type: NodeData["type"]) => {
    const configs = {
      start: {
        label: "Start",
        content: "Welcome! How can I help you today?",
      },
      text: {
        label: "Text Message",
        content: "Hello! How can I help you today?",
        quickReplies: [],
        delay: 1000,
      },
      image: {
        label: "Image",
        url: "",
        caption: "",
        alt: "",
      },
      audio: {
        label: "Audio",
        url: "",
        caption: "",
        autoPlay: false,
      },
      video: {
        label: "Video",
        url: "",
        thumbnail: "",
        caption: "",
      },
      document: {
        label: "Document",
        url: "",
        title: "",
        fileType: "pdf",
      },
      button: {
        label: "Button Message",
        text: "What would you like to do?",
        buttons: [],
      },
      list: {
        label: "List Message",
        header: "",
        body: "Please select an option:",
        sections: [],
        button: { text: "", payload: "" },
      },
      assignAgent: {
        label: "Assign to Agent",
        agentId: "",
        message: "Transferring you to a support agent...",
        fallback: "continue_flow",
      },
      disableChat: {
        label: "Disable Chat",
        duration: 60,
        message: "Chat disabled for maintenance. Please check back later.",
        resumeAction: "notify",
      },
      apiRequest: {
        label: "API Request",
        method: "POST",
        url: "",
        headers: {
          "Content-Type": "application/json",
        },
        body: {},
        responseMapping: {},
      },
    }
    return configs[type] || {}
  }

  const onNodeClick = (nodeType: string) => {
    // Get a position with some randomness to avoid overlap
    const centerX = 400 + Math.random() * 200
    const centerY = 200 + Math.random() * 200

    const newNode: Node<NodeData> = {
      id: `${nodeType}-${Date.now()}`,
      type: `${nodeType}Node`,
      position: { x: centerX, y: centerY },
      data: {
        type: nodeType as NodeData["type"],
        config: getDefaultConfig(nodeType as NodeData["type"]),
      },
    }

    // Add the node to the canvas
    if (onAddNode) {
      onAddNode(newNode)
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="space-y-6">
        {nodeCategories.map((category) => (
          <div key={category.title}>
            <h3 className="text-sm font-medium text-gray-900 mb-3">{category.title}</h3>
            <div className="space-y-2">
              {category.nodes.map((node) => (
                <Card
                  key={node.type}
                  className="p-3 cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all border-gray-200 select-none"
                  draggable
                  onDragStart={(event) => onDragStart(event, node.type)}
                  onClick={() => onNodeClick(node.type)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${node.color}`}>
                      <node.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{node.label}</p>
                      <p className="text-xs text-gray-500">Click to add or drag & drop</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
