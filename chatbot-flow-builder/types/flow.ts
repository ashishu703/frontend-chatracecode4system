import type { Node, Edge } from "@xyflow/react"

export interface NodeData {
  type:
    | "start"
    | "text"
    | "image"
    | "audio"
    | "video"
    | "document"
    | "button"
    | "list"
    | "assignAgent"
    | "disableChat"
    | "apiRequest"
  config: {
    // Common
    label?: string

    // Start node
    content?: string

    // Text message
    quickReplies?: Array<{ text: string; payload: string }>
    delay?: number

    // Image message
    url?: string
    caption?: string
    alt?: string

    // Audio message
    autoPlay?: boolean

    // Video message
    thumbnail?: string

    // Document message
    title?: string
    fileType?: string

    // Button message
    text?: string
    buttons?: Array<{
      type: "url" | "postback" | "phone"
      title: string
      url?: string
      payload?: string
      phone?: string
    }>

    // List message
    header?: string
    body?: string
    sections?: Array<{
      title: string
      description: string
      image?: string
    }>
    button?: {
      text: string
      payload: string
    }

    // Assign agent
    agentId?: string
    message?: string
    fallback?: "continue_flow" | "end_chat"

    // Disable chat
    duration?: number
    resumeAction?: "notify" | "continue"

    // API request
    method?: string
    headers?: Record<string, string>
    body?: Record<string, any>
    responseMapping?: Record<string, string>
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
