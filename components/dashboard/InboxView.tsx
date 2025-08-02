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
  FileText,
  File,
  Download,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import serverHandler from "@/utils/serverHandler"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSocket } from "@/contexts/socket-context"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookMessenger, faWhatsapp, faInstagram, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { toast } from "@/components/ui/use-toast";

// 1. Utility to get token
const getToken = () => localStorage.getItem('serviceToken') || localStorage.getItem('adminToken') || '';

// 2. Fetch chat list using new API
const fetchChats = async (page = 1, limit = 20) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    const response = await fetch(`${baseUrl}/api/inbox/get_chats?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    return data?.data || [];
  } catch (error) {
    return [];
  }
};

// 3. Fetch messages for a chat using new API
const fetchMessagesForChat = async (chatId: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    
    const response = await fetch(`${baseUrl}/api/inbox/get_convo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ chatId: chatId.toString() })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

// 4. Send file/image function
const sendFile = async (file: File, chatId: string, senderId: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    
    // First, try to send as a text message with file info
    const fileInfo = `📎 File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    
    const response = await fetch(`${baseUrl}/api/messanger/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        text: fileInfo,
        chatId: chatId,
        senderId: senderId
      })
    });

    if (!response.ok) {
      console.error('File upload failed:', response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('File upload result:', result);
    return result.success || false;
  } catch (error) {
    console.error('File upload error:', error);
    return false;
  }
};

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
  type: "text" | "image" | "video" | "audio" | "file" | "interactive" | "carousel" | "gif"
  timestamp: string
  rawTimestamp?: string 
  status?: "sent" | "delivered" | "read"
  body?: any
  reactions?: any[]
  buttons?: any[]
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
  const { socket, isConnected } = useSocket()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearch, setShowSearch] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time chat updates via socket
  React.useEffect(() => {
    if (!socket) return;

    const handleNewChat = (chat: any) => {
      console.log('Received new chat via socket:', chat);
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
      };

      setConversations(prev => {
        const exists = prev.find(c => c.id === newConversation.id);
        if (exists) {
          return prev.map(c => c.id === newConversation.id ? newConversation : c);
        }
        return [newConversation, ...prev];
      });
    };

    const handleChatUpdate = (updatedChat: any) => {
      console.log('Received chat update via socket:', updatedChat);
      setConversations(prev => prev.map(chat => 
        chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
      ));
    };

    const handleNewMessage = (message: any) => {
      console.log('Received new message via socket:', message);
      // Update the conversation's last message
      setConversations(prev => prev.map(chat => {
        if (chat.chat_id === message.chat_id || chat.id === message.chat_id) {
          return {
            ...chat,
            lastMessage: message.body?.text || message.body?.caption || message.message || "",
            last_message_body: message.body?.text || message.body?.caption || message.message || "",
            last_message_time: message.timestamp || message.createdAt,
            time: formatTime(message.timestamp || message.createdAt),
            unread_count: (chat.unread_count || 0) + 1
          };
        }
        return chat;
      }));
    };

    socket.on('new_chat', handleNewChat);
    socket.on('chat_updated', handleChatUpdate);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_chat', handleNewChat);
      socket.off('chat_updated', handleChatUpdate);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  // Fetch chat list on mount
  React.useEffect(() => {
    let isMounted = true;
    const loadChats = async () => {
      setIsLoading(true);
      const chats = await fetchChats();
      if (!isMounted) return;
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
        last_message_time: chat.lastMessage?.timestamp || chat.last_message_time,
        last_message_body: chat.lastMessage?.body?.text || chat.last_message_body,
      }));
      setConversations(conversationsData);
      setFilteredConversations(conversationsData);
      if (conversationsData.length > 0) {
        setSelectedConversation(conversationsData[0]);
      } else {
        setSelectedConversation(null);
      }
      setIsLoading(false);
    };
    loadChats();
    
    return () => { 
      isMounted = false; 
    };
  }, []);

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
  const fetchMessages = React.useCallback(async () => {
    if (!selectedConversation) return;
    setIsLoadingMessages(true);
    const msgs = await fetchMessagesForChat(selectedConversation.id);
    
    if (!Array.isArray(msgs) || msgs.length === 0) {
      setMessages([]);
      setContactDetails({ ...selectedConversation });
      setIsLoadingMessages(false);
      return;
    }
    
          const messagesData = msgs.map((msg: any) => {
        let messageText = "";
        let messageType = msg.type || "text";
        let messageBody = msg.body;
        
        // Debug: Log the message structure to understand the format
        console.log('Processing message:', {
          id: msg.id,
          type: msg.type,
          body: msg.body,
          bodyKeys: msg.body ? Object.keys(msg.body) : []
        });
        
        // Handle different message body structures
        if (typeof msg.body === "string") {
          messageText = msg.body;
        } else if (msg.body && typeof msg.body === "object") {
          // Handle image messages - check for various possible field names
          if (msg.body.attachment_url || msg.body.attchment_url || msg.body.url || msg.body.image_url) {
            messageType = "image";
            messageText = msg.body.text || msg.body.caption || "";
            messageBody = {
              url: msg.body.attachment_url || msg.body.attchment_url || msg.body.url || msg.body.image_url,
              caption: msg.body.text || msg.body.caption || ""
            };
          }
          // Handle video messages
          else if (msg.body.video_url || (msg.body.url && msg.body.type === "video")) {
            messageType = "video";
            messageText = msg.body.text || msg.body.caption || "";
            messageBody = {
              url: msg.body.video_url || msg.body.url,
              caption: msg.body.text || msg.body.caption || ""
            };
          }
          // Handle audio messages
          else if (msg.body.audio_url || (msg.body.url && msg.body.type === "audio")) {
            messageType = "audio";
            messageText = msg.body.text || msg.body.caption || "";
            messageBody = {
              url: msg.body.audio_url || msg.body.url,
              caption: msg.body.text || msg.body.caption || ""
            };
          }
          // Handle document/file messages
          else if (msg.body.document_url || msg.body.file_url || (msg.body.url && msg.body.type === "document")) {
            messageType = "file";
            messageText = msg.body.text || msg.body.caption || msg.body.filename || "Document";
            messageBody = {
              url: msg.body.document_url || msg.body.file_url || msg.body.url,
              caption: msg.body.text || msg.body.caption || "",
              filename: msg.body.filename || "Document",
              filesize: msg.body.filesize || ""
            };
          }
          // Handle carousel messages
          else if (msg.body.elements && Array.isArray(msg.body.elements)) {
            messageType = "carousel";
            messageText = msg.body.text || msg.body.caption || "";
            messageBody = {
              elements: msg.body.elements,
              text: msg.body.text || msg.body.caption || ""
            };
          }
          // Handle GIF messages
          else if (msg.body.gif_url || (msg.body.url && msg.body.type === "gif")) {
            messageType = "gif";
            messageText = msg.body.text || msg.body.caption || "";
            messageBody = {
              url: msg.body.gif_url || msg.body.url,
              caption: msg.body.text || msg.body.caption || ""
            };
          }
          // Handle text messages
          else {
            messageText = msg.body.text || msg.body.caption || JSON.stringify(msg.body);
          }
        } else if (msg.message && typeof msg.message === "string") {
          messageText = msg.message;
        } else if (msg.message && typeof msg.message === "object") {
          messageText = JSON.stringify(msg.message);
        }
        
        // Handle case where body might be a JSON string
        if (typeof msg.body === "string" && msg.body.startsWith('{')) {
          try {
            const parsedBody = JSON.parse(msg.body);
            if (parsedBody.attchment_url || parsedBody.attachment_url || parsedBody.url) {
              messageType = "image";
              messageText = parsedBody.text || parsedBody.caption || "";
              messageBody = {
                url: parsedBody.attchment_url || parsedBody.attachment_url || parsedBody.url,
                caption: parsedBody.text || parsedBody.caption || ""
              };
            }
          } catch (e) {
            // If parsing fails, keep the original string
            console.log('Failed to parse message body as JSON:', msg.body);
          }
        }
        
        // Handle interactive messages (buttons, etc.)
        let buttons = [];
        if (msg.type === "interactive" && msg.body && msg.body.interactive) {
          const interactive = msg.body.interactive;
          if (interactive.type === "button_reply" && interactive.button_reply) {
            messageText = interactive.button_reply.title || messageText;
          } else if (interactive.type === "button" && interactive.button) {
            buttons = interactive.button.buttons || [];
          }
        }
        
        // Final check: if message text contains an image URL, treat it as an image
        if (messageText && typeof messageText === "string" && 
            (messageText.includes('attchment_url') || messageText.includes('attachment_url') || messageText.includes('.jpg') || messageText.includes('.png') || messageText.includes('.jpeg'))) {
          try {
            // Try to extract URL from the text
            const urlMatch = messageText.match(/(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp))/i);
            if (urlMatch) {
              messageType = "image";
              messageBody = {
                url: urlMatch[1],
                caption: messageText.replace(urlMatch[0], '').trim() || ""
              };
              messageText = messageBody.caption;
            }
          } catch (e) {
            console.log('Failed to extract image URL from text:', messageText);
          }
        }
        
        const rawTimestamp = msg.timestamp || msg.createdAt || msg.created_at;
        const formattedTimestamp = formatTime(rawTimestamp);
        
        const processedMessage: Message = {
          id: msg.id || msg.message_id || Math.random().toString(),
          sender: msg.route === "OUTGOING" ? "user" : "other",
          message: messageText,
          type: messageType,
          timestamp: formattedTimestamp,
          rawTimestamp: rawTimestamp,
          status: msg.status || "",
          body: messageBody,
          reactions: msg.reactions || [],
          buttons: buttons,
        };
        
        return processedMessage;
      });
    
    // Sort messages by timestamp (oldest first)
    const sortedMessages = messagesData.sort((a: any, b: any) => {
      const dateA = new Date(a.rawTimestamp || 0);
      const dateB = new Date(b.rawTimestamp || 0);
      return dateA.getTime() - dateB.getTime();
    });
    
    setMessages(sortedMessages);
    setContactDetails({ ...selectedConversation });
    setIsLoadingMessages(false);
  }, [selectedConversation]);

  React.useEffect(() => { 
    if (selectedConversation) {
      fetchMessages(); 
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages]);

  // Socket.io real-time updates (consolidated)
  React.useEffect(() => {
    if (!socket || !selectedConversation) return;
    
    const handleNewMessage = (msg: any) => {
      if (msg.chat_id === selectedConversation.id || msg.chat_id === selectedConversation.chat_id) {
        const newMessage: Message = {
          id: msg.id || Math.random().toString(),
          sender: msg.route === "outgoing" ? "user" : "other",
          message: msg.body?.text || msg.body?.caption || msg.body || msg.message || "",
          type: msg.type || "text",
          timestamp: formatTime(msg.timestamp || new Date().toISOString()),
          rawTimestamp: msg.timestamp || new Date().toISOString(),
          status: msg.status || "",
          body: msg.body,
          reactions: msg.reactions || [],
          buttons: msg.buttons || [],
        };
        setMessages(prev => {
          const exists = prev.some(m => m.id === newMessage.id);
          if (exists) {
            return prev;
          }
          const updated = [...prev, newMessage];
          const sorted = updated.sort((a, b) => new Date(a.rawTimestamp || 0).getTime() - new Date(b.rawTimestamp || 0).getTime());
          return sorted;
        });
      }
    };
    
    const handleUpdateDelivery = (msg: any) => {
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, status: msg.status } : m
      ));
    };
    
    socket.on('new_message', handleNewMessage);
    socket.on('update_delivery', handleUpdateDelivery);
    
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('update_delivery', handleUpdateDelivery);
    };
  }, [socket, selectedConversation]);

  // Format time helper
  const formatTime = (timestamp: string | Date | number) => {
    if (!timestamp) return ""
    
    try {
      let date: Date;
      
      // Handle different timestamp formats
      if (typeof timestamp === 'number') {
        // Unix timestamp (seconds) - convert to milliseconds
        date = new Date(timestamp * 1000);
      } else if (typeof timestamp === 'string') {
        // Check if it's a Unix timestamp string
        const numTimestamp = parseInt(timestamp);
        if (!isNaN(numTimestamp) && numTimestamp > 1000000000) {
          // Likely a Unix timestamp in seconds
          date = new Date(numTimestamp * 1000);
        } else {
          // Regular date string
          date = new Date(timestamp);
        }
      } else {
        // Date object
        date = timestamp;
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return ""
      }
      
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        // Same day - show time
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      } else if (diffInHours < 168) {
        // Less than a week - show day
        return date.toLocaleDateString("en-US", { weekday: "short" })
      } else {
        // More than a week - show date
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      }
    } catch (error) {
      return ""
    }
  }

  // Send message handler
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;
    const messageText = message.trim();
    const tempMessageId = `temp-${Date.now()}`;
    
    // Optimistic UI update
    const optimisticMessage: Message = {
      id: tempMessageId,
      sender: "user",
      message: messageText,
      type: "text",
      timestamp: formatTime(new Date().toISOString()),
      rawTimestamp: new Date().toISOString(),
      status: "sent",
    };
    
    setMessages(prev => {
      const updated = [...prev, optimisticMessage];
      return updated;
    });
    setMessage("");
    
    try {
      // First get all available chats to find the senderId
      const chatsResponse: any = await serverHandler.get('/api/messanger/list-chats', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Extract the actual data from the Axios response
      const chatsData = chatsResponse.data;
      
      if (chatsData.success && chatsData.data && chatsData.data.length > 0) {
        // Find the chat matching the selected conversation
        const chat = chatsData.data.find(
          (c: any) =>
            c.chat_id === selectedConversation?.chat_id ||
            c.chat_id === selectedConversation?.id
        );
        
        if (!chat) {
          toast({ title: "No matching chat found", variant: "destructive" });
          setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
          return;
        }
        
        // Send message using the correct API format
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
        const response = await fetch(`${baseUrl}/api/messanger/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            text: messageText,
            chatId: chat.chat_id,
            senderId: chat.sender_id
          })
        });
        
        if (response.ok) {
          // Mark optimistic message as delivered
          setMessages(prev => {
            const updated = prev.map(msg =>
              msg.id === tempMessageId ? { ...msg, status: "delivered" as const } : msg
            );
            return updated;
          });
          toast({ title: "Message sent!", variant: "default" });
        } else {
          throw new Error('Failed to send message');
        }
      } else {
        toast({ title: "No chats available", variant: "destructive" });
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      }
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message || "Network error",
        variant: "destructive"
      });
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      setMessage(messageText);
    }
  }

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedConversation) {
      try {
        toast({ title: "Sending file...", variant: "default" });
        
        // Get chat details for senderId
        const chatsResponse: any = await serverHandler.get('/api/messanger/list-chats', {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        const chatsData = chatsResponse.data;
        if (chatsData.success && chatsData.data && chatsData.data.length > 0) {
          const chat = chatsData.data.find(
            (c: any) =>
              c.chat_id === selectedConversation?.chat_id ||
              c.chat_id === selectedConversation?.id
          );
          
          if (chat) {
            const success = await sendFile(file, chat.chat_id, chat.sender_id);
            if (success) {
              toast({ title: "File sent successfully!", variant: "default" });
              // Refresh messages to show the new file message
              setTimeout(() => {
                if (selectedConversation) {
                  fetchMessages();
                }
              }, 1000);
            } else {
              toast({ title: "Failed to send file", variant: "destructive" });
            }
          } else {
            toast({ title: "Chat not found", variant: "destructive" });
          }
        } else {
          toast({ title: "No chats available", variant: "destructive" });
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast({ title: "Failed to send file", variant: "destructive" });
      }
    }
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  }

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedConversation) {
      try {
        toast({ title: "Sending image...", variant: "default" });
        
        // Get chat details for senderId
        const chatsResponse: any = await serverHandler.get('/api/messanger/list-chats', {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        const chatsData = chatsResponse.data;
        if (chatsData.success && chatsData.data && chatsData.data.length > 0) {
          const chat = chatsData.data.find(
            (c: any) =>
              c.chat_id === selectedConversation?.chat_id ||
              c.chat_id === selectedConversation?.id
          );
          
          if (chat) {
            const success = await sendFile(file, chat.chat_id, chat.sender_id);
            if (success) {
              toast({ title: "Image sent successfully!", variant: "default" });
              // Refresh messages to show the new image message
              setTimeout(() => {
                if (selectedConversation) {
                  fetchMessages();
                }
              }, 1000);
            } else {
              toast({ title: "Failed to send image", variant: "destructive" });
            }
          } else {
            toast({ title: "Chat not found", variant: "destructive" });
          }
        } else {
          toast({ title: "No chats available", variant: "destructive" });
        }
      } catch (error) {
        console.error('Image upload error:', error);
        toast({ title: "Failed to send image", variant: "destructive" });
      }
    }
    // Reset file input
    if (event.target) {
      event.target.value = '';
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

  // Function to render message content with Messenger-like styling
  const renderMessageContent = (msg: Message) => {
    // Handle image messages
    if (msg.type === "image" && msg.body && typeof msg.body === 'object' && msg.body.url) {
      return (
        <div className="max-w-xs">
          <img 
            src={msg.body.url || "/placeholder.svg"} 
            alt="Image" 
            className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => window.open(msg.body.url, '_blank')}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          {msg.body.caption && (
            <p className="mt-2 text-sm">{msg.body.caption}</p>
          )}
        </div>
      );
    } 
    // Handle video messages
    else if (msg.type === "video" && msg.body && typeof msg.body === 'object' && msg.body.url) {
      return (
        <div className="max-w-xs">
          <video 
            src={msg.body.url} 
            controls 
            className="w-full rounded-lg" 
            onError={(e) => {
              console.error('Video failed to load:', msg.body.url);
            }}
          />
          {msg.body.caption && (
            <p className="mt-2 text-sm">{msg.body.caption}</p>
          )}
        </div>
      );
    } 
    // Handle audio messages
    else if (msg.type === "audio" && msg.body && typeof msg.body === 'object' && msg.body.url) {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
          <Mic className="h-4 w-4" />
          <audio src={msg.body.url} controls className="flex-1" />
        </div>
      );
    } 
    // Handle document/file messages
    else if (msg.type === "file" && msg.body && typeof msg.body === 'object' && msg.body.url) {
      const fileName = msg.body.filename || msg.body.caption || 'Document';
      const fileSize = msg.body.filesize || '';
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
             onClick={() => window.open(msg.body.url, '_blank')}>
          <div className="flex-shrink-0">
            {fileName.toLowerCase().includes('.pdf') ? (
              <FileText className="h-6 w-6 text-red-600" />
            ) : fileName.toLowerCase().includes('.doc') || fileName.toLowerCase().includes('.docx') ? (
              <FileText className="h-6 w-6 text-blue-600" />
            ) : fileName.toLowerCase().includes('.xlsx') || fileName.toLowerCase().includes('.csv') ? (
              <FileText className="h-6 w-6 text-green-600" />
            ) : (
              <File className="h-6 w-6 text-gray-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
          </div>
          <Download className="h-4 w-4 text-gray-400" />
        </div>
      );
    } 
    // Handle carousel messages
    else if (msg.type === "carousel" && msg.body && msg.body.elements) {
      return (
        <div className="space-y-2">
          {msg.body.elements.map((element: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
              {element.image_url && (
                <img 
                  src={element.image_url} 
                  alt={element.title || 'Carousel item'} 
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              {element.title && (
                <h4 className="font-medium text-sm mb-1">{element.title}</h4>
              )}
              {element.subtitle && (
                <p className="text-xs text-gray-600 mb-2">{element.subtitle}</p>
              )}
              {element.buttons && element.buttons.length > 0 && (
                <div className="space-y-1">
                  {element.buttons.map((button: any, btnIndex: number) => (
                    <Button
                      key={btnIndex}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        toast({ title: `Carousel button clicked: ${button.title}` });
                      }}
                    >
                      {button.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    // Handle interactive messages with buttons
    else if (msg.type === "interactive" && msg.buttons && msg.buttons.length > 0) {
      return (
        <div className="space-y-2">
          {msg.message && (
            <p className="text-sm mb-3">{msg.message}</p>
          )}
          <div className="space-y-2">
            {msg.buttons.map((button: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left h-auto py-2 px-3 text-sm font-normal border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  toast({ title: `Button clicked: ${button.text || button.title}` });
                }}
              >
                {button.text || button.title || `Button ${index + 1}`}
              </Button>
            ))}
          </div>
        </div>
      );
    } 
    // Handle GIF messages
    else if (msg.type === "gif" && msg.body && typeof msg.body === 'object' && msg.body.url) {
      return (
        <div className="max-w-xs">
          <img 
            src={msg.body.url} 
            alt="GIF" 
            className="w-full rounded-lg" 
          />
          {msg.body.caption && (
            <p className="mt-2 text-sm">{msg.body.caption}</p>
          )}
        </div>
      );
    }
    // Handle text messages (default)
    else {
      return (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {msg.message || "No message content"}
        </p>
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="flex w-full bg-background overflow-hidden" style={{height: '83vh'}}>
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
          <div className="flex-1 permanent-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Loading conversations...</p>
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No conversations found. Try adjusting your filters or check back later.</p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
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
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-medium">{conversation.name}</p>
                      <p className="text-sm">Platform: {conversation.platform}</p>
                      <p className="text-sm">Last seen: {conversation.time}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))
            )}
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
                      <span>•</span>
                      <span className={`flex items-center gap-1 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      console.log('Manual refresh clicked');
                      if (selectedConversation) {
                        fetchMessages();
                      }
                    }}
                    title="Refresh messages"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
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
              {/* Chat Messages with Messenger-like styling */}
              <div className="flex-1 permanent-scrollbar p-4 space-y-3 bg-gray-50">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p>Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No messages yet</p>
                      <p className="text-xs mt-1">Select a conversation to view messages</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}> 
                      <div className={cn(
                        "relative max-w-xs lg:max-w-md group",
                        msg.sender === "user" ? "ml-12" : "mr-12"
                      )}>
                        {/* Message bubble with Messenger-like styling */}
                        <div className={cn(
                          "rounded-2xl px-4 py-2 shadow-sm",
                          msg.sender === "user" 
                            ? "bg-blue-500 text-white rounded-br-md" 
                            : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                        )}>
                          {renderMessageContent(msg)}
                          
                          {/* Show reactions if present */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2 -mb-1">
                              {msg.reactions.map((r: any, i: number) => (
                                <span key={i} className="text-sm bg-white rounded-full px-1 shadow-sm">{r.emoji}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Timestamp and status */}
                        <div className={cn(
                          "flex items-center gap-1 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500",
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        )}>
                          <span>{msg.timestamp}</span>
                          {msg.sender === "user" && (
                            <div className="flex items-center">
                              {msg.status === "read" ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                              ) : msg.status === "delivered" ? (
                                <CheckCheck className="h-3 w-3 text-gray-400" />
                              ) : (
                                <Check className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              {/* Chat Input with Messenger-like styling */}
              <div className="border-t p-4 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(selectedConversation.platform)}
                    <span className="text-sm font-medium capitalize">{selectedConversation.platform}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* File inputs */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*,video/*,audio/*"
                  />
                  
                  {/* Attachment buttons */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-500 hover:bg-blue-50"
                    title="Send document"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => imageInputRef.current?.click()}
                    className="text-blue-500 hover:bg-blue-50"
                    title="Send image/video"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-blue-500 hover:bg-blue-50"
                    title="Voice message"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  
                  {/* Message input */}
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="pr-20 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-100 focus:bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage()
                      }}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-500">
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
                                className="h-8 w-8 p-0 hover:bg-gray-100"
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
                      <Button 
                        size="icon" 
                        className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full" 
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                      >
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
