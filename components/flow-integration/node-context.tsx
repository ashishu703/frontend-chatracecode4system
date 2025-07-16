"use client"

import type React from "react"
import { createContext, useContext, type ReactNode } from "react"
import type { Node, Edge } from "@xyflow/react"
import type { NodeData } from "@/types/flow"

interface NodeContextType {
  nodes: Node<NodeData>[]
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
  edges: Edge[]
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  updateNode: (id: string, data: NodeData) => void
  deleteNode: (id: string) => void
}

const NodeContext = createContext<NodeContextType | null>(null)

export function NodeContextProvider({
  children,
  nodes,
  setNodes,
  edges,
  setEdges,
}: {
  children: ReactNode
  nodes: Node<NodeData>[]
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
  edges: Edge[]
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
}) {
  const updateNode = (id: string, data: NodeData) => {
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data } : node)))
  }

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  return (
    <NodeContext.Provider
      value={{
        nodes,
        setNodes,
        edges,
        setEdges,
        updateNode,
        deleteNode,
      }}
    >
      {children}
    </NodeContext.Provider>
  )
}

export function useNodeContext() {
  const context = useContext(NodeContext)
  if (!context) {
    throw new Error("useNodeContext must be used within NodeContextProvider")
  }
  return context
}
