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
  Users,
  Settings,
  Bell,
  Star,
  Plus,
  ChevronRight,
  Menu,
  X,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import serverHandler from '@/utils/serverHandler';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface ContactDetails {
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  localTime?: string;
  contact?: string;
  country?: string;
}

export default function ChatInterface() {
  const [message, setMessage] = React.useState("");
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(false);
  const [contactDetails, setContactDetails] = React.useState<ContactDetails | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'open' | 'solved'>('all');
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);

  // Fetch chat list on mount
  React.useEffect(() => {
    const fetchChats = async () => {
      try {
        let url = '/api/inbox/get_chats';
        if (filter !== 'all') {
          url += `?chat_status=${filter.toUpperCase()}`;
        }
        const res: any = await serverHandler.get(url);
        if (res.data && res.data.data) {
          setConversations(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedConversation(res.data.data[0]);
          } else {
            setSelectedConversation(null);
          }
        }
      } catch (err) {
        setConversations([]);
        setSelectedConversation(null);
      }
    };
    fetchChats();
  }, [filter]);

  // Fetch messages when a conversation is selected
  React.useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      try {
        const res: any = await serverHandler.post('/api/inbox/get_convo', { chatId: selectedConversation.chat_id });
        if (res.data && res.data.data) {
          setMessages(res.data.data);
        } else {
          setMessages([]);
        }
        // Set contact details if available
        setContactDetails(selectedConversation.page || selectedConversation.account || null);
      } catch (err) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  return (
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
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={contactDetails?.avatar || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback>{contactDetails?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{contactDetails?.name || ''}</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setLeftSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">All Conversations</span>
            <div className="flex items-center gap-1">
              <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-2">
                  <div className="flex flex-col gap-2">
                    {['all', 'pending', 'open', 'solved'].map((f) => (
                      <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        className="capitalize w-full"
                        onClick={() => {
                          setFilter(f as any);
                          setFilterPopoverOpen(false);
                        }}
                      >
                        {f === 'all' ? 'All Chats' : f.charAt(0).toUpperCase() + f.slice(1) + ' Chats'}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Search className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Users className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "p-3 hover:bg-accent cursor-pointer border-b transition-colors",
                selectedConversation?.id === conversation.id && "bg-accent",
              )}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{conversation?.name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  {conversation.status === "whatsapp" && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {conversation.status === "instagram" && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">IG</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{conversation.name}</p>
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                  )}
                  {conversation.warning && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enable Notifications */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
            <Bell className="h-4 w-4" />
            Enable Notifications
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setLeftSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm lg:text-base">{contactDetails?.name || ''}</h2>
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  Assign Conversation
                </Badge>
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
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setRightSidebarOpen(true)}>
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Bot Status Banner */}
        <div className="bg-orange-100 border-l-4 border-orange-500 p-3 flex items-center gap-2">
          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
          <span className="text-sm font-medium text-orange-800">The bot is active</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">February 19, 2025</span>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("bg-green-500 text-white rounded-lg px-3 py-2 max-w-xs lg:max-w-md", msg.sender === "user" ? "bg-green-500" : "bg-muted")}>
                <p className="text-sm">{msg.message}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <MessageCircle className="h-3 w-3 opacity-70" />
                </div>
              </div>
            </div>
          ))}

          {/* Inactive Status */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              User has been inactive more than 24 hours
            </span>
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-green-600">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">WhatsApp</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button size="icon" className="h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Contact Details */}
      <div
        className={cn(
          "w-80 bg-background border-l flex flex-col transition-all duration-300 ease-in-out",
          "xl:relative xl:translate-x-0",
          rightSidebarOpen
            ? "fixed inset-y-0 right-0 z-50 translate-x-0"
            : "fixed inset-y-0 right-0 z-50 translate-x-full xl:translate-x-0",
        )}
      >
        {/* Contact Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="text-lg">S</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">W</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setRightSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <h3 className="font-semibold text-lg">{contactDetails?.name || ''}</h3>
        </div>

        {/* Contact Details */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{contactDetails?.email || ''}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    Edit
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{contactDetails?.phone || ''}</span>
                  {contactDetails?.verified && <div className="h-2 w-2 bg-green-500 rounded-full"></div>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Local time</span>
                <span className="text-sm">{contactDetails?.localTime || ''}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contact</span>
                <span className="text-sm">{contactDetails?.contact || ''}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Country</span>
                <span className="text-sm">{contactDetails?.country || ''}</span>
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>

          {/* Notes Section */}
          <div className="border-t">
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Notes (0)</h4>
              <Button variant="ghost" className="w-full justify-center text-muted-foreground">
                Add New
              </Button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="border-t">
            <div className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-between">
                <span>Media and Files</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <span>Tags</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <span>View executed actions</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {(leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden xl:hidden"
          onClick={() => {
            setLeftSidebarOpen(false)
            setRightSidebarOpen(false)
          }}
        />
      )}
    </div>
  )
}
