"use client"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ButtonConfig {
  id: string
  type: string
  text: string
  url?: string
  phone?: string
}

interface WhatsAppPreviewProps {
  headerType?: "None"|"Text"|"Image"|"Video"|"Document"
  headerText?: string
  headerUrl?: string
  catalogEnabled?: boolean
  catalogId?: string
  bodyText: string
  footerText: string
  buttons: ButtonConfig[]
}

export function WhatsAppPreview({ headerType = "None", headerText = "", headerUrl = "", catalogEnabled = false, catalogId = "", bodyText, footerText, buttons }: WhatsAppPreviewProps) {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* Phone Preview */}
      <div className="relative">
        <div className="w-80 h-[600px] bg-white rounded-[2.5rem] shadow-2xl border-8 border-gray-200 overflow-hidden">
          {/* WhatsApp Header */}
          <div className="bg-[#128C7E] h-20 flex items-end pb-3 px-4">
            <div className="w-full h-8"></div>
          </div>
          
          {/* Message Content */}
          <div className="bg-[#ECE5DD] h-full relative overflow-hidden">
            {/* Security Notice */}
            <div className="flex items-center justify-center py-2 px-4">
              <div className="bg-gray-300 rounded-lg px-3 py-1 flex items-center text-xs text-gray-600">
                <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center mr-2 text-white font-bold text-xs">
                  i
                </div>
                This business uses a secure service from Meta to manage this chat. Tap to learn more
              </div>
            </div>
            
            {/* Message Bubble */}
            <div className="px-4 py-2">
              <div className="bg-white rounded-lg p-3 max-w-[280px] shadow-sm">
                {/* Optional header */}
                {headerType !== "None" && (
                  <div className="mb-2">
                    {headerType === "Text" && (
                      <div className="text-xs text-gray-700 font-semibold">{headerText}</div>
                    )}
                    {headerType === "Image" && headerUrl && (
                      <img src={headerUrl} alt="header" className="w-full h-32 object-cover rounded" />
                    )}
                    {headerType === "Video" && headerUrl && (
                      <div className="w-full">
                        <video src={headerUrl} controls className="w-full rounded" />
                      </div>
                    )}
                    {headerType === "Document" && headerUrl && (
                      <a href={headerUrl} target="_blank" className="text-blue-600 text-xs underline">View document</a>
                    )}
                  </div>
                )}
                <div className="text-gray-800 text-sm whitespace-pre-wrap mb-1">
                  {String(bodyText || "")}
                </div>
                {/* Catalog preview */}
                {catalogEnabled && (
                  <div className="mt-2 border rounded p-2 bg-gray-50">
                    <div className="text-xs text-gray-700 font-semibold">Catalog</div>
                    <div className="text-[10px] text-gray-500">ID: {catalogId || "preview"}</div>
                    <div className="mt-1 h-16 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-600">Catalog preview</div>
                  </div>
                )}
                {footerText && (
                  <div className="text-gray-500 text-xs mt-2">
                    {String(footerText)}
                  </div>
                )}
                <div className="text-gray-400 text-xs mt-1 text-right">
                  13:22
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {buttons && buttons.length > 0 && (
              <div className="px-4 pb-4">
                {buttons.slice(0, 2).map((button) => (
                  <Button
                    key={button.id}
                    variant="outline"
                    className="w-full mb-2 justify-start text-blue-600 border-blue-600 hover:bg-blue-50 text-sm h-10"
                  >
                    {button.type === "Call Phone" ? (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        {String(button.phone || "")}
                      </>
                    ) : (
                      <>
                        🔗
                        <span className="ml-2">
                          {String(button.url || "")}
                        </span>
                      </>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          {/* Chat Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <div className="flex-1 text-gray-500 text-sm"></div>
              <div className="flex items-center space-x-2 text-gray-400">
                <span>📎</span>
                <span>😊</span>
                <span>🎤</span>
              </div>
            </div>
          </div>
          
          {/* WhatsApp Icon */}
          
        </div>
      </div>
    </div>
  )
}