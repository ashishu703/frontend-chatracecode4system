import * as React from "react"
import { Message } from "../types"
import { cn } from "@/lib/utils"
import { CheckCheck, Check, MessageCircle, AlertTriangle } from "lucide-react"
import { MessageContent } from "./MessageContent"

interface MessagesProps {
  messages: Message[]
  isLoadingMessages: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  remainingSeconds?: number
  hasMoreMessages?: boolean
  isLoadingOlderMessages?: boolean
  onLoadOlderMessages?: () => Promise<void>
  isActive?: boolean
}

export function Messages({ 
  messages, 
  isLoadingMessages, 
  messagesEndRef, 
  remainingSeconds,
  hasMoreMessages = false,
  isLoadingOlderMessages = false,
  onLoadOlderMessages,
  isActive = true
}: MessagesProps) {
  
  const isExpired = (remainingSeconds !== undefined && remainingSeconds <= 0)
  const isEmojiOnly = (text: string | undefined): boolean => {
    if (!text) return false
    const trimmed = text.trim()
    if (!trimmed) return false
    const stripped = trimmed.replace(/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{FE0F}\u{200D}\u{2640}-\u{2642}]/gu, "")
    return stripped === ""
  }
  return (
    <div className="flex-1 permanent-scrollbar p-4 space-y-3 bg-[#f0f2f5]">
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
        messages.map((msg) => (
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
                        : "rounded-2xl shadow-sm break-words overflow-hidden px-3 py-2 w-fit min-w-0",
                      showBubble && (msg.sender === "user"
                        ? "bg-[#d9fdd3] text-gray-900 rounded-br-md"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-md")
                    )}
                    style={{ width: 'fit-content', maxWidth: '100%' }}
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
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 text-[10px] text-gray-500",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === "user" && (
                  <div className="flex items-center">
                    {msg.status === "read" ? (
                      <CheckCheck className="h-3 w-3 text-green-600" />
                    ) : msg.status === "delivered" || msg.status === "sent" ? (
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
      
      {/* Expired Warning - Now below messages in red */}
      {isExpired && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Session expired</span>
            <span className="text-xs text-red-600">Please send a Meta-approved template to continue</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}


