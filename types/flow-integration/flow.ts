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
    | "mailMessage"
    | "assignAgent"
    | "disableChatTill"
    | "requestAPI"
    | "condition"
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
      // Mail message fields
      label?: string
      from?: string
      to?: string
      subject?: string
      preheader?: string
      headline?: string
      text?: string
      image?: string
      // Condition fields
      channelType?: string
      selectedChannels?: string[]
      timeDelayType?: string
      timeDelayValue?: number
      timeDelayUnit?: string
      // add other fields as needed
    }
  }
  title?: string
  messageNumber?: number
  message?: string
  options?: string[]
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
