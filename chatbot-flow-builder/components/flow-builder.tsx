"use client"

import type React from "react"
import { useCallback, useState, useRef } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { NodeSidebar } from "./node-sidebar"
import { NodeConfigPanel } from "./node-config-panel"
import { FlowHeader } from "./flow-header"
import { NodeContextProvider } from "./node-context"
import { nodeTypes } from "./nodes"
import { validateConnection } from "../lib/flow-validation"
import type { FlowData, NodeData, FlowTemplate } from "@/types/flow"

const initialNodes: Node<NodeData>[] = [
  {
    id: "start-1",
    type: "startNode",
    position: { x: 250, y: 100 },
    data: {
      type: "start",
      config: {
        label: "Start",
        content: "Welcome! How can I help you today?",
      },
    },
  },
]

const initialEdges: Edge[] = []

function FlowBuilderContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const reactFlowInstance = useReactFlow()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onConnect = useCallback(
    (params: Connection) => {
      if (validateConnection(params, nodes)) {
        setEdges((eds) => addEdge(params, eds))
      }
    },
    [nodes, setEdges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node<NodeData> = {
        id: `${type}-${Date.now()}`,
        type: `${type}Node`,
        position,
        data: {
          type: type as NodeData["type"],
          config: getDefaultConfig(type as NodeData["type"]),
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

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

  const saveFlow = async () => {
    const flowData: FlowData = {
      nodes,
      edges,
      name: "My Chatbot Flow",
      description: "A dynamic chatbot conversation flow",
    }

    try {
      const response = await fetch("/api/chat_flow/add_new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flowData),
      })

      if (response.ok) {
        console.log("Flow saved successfully")
      }
    } catch (error) {
      console.error("Error saving flow:", error)
    }
  }

  const loadFlow = async (flowId: string) => {
    try {
      const response = await fetch("/api/chat_flow/get_by_flow_id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowId }),
      })

      if (response.ok) {
        const flowData: FlowData = await response.json()
        setNodes(flowData.nodes)
        setEdges(flowData.edges)
      }
    } catch (error) {
      console.error("Error loading flow:", error)
    }
  }

  const loadTemplate = (template: FlowTemplate) => {
    setNodes(template.nodes)
    setEdges(template.edges)
  }

  return (
    <NodeContextProvider nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges}>
      <div className="h-full flex flex-col bg-gray-50">
        <FlowHeader
          onSave={saveFlow}
          onLoad={loadFlow}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          nodes={nodes}
          edges={edges}
          onLoadTemplate={loadTemplate}
        />

        <div className="flex-1 flex">
          <NodeSidebar onAddNode={(node) => setNodes((nds) => nds.concat(node))} />

          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className={isPreviewMode ? "pointer-events-none" : ""}
            >
              <Background />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  switch (node.data?.type) {
                    case "start":
                      return "#10b981"
                    case "text":
                      return "#3b82f6"
                    case "image":
                      return "#8b5cf6"
                    case "apiRequest":
                      return "#f59e0b"
                    default:
                      return "#6b7280"
                  }
                }}
              />
            </ReactFlow>
          </div>

          {selectedNode && <NodeConfigPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
        </div>
      </div>
    </NodeContextProvider>
  )
}

export function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent />
    </ReactFlowProvider>
  )
}
