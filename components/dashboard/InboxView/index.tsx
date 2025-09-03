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
  const [isChatSessionActive, setIsChatSessionActive] = React.useState(true)
  const [unreadMap, setUnreadMap] = React.useState<Record<string, number>>({})
  const users = React.useMemo(() => [{ id: "me", name: "Me", online: true }, { id: "agent-1", name: "Agent 1", online: false }], [])

  // CRITICAL FIX: Load unread counts only once at startup
  const [unreadMapLoaded, setUnreadMapLoaded] = React.useState(false)
  
  React.useEffect(() => {
    if (!unreadMapLoaded) {
      try {
        const raw = sessionStorage.getItem("inbox:unreadMap")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') {
            setUnreadMap(parsed)
          }
        }
      } catch {}
      setUnreadMapLoaded(true)
    }
  }, [unreadMapLoaded])

  // CRITICAL FIX: Save unread counts to storage only when unread map changes
  React.useEffect(() => {
    if (unreadMapLoaded) {
      try { 
        sessionStorage.setItem("inbox:unreadMap", JSON.stringify(unreadMap))
      } catch {}
    }
  }, [unreadMap, unreadMapLoaded])
  
  // Pagination state for messages
  const [currentPage, setCurrentPage] = React.useState(1)
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true)
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = React.useState(false)
  const PAGE_SIZE = 10 

  // CRITICAL FIX: Memoize helper functions to prevent re-renders
  const sortConversations = React.useCallback((conversations: Conversation[]) => {
    return [...conversations].sort((a: any, b: any) => {
      const aUnread = (a.unread_count || 0) > 0
      const bUnread = (b.unread_count || 0) > 0
      if (aUnread && !bUnread) return -1
      if (!aUnread && bUnread) return 1
      
      const aTime = new Date(a.last_message_timestamp || 0).getTime()
      const bTime = new Date(b.last_message_timestamp || 0).getTime()
      return bTime - aTime
    })
  }, [])

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
      const extension = ext(url)
      const isImageExt = ["jpg","jpeg","png","webp","bmp","tiff"].includes(extension)
      const isGifExt = extension === "gif"
      const isVideoExt = ["mp4","webm","m4v","mov","3gp","mkv"].includes(extension)
      const isAudioExt = ["mp3","wav","ogg","m4a","aac"].includes(extension)
      const isDocExt = ["pdf","doc","docx","ppt","pptx","xls","xlsx","csv","txt"].includes(extension)
      
      // CRITICAL FIX: Handle Instagram message types properly
      // Check if we have a URL and determine type from extension or body type
      if (url) {
        if (isImageExt || (!extension && (body.image_url || body.type === 'image' || raw?.type === 'image'))) {
          return { text, type: "image" as const, body: { url, caption: text } }
        }
        if (isVideoExt || body.video_url || (body.url && body.type === "video") || raw?.type === 'video') {
          return { text, type: "video" as const, body: { url: url || body.video_url || body.url, caption: text } }
        }
        if (isAudioExt || body.audio_url || (body.url && body.type === "audio") || raw?.type === 'audio') {
          return { text, type: "audio" as const, body: { url: url || body.audio_url || body.url, caption: text } }
        }
        if (isDocExt || body.document_url || body.file_url || (body.url && body.type === "document") || raw?.type === 'file' || raw?.type === 'document') {
          return { text: text || body.filename || "Document", type: "file" as const, body: { url: url || body.document_url || body.file_url || body.url, caption: text, filename: body.filename || "Document", filesize: body.filesize || "" } }
        }
        if (isGifExt || body.gif_url || (body.url && body.type === "gif") || raw?.type === 'gif') {
          return { text, type: "gif" as const, body: { url: url || body.gif_url || body.url, caption: text } }
        }
      }
      
      // CRITICAL FIX: Handle Instagram message types when no URL but type is specified
      if (raw?.type && raw.type !== 'text') {
        if (raw.type === 'image' || raw.type === 'photo') {
          return { text, type: "image" as const, body: { url: url || "", caption: text } }
        }
        if (raw.type === 'video') {
          return { text, type: "video" as const, body: { url: url || "", caption: text } }
        }
        if (raw.type === 'audio' || raw.type === 'voice') {
          return { text, type: "audio" as const, body: { url: url || "", caption: text } }
        }
        if (raw.type === 'file' || raw.type === 'document') {
          return { text: text || "Document", type: "file" as const, body: { url: url || "", caption: text, filename: "Document", filesize: "" } }
        }
      }
      
      // CRITICAL FIX: Handle Instagram messages with type detection from body
      if (body.type && body.type !== 'text') {
        if (body.type === 'image' || body.type === 'photo') {
          return { text, type: "image" as const, body: { url: url || "", caption: text } }
        }
        if (body.type === 'video') {
          return { text, type: "video" as const, body: { url: url || "", caption: text } }
        }
        if (body.type === 'audio' || body.type === 'voice') {
          return { text, type: "audio" as const, body: { url: url || "", caption: text } }
        }
        if (body.type === 'file' || body.type === 'document') {
          return { text: text || "Document", type: "file" as const, body: { url: url || "", caption: text, filename: "Document", filesize: "" } }
        }
      }
      
      // CRITICAL FIX: Handle Instagram messages with attchment_url (typo in backend)
      if (body.attchment_url && raw?.type && raw.type !== 'text') {
        const attachmentUrl = body.attchment_url
        if (raw.type === 'image' || raw.type === 'photo') {
          return { text, type: "image" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (raw.type === 'video') {
          return { text, type: "video" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (raw.type === 'audio' || raw.type === 'voice') {
          return { text, type: "audio" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (raw.type === 'file' || raw.type === 'document') {
          return { text: text || "Document", type: "file" as const, body: { url: url || attachmentUrl, caption: text, filename: "Document", filesize: "" } }
        }
      }
      
      // CRITICAL FIX: Handle Instagram messages with attachment_url (corrected field)
      if (body.attachment_url && raw?.type && raw.type !== 'text') {
        const attachmentUrl = body.attachment_url
        if (raw.type === 'image' || raw.type === 'photo') {
          return { text, type: "image" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (raw.type === 'video') {
          return { text, type: "video" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (raw.type === 'audio' || raw.type === 'voice') {
          return { text, type: "audio" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (raw.type === 'file' || raw.type === 'document') {
          return { text: text || "Document", type: "file" as const, body: { url: url || attachmentUrl, caption: text, filename: "Document", filesize: "" } }
        }
      }
      
      // CRITICAL FIX: Handle Instagram messages with attachment_url when no type specified
      if (body.attachment_url && !raw?.type) {
        const attachmentUrl = body.attachment_url
        // Try to determine type from URL extension
        const ext = attachmentUrl.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif'].includes(ext || '')) {
          return { text, type: "image" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (['mp4', 'webm', 'm4v', 'mov', '3gp', 'mkv'].includes(ext || '')) {
          return { text, type: "video" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext || '')) {
          return { text, type: "audio" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt'].includes(ext || '')) {
          return { text: text || "Document", type: "file" as const, body: { url: attachmentUrl, caption: text, filename: "Document", filesize: "" } }
        }
      }
      
      // CRITICAL FIX: Handle Instagram messages with attchment_url when no type specified
      if (body.attchment_url && !raw?.type) {
        const attachmentUrl = body.attchment_url
        // Try to determine type from URL extension
        const ext = attachmentUrl.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif'].includes(ext || '')) {
          return { text, type: "image" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (['mp4', 'webm', 'm4v', 'mov', '3gp', 'mkv'].includes(ext || '')) {
          return { text, type: "video" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext || '')) {
          return { text, type: "audio" as const, body: { url: attachmentUrl, caption: text } }
        }
        if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt'].includes(ext || '')) {
          return { text: text || "Document", type: "file" as const, body: { url: attachmentUrl, caption: text, filename: "Document", filesize: "" } }
        }
      }
      
      if (Array.isArray(body.elements)) {
        return { text, type: "carousel" as const, body: { elements: body.elements, text } }
      }
      
      return { text: text || "", type: (raw?.type || "text") as Message["type"], body }
    }
    
    if (typeof base.text === "string") {
      const m = base.text.match(/(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp))/i)
      if (m) return { text: base.text.replace(m[0], "").trim(), type: "image" as const, body: { url: m[1], caption: base.text.replace(m[0], "").trim() } }
    }
    return base
  }, [parseJsonIfNeeded])

  const previewText = React.useCallback((raw: any) => {
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

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  React.useEffect(() => {
    if (autoScrollNextRef.current) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // CRITICAL FIX: Optimize socket event handlers with stable references
  const handleNewMessage = React.useCallback((message: any) => {
    const msgChatId = String(message.chat_id)
    const route = (message.route || '').toString().toUpperCase()
    const isSelectedForMsg = selectedConversation && (
      String(selectedConversation.id) === msgChatId ||
      String(selectedConversation.chat_id) === msgChatId
    )
    
    // Only increment unread for incoming messages on non-selected chats
    if (route === 'INCOMING' && !isSelectedForMsg) {
      setUnreadMap((prev) => ({
        ...prev,
        [msgChatId]: (prev[msgChatId] || 0) + 1
      }))
    }
    
    // Update conversations list
    setConversations((prev) => {
      const next = prev.map((chat) => {
        const convIds = [String(chat.chat_id), String(chat.id)]
        if (convIds.includes(msgChatId)) {
          const pv = previewText(message)
          return {
            ...chat,
            lastMessage: pv,
            last_message_body: pv,
            last_message_time: message.timestamp || message.createdAt,
            time: formatTime(message.timestamp || message.createdAt),
            unread_count: route === 'INCOMING' && !isSelectedForMsg 
              ? (chat.unread_count || 0) + 1 
              : (chat.unread_count || 0),
            last_message_timestamp: message.timestamp || message.createdAt,
          }
        }
        return chat
      })
      return sortConversations(next)
    })
    
    // CRITICAL FIX: Only update messages if this message belongs to the selected conversation
    if (isSelectedForMsg) {
      const rawTsMs = toMs(message.timestamp || message.createdAt || new Date().toISOString())
      const normalized = deriveContent(message)
      
      const newMessage: Message = {
        id: message.id || `socket-${Date.now()}-${Math.random()}`,
        sender: route === "OUTGOING" ? "user" : "other",
        message: normalized.text,
        type: (normalized.type || "text") as any,
        timestamp: formatTime(message.timestamp || new Date().toISOString()),
        rawTimestamp: rawTsMs,
        status: (message.status || "") as any,
        body: normalized.body,
        reactions: message.reactions || [],
        buttons: message.buttons || [],
      }
      
      setMessages((prev) => {
        // Check for duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev
        
        // Add and sort
        const updated = [...prev, newMessage]
        return updated.sort((a, b) => 
          new Date(a.rawTimestamp || 0).getTime() - new Date(b.rawTimestamp || 0).getTime()
        )
      })
      
      // Update the selected conversation's last message timestamp for the timer
      if (selectedConversation) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          last_message_timestamp: message.timestamp || message.createdAt || new Date().toISOString()
        } : prev)
      }
    }
  }, [selectedConversation, previewText, formatTime, sortConversations, toMs, deriveContent])

  const handleChatUpdate = React.useCallback((updatedChat: any) => {
    setConversations((prev) => {
      const next = prev.map((chat) => 
        chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
      )
      return sortConversations(next)
    })
  }, [sortConversations])

  const handleConversationsUpdated = React.useCallback((chats: any[]) => {
    if (!Array.isArray(chats)) return
    
    setConversations((prev) => {
      const mapped = chats.map((chat: any) => {
        const id = String(chat.id || chat.chat_id)
        const existing = prev.find((c) => String(c.id) === id || String(c.chat_id) === id)
        const isSelected = selectedConversation && (
          String(selectedConversation.id) === id || 
          String(selectedConversation.chat_id) === id
        )
        
        const serverUnread = chat.unread_count || 0
        const currentUnread = unreadMap[id] ?? existing?.unread_count ?? 0
        const mergedUnread = isSelected ? 0 : Math.max(serverUnread, currentUnread)
        
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
      
      const sorted = sortConversations(mapped)
      setFilteredConversations(sorted)
      return sorted
    })
  }, [selectedConversation, unreadMap, previewText, formatTime, statusMap, favorite, isDisabledMap, isBlockedMap, sortConversations])

  // CRITICAL FIX: Stable socket event subscriptions
  React.useEffect(() => {
    if (!socketEvents) return
    
    socketEvents.on('newMessage', handleNewMessage)
    socketEvents.on('chatUpdate', handleChatUpdate)
    socketEvents.on('conversationsUpdated', handleConversationsUpdated)
    
    return () => {
      socketEvents.off('newMessage', handleNewMessage)
      socketEvents.off('chatUpdate', handleChatUpdate)
      socketEvents.off('conversationsUpdated', handleConversationsUpdated)
    }
  }, [socketEvents, handleNewMessage, handleChatUpdate, handleConversationsUpdated])

  // Load chats effect - only runs once when component mounts
  React.useEffect(() => {
    if (!unreadMapLoaded) return
    
    let isMounted = true
    const loadChats = async () => {
      setIsLoading(true)
      
      try {
        const chats = await fetchChats()
        if (!isMounted) return
        
        const conversationsData = chats.map((chat: any) => {
          const lastMessageTime = chat.lastMessage?.timestamp || chat.last_message_time || chat.time || chat.createdAt || chat.updatedAt
          const lastMessageTimestamp = chat.last_message_timestamp || lastMessageTime
          const chatId = String(chat.id || chat.chat_id)
          const preservedUnreadCount = unreadMap[chatId] ?? chat.unread_count ?? 0
          
          return {
            id: chat.id || chat.chat_id,
            chat_id: chat.chat_id || chat.id,
            name: chat.sender_name || chat.page?.name || chat.name || "Unknown",
            avatar: chat.avatar || chat.profile_pic || "/placeholder.svg",
            lastMessage: previewText(chat.lastMessage || { body: { text: chat.last_message_body || chat.lastMessage } }),
            platform: chat.account?.platform || chat.platform || chat.channel || "messenger",
            time: formatTime(lastMessageTimestamp),
            page_name: chat.page?.name || chat.page_name,
            page_icon: chat.page?.icon || chat.page_icon,
            channel_icon: chat.channel_icon,
            unread_count: preservedUnreadCount,
            sender_name: chat.sender_name,
            sender_id: chat.sender_id || chat.chat_id, 
            last_message_time: lastMessageTime,
            last_message_body: previewText(chat.lastMessage || { body: { text: chat.last_message_body } }),
            status: statusMap[chat.id || chat.chat_id] || "open",
            favorite: !!favorite[chat.id || chat.chat_id],
            isDisabled: !!isDisabledMap[chat.id || chat.chat_id],
            isBlocked: !!isBlockedMap[chat.id || chat.chat_id],
            isActive: typeof chat.isActive === 'boolean' ? chat.isActive : true,
            last_message_timestamp: lastMessageTimestamp,
          }
        }) as Conversation[]
        
        const sortedConversations = sortConversations(conversationsData)
        setConversations(sortedConversations)
        setFilteredConversations(sortedConversations)
        setCurrentPage(1)
        setHasMoreMessages(true)
        
      } catch (error) {
        setConversations([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadChats()
    return () => {
      isMounted = false
    }
  }, [unreadMapLoaded]) // CRITICAL: Removed dependencies that were causing reloads

  // Search effect
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(sortConversations(conversations))
    } else {
      const filtered = conversations.filter(
        (conv) =>
          conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof conv.lastMessage === "string" ? conv.lastMessage : "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.platform.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredConversations(sortConversations(filtered))
    }
  }, [searchQuery, conversations, sortConversations])

  // CRITICAL FIX: Memoize fetchMessages to prevent unnecessary calls
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
        
        return {
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
        } as Message
      })
      
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
        autoScrollNextRef.current = true
        setMessages(sortedMessages)
      }
      
      setHasMoreMessages((msgsByConvId?.length === PAGE_SIZE) || (msgsByChatId?.length === PAGE_SIZE))
      setCurrentPage(page)
      setContactDetails({ ...(selectedConversation as any) })
      
    } catch (error) {
      toast({ title: "Failed to load messages", description: "Please try again", variant: "destructive" })
    } finally {
      setIsLoadingMessages(false)
      if (!append) autoScrollNextRef.current = true
    }
  }, [selectedConversation, PAGE_SIZE, deriveContent, formatTime, toMs])

  // CRITICAL FIX: Only fetch messages when selectedConversation actually changes
  const selectedConversationId = selectedConversation?.id
  React.useEffect(() => {
    if (selectedConversationId) {
      if (selectedConversation) {
        // The new ChatTimer component will manage its own state
        setCurrentPage(1)
        setHasMoreMessages(true)
        autoScrollNextRef.current = true
        fetchMessages(1, false)
      }
    } else {
      setMessages([])
    }
  }, [selectedConversationId]) // CRITICAL: Only depend on the ID, not the full object

  // Rest of the component methods remain the same...
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
        // The new ChatTimer component will manage its own state
      }
    } catch (e) {
      // Ignore preflight errors
    }
  }, [selectedConversation])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return
    
    // The new ChatTimer component will manage its own state
    if (!isChatSessionActive) {
      toast({ title: "Messaging window closed", description: "Please send a template message.", variant: "destructive" })
      return
    }
    
    await refreshSelectedConversationFromServer()
    // The new ChatTimer component will manage its own state
    if (!isChatSessionActive) {
      toast({ title: "Messaging window closed", description: "Please send a template message.", variant: "destructive" })
      return
    }
    
    const messageText = message.trim()
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
    
    setMessages((prev) => [...prev, optimisticMessage])
    setMessage("")
    
    try {
      toast({ title: "Sending...", variant: "default" })
      const chatId = selectedConversation.chat_id || selectedConversation.id
      const senderId = selectedConversation.sender_id || chatId
      const response = await sendMessage(messageText, chatId, senderId, {
        isChatActive: isChatSessionActive,
        platform: selectedConversation.platform,
      })
      
      if (response.ok) {
        const permanentId = `sent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setMessages((prev) => prev.map((msg) => 
          msg.id === tempMessageId 
            ? { ...msg, status: "delivered" as const, id: permanentId }
            : msg
        ))
        toast({ title: "Message sent!", variant: "default" })
        
        // Update conversation's last message without triggering reload
        setConversations((prev) => prev.map((conv) => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: messageText, last_message_body: messageText, last_message_time: new Date().toISOString() }
            : conv
        ))
      } else {
        try {
          const errText = await response.text()
          if (errText && /expired/i.test(errText)) {
            setIsChatSessionActive(false)
            toast({ title: "Session expired", description: "Please send a Meta-approved template to continue", variant: "destructive" })
            return
          }
        } catch {}
        throw new Error("Failed to send message")
      }
    } catch (error: any) {
      toast({ title: "Failed to send message", description: error.message || "Network error", variant: "destructive" })
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
      
      // Upload file first to get URL
      const url = await uploadMedia(file)
      if (!url) {
        toast({ title: "Failed to upload file", variant: "destructive" })
        return false
      }
      
      // Determine file type
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "file"
      
      // Detect platform from conversation
      const platform = selectedConversation.platform || "messenger"
      
      // Send media using platform-specific API
      let success = await sendMedia({ 
        type: fileType as any, 
        url, 
        caption: file.name, 
        chatId, 
        senderId, 
        platform 
      })
      
      // Fallback to text message if media send fails
      if (!success) {
        const resp = await sendMessage(url, chatId, senderId, { platform })
        success = resp.ok
      }
      
      if (success) {
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
  }, [selectedConversation, formatTime])

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

  const handlePasteFiles = React.useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files)
    for (const f of arr) {
      await sendAnyFile(f)
    }
  }, [sendAnyFile])

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

  const manualRefreshMessages = React.useCallback(async () => {
    if (!selectedConversation) return
    setCurrentPage(1)
    setHasMoreMessages(true)
    await fetchMessages(1, false)
  }, [selectedConversation, fetchMessages])

  React.useEffect(() => {
    const onLoadOlder = () => {
      fetchMessages()
    }
    window.addEventListener('chat:load-older', onLoadOlder)
    return () => window.removeEventListener('chat:load-older', onLoadOlder)
  }, [fetchMessages])

  return (
    <TooltipProvider>
      <div className="flex w-full bg-background overflow-hidden" style={{ height: "83vh" }}>
        <Sidebar
          conversations={conversations}
          filteredConversations={filteredConversations}
          isLoading={isLoading}
          selectedConversation={selectedConversation}
          setSelectedConversation={(c) => {
            const conversationId = String(c.id || c.chat_id)
            
            setConversations((prev) => prev.map((chat) => {
              const match = (String(chat.id) === String(c.id)) || (String(chat.chat_id) === String(c.chat_id))
              return match ? { ...chat, unread_count: 0 } : chat
            }))
            
            setUnreadMap((prev) => {
              const next = { ...prev }
              next[conversationId] = 0
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
        <div className="flex-1 flex flex-col min-w-0 bg-white">
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
                onSessionExpired={() => setIsChatSessionActive(false)}
                onSessionActive={() => setIsChatSessionActive(true)}
                onAssign={(uid) => setAssignedTo(uid)}
                assignedTo={assignedTo}
                users={users}
              />
              <Messages 
                messages={messages} 
                isLoadingMessages={isLoadingMessages} 
                messagesEndRef={messagesEndRef} 
                hasMoreMessages={hasMoreMessages}
                isLoadingOlderMessages={isLoadingOlderMessages}
                onLoadOlderMessages={loadOlderMessages}
                isActive={isChatSessionActive}
              />
              <Composer
                message={message}
                setMessage={setMessage}
                onSend={handleSendMessage}
                onFilePick={handleFileUpload}
                onImagePick={handleImageUpload}
                fileInputRef={fileInputRef}
                imageInputRef={imageInputRef}
                disabled={!isChatSessionActive}
                onQuickReply={() => toast({ title: "Quick reply picker opened" })}
                onTriggerChatbot={() => toast({ title: "Chatbot triggered" })}
                onRefresh={() => selectedConversation && fetchMessages(1, false)}
                onPasteFiles={handlePasteFiles}
              />
              </div>
              <div className="hidden lg:flex shrink-0 w-[320px] border-l bg-white p-4 flex-col gap-4 h-full overflow-y-auto">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      {isValidAvatar(selectedConversation.avatar) ? (
                        <AvatarImage 
                          src={selectedConversation.avatar} 
                          alt={selectedConversation.name}
                          onError={(e) => {
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
                  
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-700 underline">{selectedConversation.name}</div>
                  </div>
                  
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
                    <span>{(contactDetails as any)?.localTime || "-"}</span>
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
                <h3 className="text-lg font-medium">Select a conversations</h3>
                <p className="text-muted-foreground">select a chat conversation to see chats.</p>
              </div>
            </div>
          )}
        </div>
        {leftSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setLeftSidebarOpen(false)} />}
      </div>
    </TooltipProvider>
  )
}