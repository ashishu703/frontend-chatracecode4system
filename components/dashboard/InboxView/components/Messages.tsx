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
  const isExpired = (remainingSeconds !== undefined && remainingSeconds <= 0) || !isActive
  return (
    <div className="flex-1 permanent-scrollbar p-4 space-y-3 bg-[#f0f2f5]">
      {/* Removed Load older messages button as requested */}
      
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
            <div className={cn("relative max-w-[80%] xl:max-w-[70%] group", msg.sender === "user" ? "ml-12" : "mr-12")}>
              {(() => {
                const isMedia = msg.type === "image" || msg.type === "video" || msg.type === "gif"
                return (
                  <div
                    className={cn(
                      "rounded-2xl shadow-sm",
                      isMedia
                        ? "p-0 bg-transparent border-0"
                        : "px-3 py-2",
                      !isMedia && (msg.sender === "user"
                        ? "bg-[#d9fdd3] text-gray-900 rounded-br-md"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-md")
                    )}
                  >
                <MessageContent msg={msg} />
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2 -mb-1">
                    {msg.reactions.map((r: any, i: number) => (
                      <span key={i} className="text-sm bg-white rounded-full px-1 shadow-sm">{r.emoji}</span>
                    ))}
                  </div>
                )}
                  </div>
                )
              })()}
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 px-2 text-[10px] text-gray-500",
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


