"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MessageSquare, Phone, Mail, Clock, User, Reply, Archive, Flag, Send, Paperclip, Mic } from 'lucide-react'
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import serverHandler from '@/utils/api/enpointsUtils/serverHandler'
import { useToast } from "@/hooks/use-toast"

interface Conversation {
  id: number
  uid: string
  customer_name: string
  customer_email: string
  platform: string
  status: string
  last_message: string
  created_at: string
  updated_at: string
  priority?: string
  unread_count?: number
}

interface Message {
  id: number
  content: string
  type: string
  direction: string
  timestamp: string
}

interface ChatDetails {
  chat: Conversation
  messages: Message[]
}

export default function AgentInboxView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState("")
  const { toast } = useToast()
  const agent = useSelector((state: RootState) => state.agentAuth.agent)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response: any = await serverHandler.get('/api/agent/get_my_assigned_chats')
      setConversations(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      // Use mock data for now
      setConversations([
        {
          id: 1,
          uid: "chat_uid_123",
          customer_name: "John Doe",
          customer_email: "john@example.com",
          platform: "facebook",
          status: "active",
          last_message: "Hello, I need help with my order",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
          priority: "high",
          unread_count: 2
        },
        {
          id: 2,
          uid: "chat_uid_124",
          customer_name: "Sarah Wilson",
          customer_email: "sarah@example.com",
          platform: "whatsapp",
          status: "resolved",
          last_message: "Thank you for your help!",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
          priority: "medium",
          unread_count: 0
        },
        {
          id: 3,
          uid: "chat_uid_125",
          customer_name: "Mike Johnson",
          customer_email: "mike@example.com",
          platform: "instagram",
          status: "pending",
          last_message: "Can you check my delivery status?",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
          priority: "high",
          unread_count: 1
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationDetails = async (chatId: string) => {
    try {
      const response: any = await serverHandler.post('/api/agent/get_convo', { chatId })
      setChatDetails(response.data.data)
    } catch (error) {
      console.error('Failed to fetch conversation details:', error)
      // Use mock data for now
      setChatDetails({
        chat: selectedConversation!,
        messages: [
          {
            id: 1,
            content: "Hello, I need help with my order",
            type: "text",
            direction: "incoming",
            timestamp: "2024-01-01T00:00:00.000Z"
          },
          {
            id: 2,
            content: "Hi! I'd be happy to help you. Can you provide your order number?",
            type: "text",
            direction: "outgoing",
            timestamp: "2024-01-01T00:01:00.000Z"
          }
        ]
      })
    }
  }

  const sendMessage = async (type: string = 'text', content?: string) => {
    if (!selectedConversation || (!messageText && !content)) return

    setSending(true)
    try {
      let response
      if (type === 'text') {
        response = await serverHandler.post('/api/agent/send_text', {
          chatId: selectedConversation.uid,
          message: messageText
        })
      } else if (type === 'image') {
        // Handle image upload
        const formData = new FormData()
        formData.append('chatId', selectedConversation.uid)
        formData.append('image', content as any)
        response = await serverHandler.post('/api/agent/send_image', formData)
      } else if (type === 'audio') {
        // Handle audio upload
        const formData = new FormData()
        formData.append('chatId', selectedConversation.uid)
        formData.append('audio', content as any)
        response = await serverHandler.post('/api/agent/send_audio', formData)
      } else if (type === 'video') {
        // Handle video upload
        const formData = new FormData()
        formData.append('chatId', selectedConversation.uid)
        formData.append('video', content as any)
        response = await serverHandler.post('/api/agent/send_video', formData)
      } else if (type === 'document') {
        // Handle document upload
        const formData = new FormData()
        formData.append('chatId', selectedConversation.uid)
        formData.append('document', content as any)
        response = await serverHandler.post('/api/agent/send_doc', formData)
      }

             if ((response?.data as any)?.success || (response?.data as any)?.msg) {
         setMessageText("")
         // Refresh conversation details
         await fetchConversationDetails(selectedConversation.uid)
         toast({
           title: "Success",
           description: "Message sent successfully",
           variant: "default"
         })
       }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const handleConversationClick = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    await fetchConversationDetails(conversation.uid)
  }

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.last_message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || conversation.status === statusFilter
    const matchesPriority = priorityFilter === "all" || conversation.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'fab fa-facebook text-blue-600'
      case 'whatsapp': return 'fab fa-whatsapp text-green-600'
      case 'instagram': return 'fab fa-instagram text-pink-600'
      default: return 'fas fa-globe text-gray-600'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Conversations List */}
      <div className="w-full lg:w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Conversations</h2>
          
          {/* Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto h-96">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <i className={`${getPlatformIcon(conversation.platform)} text-lg`}></i>
                  <div>
                    <h3 className="font-semibold text-gray-800">{conversation.customer_name}</h3>
                    <p className="text-sm text-gray-500">{conversation.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(conversation.status)}>
                    {conversation.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {formatTime(conversation.updated_at)}
                </span>
                {conversation.priority && (
                  <Badge className={conversation.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                   conversation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-green-100 text-green-800'}>
                    {conversation.priority}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Details */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className={`${getPlatformIcon(selectedConversation.platform)} text-xl`}></i>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedConversation.customer_name}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(selectedConversation.status)}>
                    {selectedConversation.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatDetails?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                      message.direction === 'outgoing'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Mic className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage('text')}
                  className="flex-1"
                />
                <Button 
                  onClick={() => sendMessage('text')}
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 