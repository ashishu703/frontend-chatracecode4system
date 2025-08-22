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
import { getChannelIcon, getDefaultUserIcon, generateInitials, isValidAvatar } from "./utils"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  const { socket, isConnected, socketEvents } = useSocket()
  const [assignedTo, setAssignedTo] = React.useState<string | undefined>(undefined)
  const [favorite, setFavorite] = React.useState<Record<string, boolean>>({})
  const [isDisabledMap, setIsDisabledMap] = React.useState<Record<string, boolean>>({})
  const [isBlockedMap, setIsBlockedMap] = React.useState<Record<string, boolean>>({})
  const [statusMap, setStatusMap] = React.useState<Record<string, Conversation["status"]>>({})
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(15 * 60)
  const [unreadMap, setUnreadMap] = React.useState<Record<string, number>>({})
  const users = React.useMemo(() => [{ id: "me", name: "Me", online: true }, { id: "agent-1", name: "Agent 1", online: false }], [])
  
  // Pagination state for messages
  const [currentPage, setCurrentPage] = React.useState(1)
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true)
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = React.useState(false)
  const PAGE_SIZE = 10 

  const parseJsonIfNeeded = React.useCallback((value: any) => {
    if (typeof value === "string" && value.trim().startsWith("{")) {
      try { return JSON.parse(value) } catch { return value }
    }
    return value
  }, [])

  const deriveContent = React.useCallback((raw: any) => {
    const body: any = parseJsonIfNeeded(raw?.body ?? raw)
    const base = { text: "", type: (raw?.type || "text") as Message["type"], body: undefined as any }
    if (typeof raw?.message === "string") base.text = raw.message
    if (typeof body === "string") base.text = body
    if (typeof body === "object" && body) {
      const text = body.text || body.caption || ""
      const url = body.attachment_url || body.attchment_url || body.video_url || body.audio_url || body.document_url || body.file_url || body.url || body.image_url || ""
      const ext = (u: string) => {
        if (!u || typeof u !== 'string') return ""
        const clean = u.split('?')[0].split('#')[0]
        const idx = clean.lastIndexOf('.')
        return idx >= 0 ? clean.substring(idx + 1).toLowerCase() : ""
      }
      // Images
      const extension = ext(url)
      const isImageExt = ["jpg","jpeg","png","webp","bmp","tiff"].includes(extension)
      const isGifExt = extension === "gif"
      const isVideoExt = ["mp4","webm","m4v","mov","3gp","mkv"].includes(extension)
      const isAudioExt = ["mp3","wav","ogg","m4a","aac"].includes(extension)
      const isDocExt = ["pdf","doc","docx","ppt","pptx","xls","xlsx","csv","txt"].includes(extension)
      if (url && (isImageExt || (!extension && (body.image_url || body.type === 'image')))) {
        return { text, type: "image" as const, body: { url, caption: text } }
      }
      // Video
      if ((url && isVideoExt) || body.video_url || (body.url && body.type === "video")) {
        return { text, type: "video" as const, body: { url: url || body.video_url || body.url, caption: text } }
      }
      // Audio
      if ((url && isAudioExt) || body.audio_url || (body.url && body.type === "audio")) {
        return { text, type: "audio" as const, body: { url: url || body.audio_url || body.url, caption: text } }
      }
      // Document/File
      if ((url && isDocExt) || body.document_url || body.file_url || (body.url && body.type === "document")) {
        return { text: text || body.filename || "Document", type: "file" as const, body: { url: url || body.document_url || body.file_url || body.url, caption: text, filename: body.filename || "Document", filesize: body.filesize || "" } }
      }
      // Carousel
      if (Array.isArray(body.elements)) {
        return { text, type: "carousel" as const, body: { elements: body.elements, text } }
      }
      // GIF
      if (isGifExt || body.gif_url || (body.url && body.type === "gif")) {
        return { text, type: "gif" as const, body: { url: url || body.gif_url || body.url, caption: text } }
      }
      return { text: text || "", type: (raw?.type || "text") as Message["type"], body }
    }
    // URL-only string (e.g., emoji image link)
    if (typeof base.text === "string") {
      const m = base.text.match(/(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp))/i)
      if (m) return { text: base.text.replace(m[0], "").trim(), type: "image" as const, body: { url: m[1], caption: base.text.replace(m[0], "").trim() } }
    }
    return base
  }, [parseJsonIfNeeded])

  const previewText = React.useCallback((raw: any): string => {
    const c = deriveContent(raw)
    if (c.text) return c.text
    if (c.type === "image") return "Image"
    if (c.type === "video") return "Video"
    if (c.type === "audio") return "Audio"
    if (c.type === "file") return typeof c.body?.filename === "string" ? c.body.filename : "Document"
    if (c.type === "gif") return "GIF"
    if (c.type === "carousel") return "Carousel"
    return ""
  }, [deriveContent])

  // Monitor message changes
  React.useEffect(() => {
    if (messages.length > 100) {
      console.log("High message count:", messages.length)
    }
  }, [messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  React.useEffect(() => {
    if (autoScrollNextRef.current) {
      scrollToBottom()
    }
  }, [messages])

  React.useEffect(() => {
    setRemainingSeconds((s) => s)
  }, [])

  React.useEffect(() => {
    if (!socketEvents) return
    const handleNewChat = (chat: any) => {
      const newConversation: Conversation = {
        id: chat.id || chat.chat_id,
        chat_id: chat.chat_id || chat.id,
        name: chat.sender_name || chat.name || "Unknown",
        avatar: chat.avatar || chat.profile_pic || "/placeholder.svg",
        lastMessage: previewText(chat.lastMessage || { body: { text: chat.last_message_body } }),
        platform: chat.account?.platform || chat.platform || chat.channel || "messenger",
        time: formatTime(chat.lastMessage?.timestamp || chat.last_message_time || chat.time || chat.createdAt),
        page_name: chat.page?.name || chat.page_name,
        page_icon: chat.page?.icon || chat.page_icon,
        channel_icon: chat.channel_icon,
        unread_count: chat.unread_count || 0,
        sender_name: chat.sender_name,
        last_message_time: chat.lastMessage?.timestamp || chat.last_message_time,
        last_message_body: previewText(chat.lastMessage || { body: { text: chat.last_message_body } }),
        last_message_timestamp: chat.last_message_timestamp || chat.lastMessage?.timestamp,
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
      const msgChatId = String(message.chat_id)
      const route = (message.route || '').toString().toUpperCase()
      const isSelectedForMsg = !!selectedConversation && (
        String(selectedConversation.id) === msgChatId ||
        String(selectedConversation.chat_id) === msgChatId
      )
      if (route === 'INCOMING' && !isSelectedForMsg) {
        setUnreadMap((prev) => ({ ...prev, [msgChatId]: (prev[msgChatId] || 0) + 1 }))
      }
      setConversations((prev) =>
        prev.map((chat) => {
          const convIds = [String(chat.chat_id), String(chat.id)]
          if (convIds.includes(msgChatId)) {
            const pv = previewText(message)
            return {
              ...chat,
              lastMessage: pv,
              last_message_body: pv,
              last_message_time: message.timestamp || message.createdAt,
              time: formatTime(message.timestamp || message.createdAt),
              // reflect unread immediately in UI
              unread_count: route === 'INCOMING' && !isSelectedForMsg ? (chat.unread_count || 0) + 1 : chat.unread_count,
              last_message_timestamp: message.timestamp || message.createdAt,
            }
          }
          return chat
        })
      )
    }
    const handleConversationsUpdated = (chats: any[]) => {
      if (!Array.isArray(chats)) return
      setConversations((prev) => {
        const mapped = chats.map((chat: any) => {
          const id = String(chat.id || chat.chat_id)
          const existing = prev.find((c) => String(c.id) === id || String(c.chat_id) === id)
          const isSelected = !!selectedConversation && (String(selectedConversation.id) === id || String(selectedConversation.chat_id) === id)
          // Hard rule: never take unread from server here; prefer local unreadMap unless selected
          const mergedUnread = isSelected ? 0 : (unreadMap[id] ?? existing?.unread_count ?? 0)
          return {
            id: chat.id || chat.chat_id,
            chat_id: chat.chat_id || chat.id,
            name: chat.sender_name || chat.page?.name || chat.name || "Unknown",
            avatar: chat.avatar || chat.profile_pic || "/placeholder.svg",
            lastMessage: previewText(chat.lastMessage || { body: { text: chat.last_message_body || chat.lastMessage } }),
            platform: chat.account?.platform || chat.platform || chat.channel || "messenger",
            time: formatTime(chat.last_message_timestamp || chat.lastMessage?.timestamp || chat.last_message_time || chat.time || chat.createdAt),
            page_name: chat.page?.name || chat.page_name,
            page_icon: chat.page?.icon || chat.page_icon,
            channel_icon: chat.channel_icon,
            unread_count: mergedUnread,
            sender_name: chat.sender_name,
            sender_id: chat.sender_id || chat.chat_id,
            last_message_time: chat.lastMessage?.timestamp || chat.last_message_time,
            last_message_body: previewText(chat.lastMessage || { body: { text: chat.last_message_body } }),
            status: statusMap[chat.id || chat.chat_id] || existing?.status || "open",
            favorite: !!favorite[chat.id || chat.chat_id],
            isDisabled: !!isDisabledMap[chat.id || chat.chat_id],
            isBlocked: !!isBlockedMap[chat.id || chat.chat_id],
            isActive: typeof chat.isActive === 'boolean' ? chat.isActive : (existing?.isActive ?? true),
            last_message_timestamp: chat.last_message_timestamp || chat.lastMessage?.timestamp,
          } as Conversation
        })
        setFilteredConversations(mapped)
        return mapped
      })
    }
    const handleChatsUpdated = (chats: any[]) => {
      if (!Array.isArray(chats)) return
      setConversations((prev) => prev.map((chat) => {
        const updated = chats.find((c: any) => String(c.id || c.chat_id) === String(chat.id || chat.chat_id))
        if (!updated) return chat
        const id = String(updated.id || updated.chat_id)
        const isSelected = !!selectedConversation && (String(selectedConversation.id) === id || String(selectedConversation.chat_id) === id)
        return {
          ...chat,
          ...updated,
          // Keep local unread; prefer unreadMap; only clear when selected
          unread_count: isSelected ? 0 : (unreadMap[id] ?? chat.unread_count ?? 0),
        }
      }))
    }
    // Subscribe to centralized socket event bus
    socketEvents.on('conversationsUpdated', handleConversationsUpdated)
    socketEvents.on('chatsUpdated', handleChatsUpdated)
    socketEvents.on('newMessage', handleNewMessage)
    return () => {
      socketEvents.off('conversationsUpdated', handleConversationsUpdated)
      socketEvents.off('chatsUpdated', handleChatsUpdated)
      socketEvents.off('newMessage', handleNewMessage)
    }
  }, [socketEvents, unreadMap, selectedConversation])

  React.useEffect(() => {
    let isMounted = true
    const loadChats = async () => {
      setIsLoading(true)
      const chats = await fetchChats()
      if (!isMounted) return
      const conversationsData = chats.map((chat: any) => ({
        id: chat.id || chat.chat_id,
        chat_id: chat.chat_id || chat.id,
        name: chat.sender_name || chat.page?.name || chat.name || "Unknown",
        avatar: chat.avatar || chat.profile_pic || "/placeholder.svg",
        lastMessage: previewText(chat.lastMessage || { body: { text: chat.last_message_body || chat.lastMessage } }),
        platform: chat.account?.platform || chat.platform || chat.channel || "messenger",
        time: formatTime(chat.last_message_timestamp || chat.lastMessage?.timestamp || chat.last_message_time || chat.time || chat.createdAt),
        page_name: chat.page?.name || chat.page_name,
        page_icon: chat.page?.icon || chat.page_icon,
        channel_icon: chat.channel_icon,
        unread_count: chat.unread_count || 0,
        sender_name: chat.sender_name,
        sender_id: chat.sender_id || chat.chat_id, 
        last_message_time: chat.lastMessage?.timestamp || chat.last_message_time,
        last_message_body: previewText(chat.lastMessage || { body: { text: chat.last_message_body } }),
        status: statusMap[chat.id || chat.chat_id] || "open",
        favorite: !!favorite[chat.id || chat.chat_id],
        isDisabled: !!isDisabledMap[chat.id || chat.chat_id],
        isBlocked: !!isBlockedMap[chat.id || chat.chat_id],
        isActive: typeof chat.isActive === 'boolean' ? chat.isActive : true,
        last_message_timestamp: chat.last_message_timestamp || chat.lastMessage?.timestamp,
      })) as Conversation[]
      setConversations(conversationsData)
      setFilteredConversations(conversationsData)
      // seed unreadMap from initial payload once
      setUnreadMap((prev) => {
        const next = { ...prev }
        conversationsData.forEach((c) => {
          const id = String(c.id || c.chat_id)
          if (next[id] === undefined) next[id] = c.unread_count || 0
        })
        return next
      })
      // Do not auto-select a conversation; user must open manually to mark as read
      
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
    
    try {
      const [msgsByConvId, msgsByChatId] = await Promise.all([
        fetchMessagesForChat(String(selectedConversation.id), page, PAGE_SIZE),
        fetchMessagesForChat(String(selectedConversation.chat_id), page, PAGE_SIZE),
      ])
      const msgs = [...(Array.isArray(msgsByConvId) ? msgsByConvId : []), ...(Array.isArray(msgsByChatId) ? msgsByChatId : [])]
      
      if (!Array.isArray(msgs) || msgs.length === 0) {
        if (page === 1) setMessages([])
        setHasMoreMessages(false)
        setContactDetails({ ...(selectedConversation as any) })
        setIsLoadingMessages(false)
        return
      }
      
      const messagesData = msgs.map((msg: any) => {
        const content = deriveContent(msg)
        let messageText = content.text
        let messageType = content.type
        let messageBody = content.body
        let buttons: any[] = []
        if (msg.type === "interactive" && msg.body && (msg.body as any).interactive) {
          const interactive = (msg.body as any).interactive
          if (interactive.type === "button_reply" && interactive.button_reply) {
            messageText = interactive.button_reply.title || messageText
          } else if (interactive.type === "button" && interactive.button) {
            buttons = interactive.button.buttons || []
          }
        }
        
        const rawTimestamp = msg.timestamp || msg.createdAt || msg.created_at
        const rawTsMs = toMs(rawTimestamp)
        const formattedTimestamp = formatTime(rawTimestamp)
      
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
      
      // De-duplicate by id
      const deduped = messagesData.filter((m, idx, arr) => idx === arr.findIndex(x => x.id === m.id))
      const sortedMessages = deduped.sort((a: any, b: any) => new Date(a.rawTimestamp || 0).getTime() - new Date(b.rawTimestamp || 0).getTime())
      
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
      toast({ title: "Failed to load messages", description: "Please try again", variant: "destructive" })
    } finally {
      setIsLoadingMessages(false)
      if (!append) autoScrollNextRef.current = true
    }
  }, [selectedConversation, PAGE_SIZE])

  const manualRefreshMessages = React.useCallback(async () => {
    if (!selectedConversation) return
    setCurrentPage(1)
    setHasMoreMessages(true)
    await fetchMessages(1, false)
  }, [selectedConversation, fetchMessages])

  // Preflight: refresh chat window info from server before sending
  const refreshSelectedConversationFromServer = React.useCallback(async (): Promise<void> => {
    try {
      const chats = await fetchChats()
      const match = chats.find((c: any) => (String(c.id) === String(selectedConversation?.id) || String(c.chat_id) === String(selectedConversation?.chat_id)))
      if (match) {
        setSelectedConversation((prev) => prev ? ({
          ...prev,
          platform: match.platform || prev.platform,
          last_message_timestamp: match.last_message_timestamp || match.lastMessage?.timestamp || prev.last_message_timestamp,
        } as any) : prev)
        // Defer timer reset to next tick so hook dependencies are initialized
        setTimeout(() => {
          resetTimerFromTimestamp(match.platform || selectedConversation?.platform || "", match.last_message_timestamp || match.lastMessage?.timestamp)
        }, 0)
      }
    } catch (e) {
      // Ignore preflight errors
    }
  }, [selectedConversation, /* intentionally not including resetTimerFromTimestamp to avoid order issue */])

  // Load older messages function
  const loadOlderMessages = React.useCallback(async () => {
    if (!selectedConversation || !hasMoreMessages || isLoadingOlderMessages) return
    setIsLoadingOlderMessages(true)
    try {
      autoScrollNextRef.current = false
      await fetchMessages(currentPage + 1, true)
    } finally {
      setIsLoadingOlderMessages(false)
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
    const p = (platform || "").toLowerCase()
    if (p.includes("whatsapp")) return 24 * 60 * 60
    if (p.includes("instagram") || p.includes("messenger") || p === "facebook") return 7 * 24 * 60 * 60
    return 7 * 24 * 60 * 60
  }, [])

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
    // Timestamp comes from API as unix seconds (e.g., 1755328703). Normalize strictly from that.
    let lastTsMs: number | null = null
    if (timestamp === undefined || timestamp === null || timestamp === "") {
      lastTsMs = null
    } else if (typeof timestamp === 'number') {
      // Treat numbers <= 1e12 as seconds
      lastTsMs = timestamp > 1e12 ? timestamp : timestamp * 1000
    } else if (typeof timestamp === 'string') {
      if (/^\d+$/.test(timestamp)) {
        const asNum = parseInt(timestamp, 10)
        lastTsMs = asNum > 1e12 ? asNum : asNum * 1000
      } else {
        // If ISO sneaks in, still handle it
        const parsed = new Date(timestamp).getTime()
        lastTsMs = Number.isNaN(parsed) ? null : parsed
      }
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
      // Reset timer based on platform and last_message_timestamp from API
      resetTimerFromTimestamp(selectedConversation.platform || "", selectedConversation.last_message_timestamp)
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
    if (!socketEvents || !selectedConversation) return
    const handleNewMessage = (msg: any) => {
      const msgIds = [msg?.chat_id, (msg as any)?.chatId, (msg as any)?.chat?.id]
        .filter((v) => v !== undefined && v !== null)
        .map((v) => String(v))
      const selIds = [selectedConversation.id, selectedConversation.chat_id, (selectedConversation as any).sender_id]
        .filter((v) => v !== undefined && v !== null)
        .map((v) => String(v))
      const matches = msgIds.some((id) => selIds.includes(id))
      if (matches) {
        const route = (msg.route || '').toString().toUpperCase()
        const rawTsMs = toMs(msg.timestamp || (msg as any).createdAt || new Date().toISOString())
        const normalized = deriveContent(msg)
        const text = normalized.text
        const body = normalized.body
        const newMessage: Message = {
          id: msg.id || `socket-${Date.now()}-${Math.random()}`, // Ensure unique ID
          sender: route === "OUTGOING" ? "user" : "other",
          message: text,
          type: (normalized.type || "text") as any,
          timestamp: formatTime(msg.timestamp || new Date().toISOString()),
          rawTimestamp: rawTsMs,
          status: (msg.status || "") as any,
          body: body,
          reactions: msg.reactions || [],
          buttons: msg.buttons || [],
        }
        
        setMessages((prev) => {
          // Simple duplicate check by ID
          if (prev.some((m) => m.id === newMessage.id)) return prev
          
          // Add and sort
          const updated = [...prev, newMessage]
          return updated.sort((a, b) => new Date(a.rawTimestamp || 0).getTime() - new Date(b.rawTimestamp || 0).getTime())
        })
        
        // Reset timer on new incoming message
        resetTimerFromTimestamp(selectedConversation.platform || "", msg.timestamp)
      }
    }
    const handleUpdateDelivery = (msg: any) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: msg.status } : m)))
    }
    const handleNewReaction = (payload: any) => {
      // payload may contain message_id and reaction
      const { message_id, reaction } = payload || {}
      if (!message_id || !reaction) return
      setMessages((prev) => prev.map((m) => (m.id === message_id ? { ...m, reactions: [...(m.reactions || []), reaction] } : m)))
    }
    socketEvents.on('newMessage', handleNewMessage)
    socketEvents.on('deliveryStatusUpdated', handleUpdateDelivery)
    socketEvents.on('newReaction', handleNewReaction)
    return () => {
      socketEvents.off('newMessage', handleNewMessage)
      socketEvents.off('deliveryStatusUpdated', handleUpdateDelivery)
      socketEvents.off('newReaction', handleNewReaction)
    }
  }, [socketEvents, selectedConversation, resetTimerFromTimestamp])

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
    // Preflight refresh from server to avoid mismatch with backend window
    await refreshSelectedConversationFromServer()
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
        // Try to parse backend error to detect expiration and sync UI
        try {
          const errText = await response.text()
          if (errText && /expired/i.test(errText)) {
            setRemainingSeconds(0)
            toast({ title: "Session expired", description: "Please send a Meta-approved template to continue", variant: "destructive" })
            return
          }
        } catch {}
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
          setSelectedConversation={(c) => {
            // Reset unread count for this conversation when opened
            setConversations((prev) => prev.map((chat) => {
              const match = (String(chat.id) === String(c.id)) || (String(chat.chat_id) === String(c.chat_id))
              return match ? { ...chat, unread_count: 0 } : chat
            }))
            setUnreadMap((prev) => {
              const id = String(c.id || c.chat_id)
              const next = { ...prev }
              next[id] = 0
              return next
            })
            setSelectedConversation(c)
          }}
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
                isActive={true}
              />
              <Composer
                message={message}
                setMessage={setMessage}
                onSend={handleSendMessage}
                onFilePick={handleFileUpload}
                onImagePick={handleImageUpload}
                fileInputRef={fileInputRef}
                imageInputRef={imageInputRef}
                disabled={!(remainingSeconds > 0)}
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
                     <Avatar className="h-20 w-20">
                       {isValidAvatar(selectedConversation.avatar) ? (
                         <AvatarImage 
                           src={selectedConversation.avatar} 
                           alt={selectedConversation.name}
                           onError={(e) => {
                             // Hide the image element to show fallback
                             e.currentTarget.style.display = 'none'
                           }}
                         />
                       ) : null}
                       <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-bold">
                         {generateInitials(selectedConversation.name)}
                       </AvatarFallback>
                     </Avatar>
                     {selectedConversation.platform && (
                       <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                         {getChannelIcon(selectedConversation.platform)}
                       </div>
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


