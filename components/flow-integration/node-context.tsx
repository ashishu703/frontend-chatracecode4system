"use client"

import type React from "react"
import { createContext, useContext, type ReactNode } from "react"
import type { Node, Edge } from "@xyflow/react"
import type { NodeData } from "@/types/flow-integration/flow"

interface NodeContextType {
  nodes: Node<NodeData>[]
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
  edges: Edge[]
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  updateNode: (id: string, data: NodeData) => void
  deleteNode: (id: string) => void
  setStartNode: (id: string) => void
  setStartNodeId: (id: string) => void
  startNodeId: string | null
  duplicateNode: (id: string) => void
}

const NodeContext = createContext<NodeContextType | null>(null)

export function NodeContextProvider({
  children,
  nodes,
  setNodes,
  edges,
  setEdges,
  startNodeId,
  setStartNodeId,
}: {
  children: ReactNode
  nodes: Node<NodeData>[]
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
  edges: Edge[]
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  startNodeId: string | null
  setStartNodeId: (id: string) => void
}) {
  const updateNode = (id: string, data: NodeData) => {
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data } : node)))
  }

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const setStartNode = (id: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, isStart: true } }
          : { ...node, data: { ...node.data, isStart: false } }
      )
    );
  };

  const duplicateNode = (id: string) => {
    setNodes((nds) => {
      const nodeToDuplicate = nds.find((node) => node.id === id);
      if (!nodeToDuplicate) return nds;
      const newId = `${id}-copy-${Date.now()}`;
      const duplicatedNode = {
        ...nodeToDuplicate,
        id: newId,
        position: {
          x: nodeToDuplicate.position.x + 40,
          y: nodeToDuplicate.position.y + 40,
        },
        data: { ...nodeToDuplicate.data },
      };
      return [...nds, duplicatedNode];
    });
  };

  return (
    <NodeContext.Provider
      value={{
        nodes,
        setNodes,
        edges,
        setEdges,
        updateNode,
        deleteNode,
        setStartNode,
        setStartNodeId,
        startNodeId,
        duplicateNode,
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
