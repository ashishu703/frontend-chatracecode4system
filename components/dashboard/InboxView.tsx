"use client"
import * as React from "react"
import {
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Phone,
  Video,
  Search,
  MessageCircle,
  Menu,
  X,
  Filter,
  ImageIcon,
  CheckCheck,
  Check,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import serverHandler from "@/utils/serverHandler"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Socket } from "socket.io-client"
import { io } from "socket.io-client"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookMessenger, faWhatsapp, faInstagram, faTelegram } from '@fortawesome/free-brands-svg-icons';

interface ContactDetails {
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

interface Message {
  id: string
  sender: "user" | "other"
  message: string
  type: "text" | "image" | "video" | "audio" | "file"
  timestamp: string
  status?: "sent" | "delivered" | "read"
  body?: any
}

interface Conversation {
  id: string
  chat_id: string
  name: string
  avatar: string
  lastMessage: string
  platform: string
  time: string
  page_name?: string
  page_icon?: string
  unread_count?: number
  sender_name?: string
  last_message_time?: string
  last_message_body?: string
  channel_icon?: string
}

export default function ChatInterface() {
  const [message, setMessage] = React.useState("")
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = React.useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(false)
  const [contactDetails, setContactDetails] = React.useState<ContactDetails | null>(null)
  const [filter, setFilter] = React.useState<"all" | "pending" | "open" | "solved">("all")
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false)
  const [hoveredContact, setHoveredContact] = React.useState<ContactDetails | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearch, setShowSearch] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Fetch chat list on mount
  React.useEffect(() => {
    const fetchChats = async () => {
      try {
        let url = "/api/inbox/get_chats"
        if (filter !== "all") {
          url += `?chat_status=${filter.toUpperCase()}`
        }
        const res: any = await serverHandler.get(url)
        if (res.data && res.data.data) {
          const conversationsData = res.data.data.map((chat: any) => ({
            ...chat,
            id: chat.chat_id || chat.id,
            chat_id: chat.chat_id || chat.id,
            name: chat.sender_name || chat.page_name || chat.name || "Unknown",
            avatar: chat.avatar || chat.profile_pic || "/placeholder.svg",
            lastMessage: chat.last_message_body || chat.lastMessage || "",
            platform: chat.platform || chat.channel || "messenger",
            time: formatTime(chat.last_message_time || chat.time),
            page_name: chat.page_name,
            page_icon: chat.page_icon,
            channel_icon: chat.channel_icon,
            unread_count: chat.unread_count || 0,
          }))

          setConversations(conversationsData)
          setFilteredConversations(conversationsData)

          if (conversationsData.length > 0) {
            setSelectedConversation(conversationsData[0])
          } else {
            setSelectedConversation(null)
          }
        }
      } catch (err) {
        setConversations([])
        setFilteredConversations([])
        setSelectedConversation(null)
      }
    }
    fetchChats()
  }, [filter])

  // Search functionality
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(
        (conv) =>
          conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.platform.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  // Fetch messages when a conversation is selected
  React.useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return
      try {
        const res: any = await serverHandler.post("/api/inbox/get_convo", {
          chat_id: selectedConversation.chat_id,
        })
        if (res.data && res.data.data) {
          setMessages(
            res.data.data.map((msg: any) => {
              let messageText = ""
              if (typeof msg.body === "string") {
                messageText = msg.body
              } else if (msg.body && typeof msg.body === "object") {
                messageText = msg.body.text || msg.body.caption || JSON.stringify(msg.body)
              } else if (msg.message && typeof msg.message === "string") {
                messageText = msg.message
              } else if (msg.message && typeof msg.message === "object") {
                messageText = JSON.stringify(msg.message)
              }
              return {
                id: msg.id || Math.random().toString(),
                sender: msg.route === "outgoing" ? "user" : "other",
                message: messageText,
                type: msg.type || "text",
                timestamp: formatTime(msg.timestamp || msg.created_at),
                status: msg.status || "",
                body: msg.body,
              }
            }),
          )
        } else {
          setMessages([])
        }
        setContactDetails({
          ...selectedConversation,
        })
      } catch (err) {
        setMessages([])
      }
    }
    fetchMessages()
  }, [selectedConversation])

  // Socket.io real-time updates
  React.useEffect(() => {
    if (!socket) {
      let wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:6400"
      if (wsUrl.startsWith("ws://")) wsUrl = wsUrl.replace("ws://", "http://")
      if (wsUrl.startsWith("wss://")) wsUrl = wsUrl.replace("wss://", "https://")
      const s = io(wsUrl, {
        auth: { token: localStorage.getItem("serviceToken") },
      })
      setSocket(s)
      s.on("new_message", (msg: any) => {
        if (msg.chat_id === selectedConversation?.chat_id) {
          const newMessage: Message = {
            id: msg.id || Math.random().toString(),
            sender: msg.route === "outgoing" ? "user" : "other",
            message: msg.body?.text || msg.body?.caption || msg.body || msg.message || "",
            type: msg.type || "text",
            timestamp: formatTime(msg.timestamp || new Date().toISOString()),
            status: msg.status || "",
            body: msg.body,
          }
          setMessages((prev) => [...prev, newMessage])
        }
      })
      return () => {
        s.disconnect()
      }
    }
  }, [selectedConversation, socket])

  // Format time helper
  const formatTime = (timestamp: string | Date) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } else if (diffInHours < 168) {
      // Less than a week
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  // Send message handler
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return
    try {
      await serverHandler.post("/api/messanger/send", {
        chat_id: selectedConversation.chat_id,
        message: message.trim(),
      })
      setMessage("")
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedConversation) {
      // Handle file upload logic here
      console.log("File selected:", file)
      // You can implement file upload to your API here
    }
  }

  // Replace getChannelIcon with Font Awesome icons
  const getChannelIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "whatsapp":
        return <FontAwesomeIcon icon={faWhatsapp} style={{ color: "#25D366", fontSize: 18 }} />;
      case "instagram":
        return <FontAwesomeIcon icon={faInstagram} style={{ color: "#E1306C", fontSize: 18 }} />;
      case "facebook":
      case "messenger":
        return <FontAwesomeIcon icon={faFacebookMessenger} style={{ color: "#0084FF", fontSize: 18 }} />;
      case "telegram":
        return <FontAwesomeIcon icon={faTelegram} style={{ color: "#229ED9", fontSize: 18 }} />;
      default:
        return <FontAwesomeIcon icon={faFacebookMessenger} style={{ color: "#ccc", fontSize: 18 }} />;
    }
  };

  // Get page icon
  const getPageIcon = (pageName: string, pageIcon?: string) => {
    if (!pageName) return null

    if (pageIcon) {
      return (
        <img
          src={pageIcon || "/placeholder.svg"}
          alt={pageName}
          className="w-3 h-3 rounded-full object-cover"
          onError={(e) => {
            // Fallback to text icon if image fails to load
            e.currentTarget.style.display = "none"
          }}
        />
      )
    }

    return (
      <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
        {pageName.charAt(0).toUpperCase()}
      </div>
    )
  }

  // Emoji picker (simplified)
  const emojis = ["😀", "😂", "😍", "👍", "❤️", "😢", "😮", "😡", "👏", "🔥"]

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Left Sidebar - Conversations */}
        <div
          className={cn(
            "w-80 bg-background border-r flex flex-col transition-all duration-300 ease-in-out",
            "lg:relative lg:translate-x-0",
            leftSidebarOpen
              ? "fixed inset-y-0 left-0 z-50 translate-x-0"
              : "fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0",
          )}
        >
          {/* Left Sidebar Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setLeftSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">All Chats</span>
              <div className="flex items-center gap-1">
                <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-2 z-50">
                    <div className="flex flex-col gap-2">
                      {["all", "pending", "open", "solved"].map((f) => (
                        <Button
                          key={f}
                          variant={filter === f ? "default" : "outline"}
                          size="sm"
                          className="capitalize w-full"
                          onClick={() => {
                            setFilter(f as any)
                            setFilterPopoverOpen(false)
                          }}
                        >
                          {f === "all" ? "All Chats" : f.charAt(0).toUpperCase() + f.slice(1) + " Chats"}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSearch(!showSearch)}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Search Input */}
            {showSearch && (
              <div className="mt-3">
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
            )}
          </div>
          {/* Conversations List with Custom Scrollbar */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {filteredConversations.map((conversation) => (
              <Tooltip key={conversation.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "p-3 hover:bg-accent cursor-pointer border-b transition-colors",
                      selectedConversation?.id === conversation.id && "bg-accent",
                    )}
                    onClick={() => setSelectedConversation(conversation)}
                    onMouseEnter={() =>
                      setHoveredContact({
                        name: conversation.name,
                        avatar: conversation.avatar,
                        platform: conversation.platform,
                        page_name: conversation.page_name,
                        last_seen: conversation.time,
                      })
                    }
                    onMouseLeave={() => setHoveredContact(null)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{conversation.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          {getChannelIcon(conversation.platform)}
                        </div>
                        {conversation.page_name && (
                          <div className="absolute -top-1 -left-1">
                            {getPageIcon(conversation.page_name, conversation.page_icon)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{conversation.name}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{conversation.time}</span>
                            {conversation.unread_count && conversation.unread_count > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 w-5 p-0 text-xs flex items-center justify-center"
                              >
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {typeof conversation.lastMessage === "string"
                            ? conversation.lastMessage
                            : conversation.lastMessage && typeof conversation.lastMessage === "object"
                              ? (((conversation.lastMessage as any).body && typeof (conversation.lastMessage as any).body === 'object' && ((conversation.lastMessage as any).body.text || (conversation.lastMessage as any).body.caption)) || JSON.stringify((conversation.lastMessage as any).body || conversation.lastMessage))
                              : ""}
                        </p>
                        {conversation.page_name && (
                          <p className="text-xs text-blue-600 truncate">From: {conversation.page_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">{conversation.name}</p>
                    <p className="text-sm">Platform: {conversation.platform}</p>
                    {conversation.page_name && <p className="text-sm">Page: {conversation.page_name}</p>}
                    <p className="text-sm">Last seen: {conversation.time}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setLeftSidebarOpen(true)}>
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{selectedConversation.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getChannelIcon(selectedConversation.platform)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-semibold text-sm lg:text-base">{selectedConversation.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{selectedConversation.platform}</span>
                      {selectedConversation.page_name && (
                        <>
                          <span>•</span>
                          <span>{selectedConversation.page_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </header>
              {/* Chat Messages with Custom Scrollbar */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No messages yet</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 max-w-xs lg:max-w-md",
                          msg.sender === "user" ? "bg-blue-500 text-white" : "bg-muted",
                        )}
                      >
                        {msg.type === "image" && msg.body && typeof msg.body === 'object' && (msg.body as any).url ? (
                          <img src={(msg.body as any).url || "/placeholder.svg"} alt="Image" className="max-w-full rounded" />
                        ) : msg.type === "video" && msg.body && typeof msg.body === 'object' && (msg.body as any).url ? (
                          <video src={(msg.body as any).url} controls className="max-w-full rounded" />
                        ) : msg.type === "audio" && msg.body && typeof msg.body === 'object' && (msg.body as any).url ? (
                          <audio src={(msg.body as any).url} controls />
                        ) : (
                          <p className="text-sm">
                            {typeof msg.message === "string"
                              ? msg.message
                              : msg.message && typeof msg.message === "object"
                                ? ((msg.message as any).text || (msg.message as any).caption || JSON.stringify(msg.message))
                                : ""}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">{msg.timestamp}</span>
                          {msg.sender === "user" && (
                            <div className="flex items-center">
                              {msg.status === "read" ? (
                                <CheckCheck className="h-3 w-3 text-blue-300" />
                              ) : msg.status === "delivered" ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(selectedConversation.platform)}
                    <span className="text-sm font-medium capitalize">{selectedConversation.platform}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="pr-20"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage()
                      }}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                          <div className="grid grid-cols-5 gap-2">
                            {emojis.map((emoji, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setMessage((prev) => prev + emoji)
                                  setShowEmojiPicker(false)
                                }}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button size="icon" className="h-8 w-8" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Select a chat</h3>
                <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
        {/* Mobile Overlay */}
        {leftSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setLeftSidebarOpen(false)} />
        )}
      </div>
    </TooltipProvider>
  )
}
