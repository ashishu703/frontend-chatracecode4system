import * as React from "react"
import { Button } from "@/components/ui/button"
import { Mic, FileText, File, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Message } from "../types"

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+)?)/gi
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
          {part}
        </a>
      )
    }
    return <span key={i} className="break-all">{part}</span>
  })
}

function renderStructuredText(text: string | any) {
  if (typeof text !== 'string') return text
  
  // Split by newlines to handle line breaks
  const lines = text.split('\n')
  
  return (
    <div className="w-fit">
      {lines.map((line, i) => {
        // Check if line starts with list markers
        if (line.trim().match(/^[-*•]\s/)) {
          return (
            <div key={i} className="flex items-start gap-2 mb-1">
              <span className="text-gray-500 mt-1">•</span>
              <span className="break-words">{line.trim().replace(/^[-*•]\s/, '')}</span>
            </div>
          )
        }
        
        // Check if line starts with numbered list
        if (line.trim().match(/^\d+\.\s/)) {
          const number = line.trim().match(/^(\d+)\.\s/)?.[1] || '1'
          return (
            <div key={i} className="flex items-start gap-2 mb-1">
              <span className="text-gray-500 mt-1 text-xs">{number}.</span>
              <span className="break-words">{line.trim().replace(/^\d+\.\s/, '')}</span>
            </div>
          )
        }
        
        // Regular text line
        return (
          <div key={i} className="break-words mb-1 last:mb-0">
            {line}
          </div>
        )
      })}
    </div>
  )
}

export function MessageContent({ msg }: { msg: Message }) {
  if (msg.type === "image" && msg.body && typeof msg.body === "object" && (msg.body as any).url) {
    const body: any = msg.body
    return (
      <div className="max-w-[600px]">
        <img
          src={body.url || "/placeholder.svg"}
          alt="Image"
          className="block w-full max-w-[600px] max-h-[250px] object-contain cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
          onClick={() => window.open(body.url, "_blank")}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = "/placeholder.svg"
          }}
        />
        {body.caption && <p className="mt-2 text-sm break-all whitespace-pre-wrap">{body.caption}</p>}
      </div>
    )
  } else if (msg.type === "video" && msg.body && typeof msg.body === "object" && (msg.body as any).url) {
    const body: any = msg.body
    return (
      <div className="max-w-[380px]">
        <video src={body.url} controls className="w-full max-w-[380px] max-h-[400px] rounded-lg object-contain" />
        {body.caption && <p className="mt-2 text-sm break-all whitespace-pre-wrap">{body.caption}</p>}
      </div>
    )
  } else if (msg.type === "audio" && msg.body && typeof msg.body === "object" && (msg.body as any).url) {
    const body: any = msg.body
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg w-fit">
        <Mic className="h-4 w-4 flex-shrink-0" />
        <audio src={body.url} controls className="w-auto min-w-[200px]" />
      </div>
    )
  } else if (msg.type === "file" && msg.body && typeof msg.body === "object" && (msg.body as any).url) {
    const body: any = msg.body
    const fileName = body.filename || body.caption || "Document"
    const fileSize = body.filesize || ""
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer w-fit"
        onClick={() => window.open(body.url, "_blank")}
      >
        <div className="flex-shrink-0">
          {fileName.toLowerCase().includes(".pdf") ? (
            <FileText className="h-6 w-6 text-red-600" />
          ) : fileName.toLowerCase().includes(".doc") || fileName.toLowerCase().includes(".docx") ? (
            <FileText className="h-6 w-6 text-blue-600" />
          ) : fileName.toLowerCase().includes(".xlsx") || fileName.toLowerCase().includes(".csv") ? (
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
    )
  } else if (msg.type === "carousel" && (msg.body as any)?.elements) {
    const body: any = msg.body
    return (
      <div className="space-y-2">
        {body.elements.map((element: any, index: number) => (
          <div key={index} className="rounded-lg p-3">
            {element.image_url && (
              <img src={element.image_url} alt={element.title || "Carousel item"} className="w-full h-32 object-cover rounded mb-2" />
            )}
            {element.title && <h4 className="font-medium text-sm mb-1">{element.title}</h4>}
            {element.subtitle && <p className="text-xs text-gray-600 mb-2">{element.subtitle}</p>}
            {element.buttons && element.buttons.length > 0 && (
              <div className="space-y-1">
                {element.buttons.map((button: any, btnIndex: number) => (
                  <Button
                    key={btnIndex}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      toast({ title: `Carousel button clicked: ${button.title}` })
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
    )
  } else if (msg.type === "interactive" && msg.buttons && msg.buttons.length > 0) {
    return (
      <div className="space-y-3">
        {msg.message && renderStructuredText(msg.message)}
        <div className="grid grid-cols-2 gap-2">
          {(msg.buttons || []).map((button: any, index: number) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`justify-center text-center h-auto py-2 px-3 text-sm font-normal border-gray-300 hover:bg-gray-50 ${
                index === (msg.buttons || []).length - 1 && (msg.buttons || []).length % 2 === 1 ? 'col-span-2' : ''
              }`}
              onClick={() => {
                toast({ title: `Button clicked: ${button.text || button.title}` })
              }}
            >
              {button.text || button.title || `Button ${index + 1}`}
            </Button>
          ))}
        </div>
      </div>
    )
  } else if (msg.type === "gif" && msg.body && typeof msg.body === "object" && (msg.body as any).url) {
    const body: any = msg.body
    return (
      <div className="max-w-[380px]">
        <img src={body.url} alt="GIF" className="w-full max-w-[380px] max-h-[400px] object-contain rounded-lg" />
        {body.caption && <p className="mt-2 text-sm break-all whitespace-pre-wrap">{body.caption}</p>}
      </div>
    )
  }
  return (
    <div className="text-sm leading-relaxed break-words whitespace-pre-wrap w-fit">
      {(() => {
        const text = String(msg.message || "")
        const emojiOnly = (() => {
          const trimmed = text.trim()
          if (!trimmed) return false
          const stripped = trimmed.replace(/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{FE0F}\u{200D}\u{2640}-\u{2642}]/gu, "")
          return stripped === ""
        })()
        if (emojiOnly) {
          return <span className="text-3xl leading-none select-none">{text}</span>
        }
        return renderStructuredText(text)
      })()}
    </div>
  )
}


