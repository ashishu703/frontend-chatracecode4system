import type { Node, Edge } from "@xyflow/react"

export interface NodeData extends Record<string, unknown> {
  type:
    | "simpleMessage"
    | "imageMessage"
    | "audioMessage"
    | "videoMessage"
    | "documentMessage"
    | "buttonMessage"
    | "listMessage"
    | "assignAgent"
    | "disableChatTill"
    | "requestAPI"
  data: {
    state?: {
      messageType?: string
      contentType?: string
      message?: string
      imageUrl?: string
      imageCaption?: string
      videoUrl?: string
      videoCaption?: string
      audioUrl?: string
      buttons?: { name: string }[]
      // add other fields as needed
    }
  }
}

export interface FlowData {
  nodes: Node<NodeData>[]
  edges: Edge[]
  name: string
  description: string
}

export interface FlowTemplate {
  id: string
  name: string
  description: string
  nodes: Node<NodeData>[]
  edges: Edge[]
  createdAt: string
}
