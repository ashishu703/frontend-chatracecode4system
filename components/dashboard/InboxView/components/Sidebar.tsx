import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Filter, Search, MessageCircle, ChevronDown, Phone, Globe, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Conversation } from "../types"
import { getChannelIcon, getDefaultUserIcon, generateInitials, isValidAvatar } from "../utils"

interface SidebarProps {
  conversations: Conversation[]
  filteredConversations: Conversation[]
  isLoading: boolean
  selectedConversation: Conversation | null
  setSelectedConversation: (c: Conversation) => void
  leftSidebarOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  showSearch: boolean
  setShowSearch: (v: boolean) => void
  filter: "all" | "pending" | "open" | "solved"
  setFilter: (f: "all" | "pending" | "open" | "solved") => void
  filterPopoverOpen: boolean
  setFilterPopoverOpen: (open: boolean) => void
}

export function Sidebar({
  conversations,
  filteredConversations,
  isLoading,
  selectedConversation,
  setSelectedConversation,
  leftSidebarOpen,
  setLeftSidebarOpen,
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
  filter,
  setFilter,
  filterPopoverOpen,
  setFilterPopoverOpen,
}: SidebarProps) {
  const [showContactModal, setShowContactModal] = React.useState(false)
  const [whatsappNumber, setWhatsappNumber] = React.useState("")
  const [selectedContactOption, setSelectedContactOption] = React.useState("name")

  return (
    <>
      <div
        className={cn(
          "w-[320px] bg-background flex flex-col transition-all duration-300 ease-in-out min-h-full",
          "lg:relative lg:translate-x-0",
          leftSidebarOpen ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with Search and Dropdown */}
        <div className="border-b px-4 py-2">
          <div className="flex items-center justify-end mb-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setLeftSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
                     {/* Search Bar and Name or... Dropdown in same row */}
           <div className="flex items-center gap-2 mb-2">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input 
                 placeholder="Search" 
                 value={searchQuery} 
                 onChange={(e) => setSearchQuery(e.target.value)} 
                 className="pl-10 h-8 bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-green-500"
               />
             </div>
             <Popover>
               <PopoverTrigger asChild>
                 <Button variant="outline" className="h-8 px-3 bg-gray-100 border-0 hover:bg-gray-200 whitespace-nowrap">
                   <span>Name or ...</span>
                   <ChevronDown className="h-4 w-4 ml-1" />
                 </Button>
               </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setSelectedContactOption("name")}>
                    All Name
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setSelectedContactOption("phone")}>
                    Phone
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setSelectedContactOption("messages")}>
                    Messages
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

                     {/* Active Chats and Action Buttons in same row */}
           <div className="flex items-center justify-between mb-1">
             <div className="flex items-center gap-2">
               <span className="text-sm font-semibold text-gray-700">Active Chats</span>
               <ChevronDown className="h-3 w-3 text-gray-500" />
             </div>
             <div className="flex items-center gap-2">
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 hover:bg-gray-200 group"
                     onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
                   >
                     <Filter className="h-4 w-4 text-gray-600 group-hover:text-green-600" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent side="bottom">
                   <p>Filter conversations</p>
                 </TooltipContent>
               </Tooltip>

               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full"
                     onClick={() => setShowContactModal(true)}
                   >
                     <Plus className="h-4 w-4" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent side="bottom">
                   <p>Add new contact</p>
                 </TooltipContent>
               </Tooltip>
             </div>
           </div>

           {/* Chat Count below Active Chats */}
           <div className="mb-1">
             <span className="text-xs text-gray-500">{filteredConversations.length} Chats • {filteredConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)} Unread</span>
           </div>

          {/* Filter Options */}
          {filterPopoverOpen && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {["all", "open", "pending", "solved"].map((f) => (
                  <Button
                    key={f}
                    variant={filter === (f as any) ? "default" : "outline"}
                    size="sm"
                    className="capitalize text-xs h-8"
                    onClick={() => {
                      setFilter(f as any)
                      setFilterPopoverOpen(false)
                    }}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

                 {/* Today Section */}
         <div className="px-4 py-1">
           <span className="text-sm font-semibold text-gray-500">Today</span>
         </div>

        {/* Conversations List */}
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
              <div
                key={conversation.id}
                className={cn(
                  "px-4 py-2 hover:bg-green-50 cursor-pointer border-l-4 transition-all duration-200",
                  selectedConversation?.id === conversation.id 
                    ? "border-l-green-500 bg-green-50" 
                    : "border-l-transparent hover:border-l-green-300"
                )}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  {/* Profile Picture with Platform Icon Overlay */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      {isValidAvatar(conversation.avatar) ? (
                        <AvatarImage 
                          src={conversation.avatar} 
                          alt={conversation.name}
                          onError={(e) => {
                            // Hide the image element to show fallback
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-base font-bold">
                        {generateInitials(conversation.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Platform Icon Overlay */}
                    {conversation.platform && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        {getChannelIcon(conversation.platform)}
                      </div>
                    )}
                  </div>
                  
                                     <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                       <p className="text-sm font-bold truncate text-gray-900">{conversation.name}</p>
                       {conversation.unread_count ? (
                         <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-semibold">{conversation.unread_count > 99 ? '99+' : conversation.unread_count}</span>
                       ) : null}
                     </div>
                     <p className="text-xs text-gray-600 truncate">
                       {typeof conversation.lastMessage === "string"
                         ? conversation.lastMessage
                         : conversation.lastMessage && typeof conversation.lastMessage === "object"
                         ? ((conversation.lastMessage as any).body &&
                           typeof (conversation.lastMessage as any).body === "object" &&
                           (((conversation.lastMessage as any).body as any).text || ((conversation.lastMessage as any).body as any).caption)) ||
                           JSON.stringify((conversation.lastMessage as any).body || conversation.lastMessage)
                         : ""}
                     </p>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact Selection Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">Choose contact</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Direct Input Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <Input
                  placeholder="Please input WhatsApp number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">Or</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                  <Globe className="h-5 w-5 text-gray-600" />
                </div>
                <Input
                  placeholder="Search contact"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => setShowContactModal(false)}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  // Handle contact creation logic here
                  setShowContactModal(false)
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


