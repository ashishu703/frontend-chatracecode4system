import type { Connection, Node } from "@xyflow/react"
import type { NodeData } from "@/types/flow"

export function validateConnection(connection: Connection, nodes: Node<NodeData>[]): boolean {
  if (!connection.source || !connection.target) {
    return false
  }

  const sourceNode = nodes.find((node) => node.id === connection.source)
  const targetNode = nodes.find((node) => node.id === connection.target)

  if (!sourceNode || !targetNode) {
    return false
  }

  // Start node can only connect to message nodes
  if (sourceNode.data.type === "start") {
    const messageTypes = ["text", "image", "audio", "video", "document", "button", "list"]
    return messageTypes.includes(targetNode.data.type)
  }

  // Prevent self-connections
  if (connection.source === connection.target) {
    return false
  }

  // Action nodes (assignAgent, disableChat) are terminal nodes
  const terminalTypes = ["assignAgent", "disableChat"]
  if (terminalTypes.includes(sourceNode.data.type)) {
    return false
  }

  return true
}

export function detectCircularDependency(nodes: Node<NodeData>[], edges: any[], newConnection: Connection): boolean {
  // Simple cycle detection - in a real implementation, you'd want more sophisticated cycle detection
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      return true
    }
    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId)
    for (const edge of outgoingEdges) {
      if (hasCycle(edge.target)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  // Check if adding the new connection would create a cycle
  const tempEdges = [...edges, newConnection]
  return hasCycle(newConnection.source!)
}
