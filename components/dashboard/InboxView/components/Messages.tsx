import * as React from "react"
import { Message } from "../types"
import { cn } from "@/lib/utils"
import { MessageCircle } from "lucide-react"
import { MessageContent } from "./MessageContent"

interface MessagesProps {
  messages: Message[]
  isLoadingMessages: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  hasMoreMessages?: boolean
  isLoadingOlderMessages?: boolean
  onLoadOlderMessages?: () => Promise<void>
  isActive?: boolean
}

export function Messages({ 
  messages, 
  isLoadingMessages, 
  messagesEndRef, 
  hasMoreMessages = false,
  isLoadingOlderMessages = false,
  onLoadOlderMessages,
  isActive = true
}: MessagesProps) {
  
  const isEmojiOnly = (text: string | undefined): boolean => {
    if (!text) return false
    const trimmed = text.trim()
    if (!trimmed) return false
    const stripped = trimmed.replace(/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{FE0F}\u{200D}\u{2640}-\u{2642}]/gu, "")
    return stripped === ""
  }

  const groupMessagesByDate = (messages: Message[]): { [key: string]: Message[] } => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach((msg) => {
      const msgDate = extractDateFromTimestamp(msg.timestamp)
      
      if (!groups[msgDate]) {
        groups[msgDate] = []
      }
      groups[msgDate].push(msg)
    })
    
    return groups
  }

  const extractDateFromTimestamp = (timestamp: string): string => {
    const today = new Date()
    const todayStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    const dateMatch = timestamp.match(/(\w+ \d{1,2}, \d{4})/)
    if (dateMatch) {
      return dateMatch[1]
    }
    
    return todayStr
  }

  return (
    <div className="flex-1 permanent-scrollbar p-4 space-y-3 bg-white">
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
        (() => {
          const groupedMessages = groupMessagesByDate(messages)
          
          return Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-3">
              {/* Date Header - Bold and black text */}
              <div className="flex justify-center">
                <span className="text-sm font-bold text-black">
                  {date}
                </span>
              </div>
              
              {/* Messages for this date */}
              {msgs.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("relative w-fit max-w-[75%] xl:max-w-[65%] group", msg.sender === "user" ? "ml-12" : "mr-12")}>
                    {(() => {
                      const emojiOnly = msg.type === "text" && isEmojiOnly(typeof msg.message === 'string' ? msg.message : '')
                      const showBubble = msg.type === "text" && !emojiOnly
                      const isNonTextMessage = msg.type !== "text" || emojiOnly
                      return (
                        <div
                          className={cn(
                            isNonTextMessage 
                              ? "p-0 bg-transparent border-0 w-fit shadow-none rounded-none"
                              : "rounded-2xl shadow-sm break-words overflow-hidden px-3 py-2 w-auto min-w-0",
                            showBubble && (msg.sender === "user"
                              ? "bg-[#d9fdd3] text-gray-900 rounded-br-md"
                              : "bg-gray-100 text-black font-medium rounded-bl-md")
                          )}
                          style={{ maxWidth: '100%' }}
                        >
                          <MessageContent msg={msg} />
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2 -mb-1">
                              {msg.reactions.map((r: any, i: number) => (
                                <span key={i} className="text-sm">{typeof r === 'string' ? r : r?.emoji || r?.reaction || '👍'}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                    
                  </div>
                </div>
              ))}
            </div>
          ))
        })()
      )}
      
      {/* Session Expired Warning */}
      {!isActive && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <span className="text-sm font-medium">Session expired</span>
            <span className="text-xs text-red-600">Please send a Meta-approved template to continue</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}