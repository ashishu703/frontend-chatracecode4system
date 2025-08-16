"use client"
import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useSocket } from "@/contexts/socket-context"
import { Sidebar } from "./components/Sidebar"
import { Header } from "./components/Header"
import { Messages } from "./components/Messages"
import { Composer } from "./components/Composer"
import { Conversation, Message, ContactDetails } from "./types"
import { fetchChats, fetchMessagesForChat, listMessengerChats, sendMessage, sendFile, uploadMedia, sendMedia } from "./api"
import { formatTime } from "./utils"
import { getChannelIcon } from "./utils"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export default function InboxView() {
  const [message, setMessage] = React.useState("")
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = React.useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(false)
  const [contactDetails, setContactDetails] = React.useState<ContactDetails | null>(null)
  const [filter, setFilter] = React.useState<"all" | "pending" | "open" | "solved">("all")
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearch, setShowSearch] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const autoScrollNextRef = React.useRef<boolean>(true)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
  const { socket, isConnected } = useSocket()
  const [assignedTo, setAssignedTo] = React.useState<string | undefined>(undefined)
  const [favorite, setFavorite] = React.useState<Record<string, boolean>>({})
  const [isDisabledMap, setIsDisabledMap] = React.useState<Record<string, boolean>>({})
  const [isBlockedMap, setIsBlockedMap] = React.useState<Record<string, boolean>>({})
  const [statusMap, setStatusMap] = React.useState<Record<string, Conversation["status"]>>({})
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(15 * 60)
  const users = React.useMemo(() => [{ id: "me", name: "Me", online: true }, { id: "agent-1", name: "Agent 1", online: false }], [])
  
  // Pagination state for messages
  const [currentPage, setCurrentPage] = React.useState(1)
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true)
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = React.useState(false)
  const PAGE_SIZE = 10 

  // Debug: Monitor message changes
  React.useEffect(() => {
    console.log("🔍 Messages state changed. Count:", messages.length)
    if (messages.length > 0) {
      console.log("🔍 Current message IDs:", messages.map(m => ({ 
        id: m.id, 
        message: m.message.substring(0, 30), 
        sender: m.sender,
        status: m.status 
      })))
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  React.useEffect(() => {
    if (autoScrollNextRef.current) {
      scrollToBottom()
    }
  }, [messages])

  React.useEffect(() => {
    const t = setInterval(() => setRemainingSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  React.useEffect(() => {
    if (!socket) return
    const handleNewChat = (chat: any) => {
      const newConversation: Conversation = {
        id: chat.id || chat.chat_id,
        chat_id: chat.chat_id || chat.id,
        name: chat.sender_name || chat.name || "Unknown",
        avatar: chat.avatar || chat.profile_pic || "/placeholder.svg",
        lastMessage: chat.lastMessage?.body?.text || chat.last_message_body || chat.lastMessage || "",
        platform: chat.platform || chat.channel || "messenger",
        time: formatTime(chat.lastMessage?.timestamp || chat.last_message_time || chat.time || chat.createdAt),
        page_name: chat.page?.name || chat.page_name,
        page_icon: chat.page?.icon || chat.page_icon,
        channel_icon: chat.channel_icon,
        unread_count: chat.unread_count || 0,
        sender_name: chat.sender_name,
        last_message_time: chat.lastMessage?.timestamp || chat.last_message_time,
        last_message_body: chat.lastMessage?.body?.text || chat.last_message_body,
      }
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === newConversation.id)
        if (exists) return prev.map((c) => (c.id === newConversation.id ? newConversation : c))
        return [newConversation, ...prev]
      })
    }
    const handleChatUpdate = (updatedChat: any) => {
      setConversations((prev) => prev.map((chat) => (chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat)))
    }
    const handleNewMessage = (message: any) => {
      setConversations((prev) =>
        prev.map((chat) => {
          if (chat.chat_id === message.chat_id || chat.id === message.chat_id) {
            return {
              ...chat,
              lastMessage: message.body?.text || message.body?.caption || message.message || "",
              last_message_body: message.body?.text || message.body?.caption || message.message || "",
              last_message_time: message.timestamp || message.createdAt,
              time: formatTime(message.timestamp || message.createdAt),
              unread_count: (chat.unread_count || 0) + 1,
            }
          }
          return chat
        })
      )
    }
    socket.on("new_chat", handleNewChat)
    socket.on("chat_updated", handleChatUpdate)
    socket.on("new_message", handleNewMessage)
    return () => {
      socket.off("new_chat", handleNewChat)
      socket.off("chat_updated", handleChatUpdate)
      socket.off("new_message", handleNewMessage)
    }
  }, [socket])

  React.useEffect(() => {
    let isMounted = true
    const loadChats = async () => {
      setIsLoading(true)
      console.log("🔍 loadChats: Starting to fetch chats...")
      const chats = await fetchChats()
      console.log("🔍 loadChats: Received chats:", chats)
      if (!isMounted) return
      const conversationsData = chats.map((chat: any) => ({
        id: chat.id || chat.chat_id,
        chat_id: chat.chat_id || chat.id,
        name: chat.sender_name || chat.page?.name || chat.name || "Unknown",
        avatar: chat.avatar || chat.profile_pic || "/placeholder.svg",
        lastMessage: chat.lastMessage?.body?.text || chat.last_message_body || chat.lastMessage || "",
        platform: chat.platform || chat.channel || "messenger",
        time: formatTime(chat.lastMessage?.timestamp || chat.last_message_time || chat.time || chat.createdAt),
        page_name: chat.page?.name || chat.page_name,
        page_icon: chat.page?.icon || chat.page_icon,
        channel_icon: chat.channel_icon,
        unread_count: chat.unread_count || 0,
        sender_name: chat.sender_name,
        sender_id: chat.sender_id || chat.chat_id, // Use sender_id if available, fallback to chat_id
        last_message_time: chat.lastMessage?.timestamp || chat.last_message_time,
        last_message_body: chat.lastMessage?.body?.text || chat.last_message_body,
        status: statusMap[chat.id || chat.chat_id] || "open",
        favorite: !!favorite[chat.id || chat.chat_id],
        isDisabled: !!isDisabledMap[chat.id || chat.chat_id],
        isBlocked: !!isBlockedMap[chat.id || chat.chat_id],
        isActive: typeof chat.isActive === 'boolean' ? chat.isActive : true,
        last_message_timestamp: chat.last_message_timestamp || chat.lastMessage?.timestamp,
      })) as Conversation[]
      console.log("🔍 loadChats: Processed conversations:", conversationsData)
      setConversations(conversationsData)
      setFilteredConversations(conversationsData)
      const firstConversation = conversationsData.length > 0 ? conversationsData[0] : null
      console.log("🔍 loadChats: Setting first conversation as selected:", firstConversation)
      setSelectedConversation(firstConversation)
      
      // Reset timer based on first conversation's last message time
      if (firstConversation) {
        console.log("🕐 Initial timer reset for first conversation")
        resetTimerFromTimestamp(firstConversation.platform || "", firstConversation.last_message_time)
      }
      
      // Reset pagination state
      setCurrentPage(1)
      setHasMoreMessages(true)
      
      setIsLoading(false)
    }
    loadChats()
    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(
        (conv) =>
          conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof conv.lastMessage === "string" ? conv.lastMessage : "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.platform.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  const fetchMessages = React.useCallback(async (page: number = 1, append: boolean = false) => {
    if (!selectedConversation) return
    setIsLoadingMessages(true)
    console.log("🔍 fetchMessages: Fetching messages for conversation (by both ids):", { id: selectedConversation.id, chat_id: selectedConversation.chat_id }, "Page:", page, "Append:", append)
    
    try {
      const [msgsByConvId, msgsByChatId] = await Promise.all([
        fetchMessagesForChat(String(selectedConversation.id), page, PAGE_SIZE),
        fetchMessagesForChat(String(selectedConversation.chat_id), page, PAGE_SIZE),
      ])
      const msgs = [...(Array.isArray(msgsByConvId) ? msgsByConvId : []), ...(Array.isArray(msgsByChatId) ? msgsByChatId : [])]
      console.log("🔍 fetchMessages: Received messages (merged):", { byConvId: msgsByConvId?.length || 0, byChatId: msgsByChatId?.length || 0, merged: msgs.length })
      
      if (!Array.isArray(msgs) || msgs.length === 0) {
        if (page === 1) {
          console.log("🔍 fetchMessages: No messages found, clearing messages array")
          setMessages([])
        }
        setHasMoreMessages(false)
        setContactDetails({ ...(selectedConversation as any) })
        setIsLoadingMessages(false)
        return
      }
      
      const messagesData = msgs.map((msg: any) => {
        let messageText = ""
        let messageType = msg.type || "text"
        let messageBody = msg.body
        
        // Handle different message body formats
        if (typeof msg.body === "string") {
          messageText = msg.body
        } else if (msg.body && typeof msg.body === "object") {
          if (msg.body.attachment_url || msg.body.attchment_url || msg.body.url || msg.body.image_url) {
            messageType = "image"
            messageText = msg.body.text || msg.body.caption || ""
            messageBody = { url: msg.body.attachment_url || msg.body.attchment_url || msg.body.url || msg.body.image_url, caption: msg.body.text || msg.body.caption || "" }
          } else if (msg.body.video_url || (msg.body.url && msg.body.type === "video")) {
            messageType = "video"
            messageText = msg.body.text || msg.body.caption || ""
            messageBody = { url: msg.body.video_url || msg.body.url, caption: msg.body.text || msg.body.caption || "" }
          } else if (msg.body.audio_url || (msg.body.url && msg.body.type === "audio")) {
            messageType = "audio"
            messageText = msg.body.text || msg.body.caption || ""
            messageBody = { url: msg.body.audio_url || msg.body.url, caption: msg.body.text || msg.body.caption || "" }
          } else if (msg.body.document_url || msg.body.file_url || (msg.body.url && msg.body.type === "document")) {
            messageType = "file"
            messageText = msg.body.text || msg.body.caption || msg.body.filename || "Document"
            messageBody = { url: msg.body.document_url || msg.body.file_url || msg.body.url, caption: msg.body.text || msg.body.caption || "", filename: msg.body.filename || "Document", filesize: msg.body.filesize || "" }
          } else if (msg.body.elements && Array.isArray(msg.body.elements)) {
            messageType = "carousel"
            messageText = msg.body.text || msg.body.caption || ""
            messageBody = { elements: msg.body.elements, text: msg.body.text || msg.body.caption || "" }
          } else if (msg.body.gif_url || (msg.body.url && msg.body.type === "gif")) {
            messageType = "gif"
            messageText = msg.body.text || msg.body.caption || ""
            messageBody = { url: msg.body.gif_url || msg.body.url, caption: msg.body.text || msg.body.caption || "" }
          } else {
            messageText = (msg.body as any).text || (msg.body as any).caption || JSON.stringify(msg.body)
          }
        } else if (msg.message && typeof msg.message === "string") {
          messageText = msg.message
        } else if (msg.message && typeof msg.message === "object") {
          messageText = JSON.stringify(msg.message)
        }
        
        // Handle JSON string bodies
        if (typeof msg.body === "string" && msg.body.startsWith("{")) {
          try {
            const parsedBody = JSON.parse(msg.body)
            if (parsedBody.attchment_url || parsedBody.attachment_url || parsedBody.url) {
              messageType = "image"
              messageText = parsedBody.text || parsedBody.caption || ""
              messageBody = { url: parsedBody.attchment_url || parsedBody.attachment_url || parsedBody.url, caption: parsedBody.text || parsedBody.caption || "" }
            }
          } catch (e) {}
        }
        
        // Handle interactive messages
        let buttons: any[] = []
        if (msg.type === "interactive" && msg.body && (msg.body as any).interactive) {
          const interactive = (msg.body as any).interactive
          if (interactive.type === "button_reply" && interactive.button_reply) {
            messageText = interactive.button_reply.title || messageText
          } else if (interactive.type === "button" && interactive.button) {
            buttons = interactive.button.buttons || []
          }
        }
        
        // Handle URL patterns in message text
        if (
          messageText &&
          typeof messageText === "string" &&
          (messageText.includes("attchment_url") || messageText.includes("attachment_url") || messageText.includes(".jpg") || messageText.includes(".png") || messageText.includes(".jpeg"))
        ) {
          try {
            const urlMatch = messageText.match(/(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp))/i)
            if (urlMatch) {
              messageType = "image"
              messageBody = { url: urlMatch[1], caption: messageText.replace(urlMatch[0], "").trim() || "" }
              messageText = (messageBody as any).caption
            }
          } catch (e) {}
        }
        
        // Normalize timestamp for consistent sorting (store ms in rawTimestamp)
        const rawTimestamp = msg.timestamp || msg.createdAt || msg.created_at
        const rawTsMs = toMs(rawTimestamp)
        const formattedTimestamp = formatTime(rawTimestamp)
        
        // IMPORTANT: Properly handle route field to determine sender
        const sender = msg.route === "OUTGOING" || msg.route === "outgoing" ? "user" : "other"
        
        const processedMessage: Message = {
          id: msg.id || msg.message_id || `fetched-${Date.now()}-${Math.random()}`,
          sender: sender,
          message: messageText,
          type: messageType as Message["type"],
          timestamp: formattedTimestamp,
          rawTimestamp: rawTsMs,
          status: (msg.status || "") as any,
          body: messageBody,
          reactions: msg.reactions || [],
          buttons: buttons,
        }
        return processedMessage
      }) as Message[]
      
      // De-duplicate by id/message_id + timestamp
      const deduped = messagesData.filter((m, idx, arr) => idx === arr.findIndex(x => (x.id && m.id ? x.id === m.id : (x.message === m.message && x.rawTimestamp === m.rawTimestamp && x.sender === m.sender))))
      const sortedMessages = deduped.sort((a: any, b: any) => new Date(a.rawTimestamp || 0).getTime() - new Date(b.rawTimestamp || 0).getTime())
      console.log("🔍 fetchMessages: Setting", sortedMessages.length, "messages")
      console.log("🔍 fetchMessages: Message IDs:", sortedMessages.map(m => ({ id: m.id, message: (m.message||'').substring(0, 20), sender: m.sender })))
      
      if (append) {
       
        autoScrollNextRef.current = false
        setMessages((prev) => {
          const combined = [...sortedMessages, ...prev]
          const unique = combined.filter((msg, index, self) => index === self.findIndex(m => m.id === msg.id))
          return unique.sort((a, b) => new Date(a.rawTimestamp || 0).getTime() - new Date(b.rawTimestamp || 0).getTime())
        })
      } else {
        // Replace all messages (first page)
        autoScrollNextRef.current = true
        setMessages(sortedMessages)
      }
      
      // Update pagination state
      setHasMoreMessages((msgsByConvId?.length === PAGE_SIZE) || (msgsByChatId?.length === PAGE_SIZE))
      setCurrentPage(page)
      setContactDetails({ ...(selectedConversation as any) })
      
    } catch (error) {
      console.error("🔍 fetchMessages: Error fetching messages:", error)
      toast({ title: "Failed to load messages", description: "Please try again", variant: "destructive" })
    } finally {
      setIsLoadingMessages(false)
      // Re-enable auto-scroll for future updates unless we specifically set it off again
      if (!append) autoScrollNextRef.current = true
    }
  }, [selectedConversation, PAGE_SIZE])

  // Manual refresh function - use this instead of automatic refresh
  const manualRefreshMessages = React.useCallback(async () => {
    if (!selectedConversation) return
    console.log("🔄 Manual refresh requested by user")
    setCurrentPage(1)
    setHasMoreMessages(true)
    await fetchMessages(1, false)
  }, [selectedConversation, fetchMessages])

  // Load older messages function
  const loadOlderMessages = React.useCallback(async () => {
    if (!selectedConversation || !hasMoreMessages || isLoadingOlderMessages) return
    console.log("🔄 Loading older messages, page:", currentPage + 1)
    setIsLoadingOlderMessages(true)
    try {
      autoScrollNextRef.current = false
      await fetchMessages(currentPage + 1, true)
    } finally {
      setIsLoadingOlderMessages(false)
      // keep autoScrollNextRef false only for this update; next updates can scroll
      setTimeout(() => { autoScrollNextRef.current = true }, 0)
    }
  }, [selectedConversation, hasMoreMessages, isLoadingOlderMessages, currentPage, fetchMessages])

  // Listen for "Load older messages" action from Messages component button
  React.useEffect(() => {
    const onLoadOlder = () => {
      // In current implementation we fetch full history; replace with paginated API if available
      fetchMessages()
    }
    window.addEventListener('chat:load-older', onLoadOlder)
    return () => window.removeEventListener('chat:load-older', onLoadOlder)
  }, [fetchMessages])

  const computeWindowSeconds = React.useCallback((platform: string) => {
    if (/whatsapp/i.test(platform)) return 24 * 60 * 60
    if (/instagram|messenger/i.test(platform)) return 7 * 24 * 60 * 60
    return 7 * 24 * 60 * 60
  }, [])

  // Helper to normalize timestamps to milliseconds for consistent sorting
  const toMs = React.useCallback((raw: any): number => {
    if (!raw) return Date.now()
    if (typeof raw === 'number') return raw > 1e12 ? raw : raw * 1000
    if (typeof raw === 'string' && /^\d+$/.test(raw)) {
      const n = parseInt(raw, 10)
      return n > 1e12 ? n : n * 1000
    }
    const parsed = new Date(raw).getTime()
    return Number.isNaN(parsed) ? Date.now() : parsed
  }, [])

  const resetTimerFromTimestamp = React.useCallback((platform: string, timestamp?: string | number) => {
    const windowSeconds = computeWindowSeconds(platform)
    // Accept epoch seconds, epoch ms, or ISO
    let lastTsMs: number | null = null
    if (!timestamp) {
      lastTsMs = null
    } else if (typeof timestamp === 'number') {
      lastTsMs = timestamp > 1e12 ? timestamp : timestamp * 1000
    } else if (/^\d+$/.test(timestamp)) {
      const asNum = parseInt(timestamp, 10)
      lastTsMs = asNum > 1e12 ? asNum : asNum * 1000
    } else {
      lastTsMs = new Date(timestamp).getTime()
    }
    if (lastTsMs && !Number.isNaN(lastTsMs)) {
      const elapsed = Math.max(0, Math.floor((Date.now() - lastTsMs) / 1000))
      const remaining = Math.max(0, windowSeconds - elapsed)
      console.log("🕐 Timer reset - Platform:", platform, "Last TS:", timestamp, "Elapsed:", elapsed, "Remaining:", remaining)
      setRemainingSeconds(remaining)
    } else {
      console.log("🕐 Timer reset - No/invalid timestamp, giving full window:", windowSeconds)
      setRemainingSeconds(windowSeconds)
    }
  }, [computeWindowSeconds])

  // Reset timer when conversation changes
  React.useEffect(() => {
    console.log("🔍 useEffect: selectedConversation changed:", selectedConversation)
    if (selectedConversation) {
      console.log("🔍 useEffect: Calling fetchMessages for conversation:", selectedConversation.id)
      // Reset timer based on platform and last message time
      resetTimerFromTimestamp(selectedConversation.platform || "", selectedConversation.last_message_timestamp || selectedConversation.last_message_time)
      // Reset pagination and fetch first page
      setCurrentPage(1)
      setHasMoreMessages(true)
      autoScrollNextRef.current = true
      fetchMessages(1, false)
    } else {
      console.log("🔍 useEffect: No conversation selected, clearing messages")
      setMessages([])
    }
  }, [selectedConversation, fetchMessages, resetTimerFromTimestamp])

  React.useEffect(() => {
    if (!socket || !selectedConversation) return
    const handleNewMessage = (msg: any) => {
      if (msg.chat_id === selectedConversation.id || msg.chat_id === selectedConversation.chat_id) {
        const route = (msg.route || '').toString().toUpperCase()
        const rawTsMs = toMs(msg.timestamp || new Date().toISOString())
        const newMessage: Message = {
          id: msg.id || `socket-${Date.now()}-${Math.random()}`, // Ensure unique ID
          sender: route === "OUTGOING" ? "user" : "other",
          message: msg.body?.text || msg.body?.caption || msg.body || msg.message || "",
          type: (msg.type || "text") as any,
          timestamp: formatTime(msg.timestamp || new Date().toISOString()),
          rawTimestamp: rawTsMs,
          status: (msg.status || "") as any,
          body: msg.body,
          reactions: msg.reactions || [],
          buttons: msg.buttons || [],
        }
        
        setMessages((prev) => {
          // Check if this message already exists (by content and timestamp to avoid duplicates)
          const exists = prev.some((m) => {
            // More sophisticated duplicate detection
            const contentMatch = m.message === newMessage.message
            const timeMatch = Math.abs(new Date(m.rawTimestamp || 0).getTime() - new Date(newMessage.rawTimestamp || 0).getTime()) < 10000 // Within 10 seconds
            const senderMatch = m.sender === newMessage.sender
            
            return contentMatch && timeMatch && senderMatch
          })
          
          if (exists) {
            console.log("🔄 Message already exists, skipping duplicate:", newMessage.message)
            return prev
          }
          
          // Check if this is a duplicate of a message we just sent
          const isDuplicateOfSent = prev.some((m) => 
            m.status === "delivered" && 
            m.message === newMessage.message && 
            m.sender === "user" &&
            Math.abs(new Date(m.rawTimestamp || 0).getTime() - new Date(newMessage.rawTimestamp || 0).getTime()) < 5000
          )
          
          if (isDuplicateOfSent) {
            console.log("🔄 This appears to be a duplicate of a message we just sent, skipping")
            return prev
          }
          
          console.log("🆕 Adding new message from socket:", newMessage)
          const updated = [...prev, newMessage]
          const sorted = updated.sort((a, b) => new Date(a.rawTimestamp || 0).getTime() - new Date(b.rawTimestamp || 0).getTime())
          return sorted
        })
        
        // Reset timer on new incoming message
        console.log("🕐 New message received, resetting timer")
        resetTimerFromTimestamp(selectedConversation.platform || "", msg.timestamp)
      }
    }
    const handleUpdateDelivery = (msg: any) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: msg.status } : m)))
    }
    socket.on("new_message", handleNewMessage)
    socket.on("update_delivery", handleUpdateDelivery)
    return () => {
      socket.off("new_message", handleNewMessage)
      socket.off("update_delivery", handleUpdateDelivery)
    }
  }, [socket, selectedConversation, resetTimerFromTimestamp])

  const handleSendMessage = async () => {
    console.log("🚀 handleSendMessage called!")
    console.log("🚀 message:", message)
    console.log("🚀 selectedConversation:", selectedConversation)
    console.log("🚀 remainingSeconds:", remainingSeconds)
    if (!message.trim() || !selectedConversation) return
    // Guard: check messaging window
    if (remainingSeconds <= 0) {
      toast({ title: "Messaging window closed", description: "Please send a template message.", variant: "destructive" })
      return
    }
    
    
    
    const messageText = message.trim()
    console.log("🚀 messageText:", messageText)
    const tempMessageId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempMessageId,
      sender: "user",
      message: messageText,
      type: "text",
      timestamp: formatTime(new Date().toISOString()),
      rawTimestamp: Date.now(),
      status: "sent",
    }
    
    // Add optimistic message
    setMessages((prev) => [...prev, optimisticMessage])
    setMessage("")
    
    try {
      toast({ title: "Sending...", variant: "default" })
      const chatId = selectedConversation.chat_id || selectedConversation.id
      console.log("🚀 chatId:", chatId)
      console.log("🚀 Calling sendMessage with:", { messageText, chatId })
      // Use sender_id if available (actual Facebook user ID), otherwise use chat_id
      const senderId = selectedConversation.sender_id || chatId
      const response = await sendMessage(messageText, chatId, senderId, {
        isChatActive: remainingSeconds > 0,
        platform: selectedConversation.platform,
      })
      console.log("🚀 sendMessage response:", response)
      
      if (response.ok) {
        // Update the optimistic message to delivered status with a permanent ID
        const permanentId = `sent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setMessages((prev) => prev.map((msg) => 
          msg.id === tempMessageId 
            ? { ...msg, status: "delivered" as const, id: permanentId }
            : msg
        ))
        toast({ title: "Message sent!", variant: "default" })
        
        // DON'T refresh messages automatically - this was causing the disappearance!
        // Instead, just update the conversation's last message
        setConversations((prev) => prev.map((conv) => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: messageText, last_message_body: messageText, last_message_time: new Date().toISOString() }
            : conv
        ))
        
        console.log("✅ Message sent and persisted locally without refresh")
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error: any) {
      console.error("🚀 Error in handleSendMessage:", error)
      toast({ title: "Failed to send message", description: error.message || "Network error", variant: "destructive" })
      // Remove the failed optimistic message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId))
      setMessage(messageText)
    }
  }

  // Generic helper to upload and send any file/media
  const sendAnyFile = React.useCallback(async (file: File) => {
    if (!selectedConversation) return false
    try {
      const chatId = selectedConversation.chat_id || String(selectedConversation.id)
      const senderId = selectedConversation.sender_id || chatId
      const url = await uploadMedia(file)
      if (!url) {
        toast({ title: "Failed to upload file", variant: "destructive" })
        return false
      }
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "file"
      let success = await sendMedia({ type: fileType as any, url, caption: file.name, chatId, senderId })
      if (!success) {
        const resp = await sendMessage(url, chatId, senderId)
        success = resp.ok
      }
      if (success) {
        // Optimistically add to local state so it appears instantly
        const newMsg: Message = {
          id: `${fileType}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          sender: "user",
          message: fileType === "file" ? file.name : fileType === "image" ? "Image" : fileType === "video" ? "Video" : fileType === "audio" ? "Audio" : file.name,
          type: fileType as any,
          timestamp: formatTime(new Date().toISOString()),
          rawTimestamp: Date.now(),
          status: "delivered",
          body: { url, caption: file.name },
        }
        setMessages((prev) => [...prev, newMsg])
        toast({ title: `${fileType[0].toUpperCase() + fileType.slice(1)} sent successfully!`, variant: "default" })
        return true
      }
      toast({ title: "Failed to send file", variant: "destructive" })
      return false
    } catch (e: any) {
      toast({ title: "Failed to send file", description: e?.message || "Upload error", variant: "destructive" })
      return false
    }
  }, [selectedConversation])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await sendAnyFile(file)
    }
    if (event.target) event.target.value = ""
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await sendAnyFile(file)
    }
    if (event.target) event.target.value = ""
  }

  // Handle paste of images/videos from clipboard
  const handlePasteFiles = React.useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files)
    for (const f of arr) {
      await sendAnyFile(f)
    }
  }, [sendAnyFile])

  return (
    <TooltipProvider>
      <div className="flex w-full bg-background overflow-hidden" style={{ height: "83vh" }}>
        <Sidebar
          conversations={conversations}
          filteredConversations={filteredConversations}
          isLoading={isLoading}
          selectedConversation={selectedConversation}
          setSelectedConversation={(c) => setSelectedConversation(c)}
          leftSidebarOpen={leftSidebarOpen}
          setLeftSidebarOpen={setLeftSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          filter={filter}
          setFilter={setFilter}
          filterPopoverOpen={filterPopoverOpen}
          setFilterPopoverOpen={setFilterPopoverOpen}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <div className="flex h-full w-full">
              <div className="flex-1 flex flex-col min-w-0">
              <Header
                selectedConversation={selectedConversation}
                isConnected={isConnected}
                setLeftSidebarOpen={setLeftSidebarOpen}
                onToggleFavorite={() => {
                  setFavorite((m) => ({ ...m, [selectedConversation.id]: !m[selectedConversation.id] }))
                  setSelectedConversation({ ...selectedConversation, favorite: !selectedConversation.favorite })
                }}
                onToggleDisable={() => {
                  setIsDisabledMap((m) => ({ ...m, [selectedConversation.id]: !m[selectedConversation.id] }))
                  setSelectedConversation({ ...selectedConversation, isDisabled: !selectedConversation.isDisabled })
                }}
                onToggleBlock={() => {
                  setIsBlockedMap((m) => ({ ...m, [selectedConversation.id]: !m[selectedConversation.id] }))
                  setSelectedConversation({ ...selectedConversation, isBlocked: !selectedConversation.isBlocked })
                }}
                onChangeStatus={(st) => {
                  setStatusMap((m) => ({ ...m, [selectedConversation.id]: st }))
                  setSelectedConversation({ ...selectedConversation, status: st })
                }}
                remainingSeconds={remainingSeconds}
                onAssign={(uid) => setAssignedTo(uid)}
                assignedTo={assignedTo}
                users={users}
              />
              <Messages 
                messages={messages} 
                isLoadingMessages={isLoadingMessages} 
                messagesEndRef={messagesEndRef} 
                remainingSeconds={remainingSeconds}
                hasMoreMessages={hasMoreMessages}
                isLoadingOlderMessages={isLoadingOlderMessages}
                onLoadOlderMessages={loadOlderMessages}
                isActive={selectedConversation?.isActive}
              />
              <Composer
                message={message}
                setMessage={setMessage}
                onSend={handleSendMessage}
                onFilePick={handleFileUpload}
                onImagePick={handleImageUpload}
                fileInputRef={fileInputRef}
                imageInputRef={imageInputRef}
                disabled={selectedConversation?.isActive === false || remainingSeconds <= 0}
                disabledReason={
                  selectedConversation?.isActive === false
                    ? "This chat is disabled."
                    : remainingSeconds <= 0
                    ? (/whatsapp/i.test(selectedConversation?.platform || "")
                        ? "24-hour WhatsApp window closed. Send a template message."
                        : "7-day messaging window closed. Send a template message.")
                    : undefined
                }
                onQuickReply={() => toast({ title: "Quick reply picker opened" })}
                onTriggerChatbot={() => toast({ title: "Chatbot triggered" })}
                onRefresh={() => selectedConversation && fetchMessages(1, false)}
                onPasteFiles={handlePasteFiles}
              />
              </div>
                             <div className="hidden lg:flex shrink-0 w-[320px] border-l bg-white p-5 flex-col gap-5 h-full overflow-y-auto">
                 {/* User Icon with Platform Overlay */}
                 <div className="flex flex-col items-center gap-3">
                   <div className="relative">
                     {selectedConversation.avatar ? (
                       <img 
                         src={selectedConversation.avatar} 
                         alt={selectedConversation.name}
                         className="h-20 w-20 rounded-full object-cover"
                       />
                     ) : (
                       <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                         <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                           <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                           </svg>
                         </div>
                       </div>
                     )}
                     {selectedConversation.platform && (
                       <div className="absolute -bottom-1 -right-1 text-[20px]">{getChannelIcon(selectedConversation.platform)}</div>
                     )}
                   </div>
                   
                   {/* Username in Bold Gray */}
                   <div className="text-center">
                     <div className="font-bold text-lg text-gray-700 underline">{selectedConversation.name}</div>
                   </div>
                   
                   {/* Page Name in Light Gray */}
                   <div className="text-center">
                     <div className="text-sm text-gray-500">{selectedConversation.page_name || selectedConversation.platform}</div>
                   </div>
                 </div>
                                 <div className="space-y-3 text-sm">
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Status</span>
                     <span className={cn("flex items-center gap-1", isConnected ? "text-green-600" : "text-red-500")}>{isConnected ? "Online" : "Offline"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Platform</span>
                     <span className="capitalize">{selectedConversation.platform || "-"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Last seen</span>
                     <span>{selectedConversation.time || "-"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Email</span>
                     <span className="truncate max-w-[55%] text-right">{(contactDetails as any)?.email || "-"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Phone</span>
                     <span>{(contactDetails as any)?.phone || "-"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Local time</span>
                     <span>{(contactDetails as any)?.localTime || "-"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Contact</span>
                     <span className="truncate max-w-[55%] text-right">{(contactDetails as any)?.contact || selectedConversation.sender_name || "-"}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Country</span>
                     <span>{(contactDetails as any)?.country || "-"}</span>
                   </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <img src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1754993129/no_data.14591486_tv48zw.svg" alt="No chats" className="h-48 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No conversations</h3>
                <p className="text-muted-foreground">When a chat arrives it will appear here automatically.</p>
              </div>
            </div>
          )}
        </div>
        {leftSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setLeftSidebarOpen(false)} />}
      </div>
    </TooltipProvider>
  )
}


