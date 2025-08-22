export interface ContactDetails {
  name?: string
  avatar?: string
  email?: string
  phone?: string
  verified?: boolean
  localTime?: string
  contact?: string
  country?: string
  platform?: string
  page_name?: string
  last_seen?: string
}

export interface Message {
  id: string
  sender: "user" | "other"
  message: string
  type: "text" | "image" | "video" | "audio" | "file" | "interactive" | "carousel" | "gif"
  timestamp: string
  rawTimestamp?: string | number
  status?: "sent" | "delivered" | "read" | ""
  body?: any
  reactions?: any[]
  buttons?: any[]
}

export interface Conversation {
  id: string
  chat_id: string
  name: string
  avatar: string
  lastMessage: any
  platform: string
  time: string
  page_name?: string
  page_icon?: string
  unread_count?: number
  sender_name?: string
  sender_id?: string
  last_message_time?: string
  last_message_body?: string
  channel_icon?: string
  status?: "open" | "pending" | "solved" | "closed"
  favorite?: boolean
  assignedTo?: string
  isBlocked?: boolean
  isDisabled?: boolean
  isActive?: boolean
  last_message_timestamp?: string | number
}


