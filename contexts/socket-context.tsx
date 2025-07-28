"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import serverHandler from '@/utils/serverHandler'

interface Message {
  id: string
  chat_id: string
  body: {
    text?: string
    caption?: string
  }
  message?: string
  route: 'incoming' | 'outgoing'
  type: string
  timestamp: string
  status: string
}

interface Template {
  id: number
  uid: string
  content: string
  type: string
  title: string
  createdAt: string
  updatedAt: string
}

interface Flow {
  id: string
  name: string
  nodes: any[]
  edges: any[]
  triggerType: 'keyword' | 'exact'
  keywords?: string[]
  exactMatch?: string
  isActive: boolean
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  messages: Message[]
  templates: Template[]
  flows: Flow[]
  isLoading: boolean
  sendMessage: (chatId: string, message: any) => Promise<void>
  checkAndTriggerFlow: (message: Message) => Promise<void>
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [flows, setFlows] = useState<Flow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Only connect socket if token exists
  useEffect(() => {
    const token = localStorage.getItem("serviceToken");
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      setTemplates([]);
      setFlows([]);
      setMessages([]);
      return;
    }

    let wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:6400"
    if (wsUrl.startsWith("ws://")) wsUrl = wsUrl.replace("ws://", "http://")
    if (wsUrl.startsWith("wss://")) wsUrl = wsUrl.replace("wss://", "https://")

    const newSocket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    setSocket(newSocket)

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Handle incoming messages
    newSocket.on('new_message', (msg: Message) => {
      console.log('New message received in socket context:', msg)
      console.log('Current messages count:', messages.length)
      setMessages(prev => {
        const updatedMessages = [...prev, msg]
        console.log('Updated messages in context:', updatedMessages)
        return updatedMessages
      })
      // Check if this is an incoming message and trigger flow matching
      if (msg.route === 'incoming') {
        console.log('Processing incoming message for flow matching...')
        checkAndTriggerFlow(msg)
      }
    })

    return () => {
      newSocket.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof window !== 'undefined' ? localStorage.getItem("serviceToken") : null])

  // Listen for token changes (logout/login in other tabs)
  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("serviceToken");
      if (!token && socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setTemplates([]);
        setFlows([]);
        setMessages([]);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [socket]);

  // Fetch templates and flows when socket is connected and token exists
  useEffect(() => {
    const token = localStorage.getItem("serviceToken");
    if (isConnected && token) {
      setIsLoading(true)
      // Add a small delay to ensure the connection is stable
      const timer = setTimeout(async () => {
        await Promise.all([fetchTemplates(), fetchFlows()])
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  const fetchTemplates = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem("serviceToken");
      if (!token) return;
      const response = await serverHandler.get('/api/templet/get_templets', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if ((response.data as any).success) {
        setTemplates((response.data as any).data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplates([])
      if (retryCount === 0 && (error as any).message === 'Network Error') {
        console.log('Retrying template fetch in 5 seconds...')
        setTimeout(() => fetchTemplates(1), 5000)
      }
    }
  }

  const fetchFlows = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem("serviceToken");
      if (!token) return;
      const response = await serverHandler.get('/api/chat_flow/get_mine', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if ((response.data as any).success) {
        setFlows((response.data as any).data || [])
      }
    } catch (error) {
      console.error('Error fetching flows:', error)
      setFlows([])
      if (retryCount === 0 && (error as any).message === 'Network Error') {
        console.log('Retrying flows fetch in 5 seconds...')
        setTimeout(() => fetchFlows(1), 5000)
      }
    }
  }

  const checkAndTriggerFlow = async (message: Message) => {
    try {
      console.log('Checking flow for message:', message)
      const messageText = message.body?.text || message.body?.caption || message.message || ""
      if (!messageText) {
        console.log('No text content in message')
        return
      }
      if (flows.length > 0) {
        for (const flow of flows) {
          if (!flow.isActive) continue
          let isMatch = false
          if (flow.triggerType === 'keyword' && flow.keywords) {
            isMatch = flow.keywords.some(keyword => 
              messageText.toLowerCase().includes(keyword.toLowerCase())
            )
          }
          if (flow.triggerType === 'exact' && flow.exactMatch) {
            isMatch = messageText.toLowerCase() === flow.exactMatch.toLowerCase()
          }
          if (isMatch) {
            console.log('Flow matched:', flow.name)
            await triggerFlowResponse(flow, message.chat_id)
            break
          }
        }
      }
      if (templates.length > 0) {
        await checkTemplateMatching(messageText, message.chat_id)
      }
    } catch (error) {
      console.error('Error in flow matching:', error)
    }
  }

  const checkTemplateMatching = async (messageText: string, chatId: string) => {
    try {
      for (const template of templates) {
        if (template.type === 'TEXT') {
          try {
            const templateContent = JSON.parse(template.content)
            const templateText = templateContent.text?.body || ""
            if (messageText.toLowerCase().includes(templateText.toLowerCase()) || 
                templateText.toLowerCase().includes(messageText.toLowerCase())) {
              console.log('Template matched:', template.title)
              await sendTemplateResponse(template, chatId)
              break
            }
          } catch (error) {
            console.error('Error parsing template content:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error in template matching:', error)
    }
  }

  const triggerFlowResponse = async (flow: Flow, chatId: string) => {
    try {
      const startNode = flow.nodes.find(node => node.type === 'simpleMessageNode')
      if (startNode && startNode.data) {
        const messageContent = startNode.data.message || startNode.data.data?.state?.message || ""
        if (messageContent) {
          await sendMessage(chatId, {
            type: 'text',
            body: {
              text: messageContent
            }
          })
        }
      }
    } catch (error) {
      console.error('Error triggering flow response:', error)
    }
  }

  const sendTemplateResponse = async (template: Template, chatId: string) => {
    try {
      const templateContent = JSON.parse(template.content)
      const messageContent = templateContent.text?.body || ""
      if (messageContent) {
        await sendMessage(chatId, {
          type: 'text',
          body: {
            text: messageContent
          }
        })
      }
    } catch (error) {
      console.error('Error sending template response:', error)
    }
  }

  const sendMessage = async (chatId: string, message: any) => {
    try {
      const token = localStorage.getItem("serviceToken");
      if (!token) return;
      await serverHandler.post("/api/messanger/send", {
        chat_id: chatId,
        message: message.body?.text || message.body?.caption || message.message || "",
        type: message.type || 'text'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Auto-response sent to chat:', chatId)
    } catch (error) {
      console.error('Error sending auto-response:', error)
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    messages,
    templates,
    flows,
    isLoading,
    sendMessage,
    checkAndTriggerFlow
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
} 