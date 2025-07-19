import React from "react"
import { Card } from "@/components/ui/card"
import { MessageSquare, ImageIcon, CreditCard, Video, List, Mic, FileText, Gift, Clock, Paperclip, Workflow, Eye, ShoppingCart, MapPin } from "lucide-react"

interface NodeContentPreviewProps {
  state: any
  selectedContentType: string
}

export const NodeContentPreview: React.FC<NodeContentPreviewProps> = ({ state, selectedContentType }) => {
  switch (selectedContentType) {
    case "text":
      return (
        <Card className="p-4 flex flex-col gap-2 border border-blue-200 bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span className="text-gray-800">{state.message || <span className="text-gray-400">No message</span>}</span>
          </div>
          {Array.isArray(state.textButtons) && state.textButtons.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Options:</div>
              <div className="flex flex-col gap-1">
                {state.textButtons.map((btn: any, idx: number) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input type="radio" name="preview-text-radio" disabled />
                    <span className="text-gray-700 text-sm">{btn.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>
      )
    case "image":
      return (
        <Card className="p-8 flex flex-col items-center border border-blue-200 bg-white rounded">
          <div className="w-full h-20 flex items-center justify-center overflow-hidden rounded">
            {state.imageUrl ? (
              <img src={state.imageUrl} alt="preview" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <ImageIcon className="h-8 w-8 text-blue-300 mb-1" />
                <span className="text-gray-400 text-lg">No image</span>
              </div>
            )}
          </div>
          {Array.isArray(state.imageButtons) && state.imageButtons.length > 0 && (
            <div className="mt-2 w-full">
              <div className="text-xs text-gray-500 mb-1">Options:</div>
              <div className="flex flex-col gap-1">
                {state.imageButtons.map((btn: any, idx: number) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input type="radio" name="preview-image-radio" disabled />
                    <span className="text-gray-700 text-sm">{btn.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>
      )
    case "card":
      return (
        <Card className="p-4 border border-blue-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-gray-800">{state.cardTitle || <span className="text-gray-400">No title</span>}</span>
          </div>
          {state.cardSubtitle && <div className="text-gray-600 text-sm mb-2">{state.cardSubtitle}</div>}
          {state.cardImageUrl && (
            <img src={state.cardImageUrl} alt="card" className="h-20 w-full object-cover rounded-lg border" />
          )}
          {Array.isArray(state.cardButtons) && state.cardButtons.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Options:</div>
              <div className="flex flex-col gap-1">
                {state.cardButtons.map((btn: any, idx: number) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input type="radio" name="preview-card-radio" disabled />
                    <span className="text-gray-700 text-sm">{btn.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>
      )
    case "video":
      return (
        <Card className="p-0 flex flex-col items-center border border-blue-200 bg-white rounded">
          <div className="w-full h-36 flex items-center justify-center overflow-hidden rounded">
            {state.videoUrl ? (
              <video src={state.videoUrl} controls className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Video className="h-8 w-8 text-blue-300 mb-1" />
                <span className="text-gray-400 text-lg">No video</span>
              </div>
            )}
          </div>
          {state.quickReply && <div className="mt-2 text-xs text-blue-700">Quick Reply: {state.quickReply}</div>}
          {Array.isArray(state.videoButtons) && state.videoButtons.length > 0 && (
            <div className="mt-2 w-full">
              <div className="text-xs text-gray-500 mb-1">Options:</div>
              <div className="flex flex-col gap-1">
                {state.videoButtons.map((btn: any, idx: number) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input type="radio" name="preview-video-radio" disabled />
                    <span className="text-gray-700 text-sm">{btn.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>
      )
    case "audio":
      return (
        <Card className="p-4 flex flex-col items-center border border-blue-200 bg-white">
          <Mic className="h-5 w-5 text-blue-500 mb-2" />
          {state.audioUrl ? (
            <audio src={state.audioUrl} controls className="w-full" />
          ) : (
            <span className="text-gray-400">No audio</span>
          )}
          {Array.isArray(state.audioButtons) && state.audioButtons.length > 0 && (
            <div className="mt-2 w-full">
              <div className="text-xs text-gray-500 mb-1">Options:</div>
              <div className="flex flex-col gap-1">
                {state.audioButtons.map((btn: any, idx: number) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input type="radio" name="preview-audio-radio" disabled />
                    <span className="text-gray-700 text-sm">{btn.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>
      )
    case "optionsList":
      return (
        <Card className="p-4 border border-blue-200 bg-white">
          <List className="h-5 w-5 text-blue-500 mb-2" />
          <div className="text-gray-800">Options List Preview</div>
        </Card>
      )
    case "gif":
      return (
        <Card className="p-0 flex flex-col items-center border border-blue-200 bg-white rounded">
          <div className="w-full h-36 flex items-center justify-center overflow-hidden rounded">
            {state.gifUrl ? (
              <img src={state.gifUrl} alt="gif" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Gift className="h-8 w-8 text-blue-300 mb-1" />
                <span className="text-gray-400 text-lg">No GIF</span>
              </div>
            )}
          </div>
          {state.gifQuickReply && <div className="mt-2 text-xs text-blue-700">Quick Reply: {state.gifQuickReply}</div>}
          {Array.isArray(state.gifButtons) && state.gifButtons.length > 0 && (
            <div className="mt-2 w-full">
              <div className="text-xs text-gray-500 mb-1">Options:</div>
              <div className="flex flex-col gap-1">
                {state.gifButtons.map((btn: any, idx: number) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input type="radio" name="preview-gif-radio" disabled />
                    <span className="text-gray-700 text-sm">{btn.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>
      )
    case "requestFile":
      return (
        <Card className="p-4 border border-blue-200 bg-white">
          <FileText className="h-5 w-5 text-blue-500 mb-2" />
          <div className="text-gray-800">{state.fileRequestMessage || "Request a file from user."}</div>
          <div className="text-xs text-gray-500 mt-1">Type: {state.fileType || "Any"}</div>
        </Card>
      )
    case "typingNotification":
      return (
        <Card className="p-4 border border-blue-200 bg-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <span className="text-gray-800">Typing for {state.typingDuration || 2} seconds...</span>
        </Card>
      )
    case "whatsappFlows":
      return (
        <Card className="p-4 border border-blue-200 bg-white">
          <Workflow className="h-5 w-5 text-blue-500 mb-2" />
          <div className="font-bold text-gray-800">{state.flowName || "Flow Name"}</div>
          <div className="text-xs text-gray-500">ID: {state.flowId || "-"}</div>
        </Card>
      )
    case "viewCatalog":
      return (
        <Card className="p-4 border border-blue-200 bg-white">
          <Eye className="h-5 w-5 text-blue-500 mb-2" />
          <div className="font-bold text-gray-800">{state.catalogName || "Catalog Name"}</div>
          <div className="text-xs text-gray-500">{state.catalogDescription || "No description"}</div>
        </Card>
      )
    case "sendProducts":
      return (
        <Card className="p-4 border border-blue-200 bg-white">
          <ShoppingCart className="h-5 w-5 text-blue-500 mb-2" />
          <div className="font-bold text-gray-800">Product IDs: {state.productIds || "-"}</div>
          <div className="text-xs text-gray-500">{state.productMessage || "No message"}</div>
        </Card>
      )
    case "location":
      return (
        <Card className="p-4 border border-blue-200 bg-white">
          <MapPin className="h-5 w-5 text-blue-500 mb-2" />
          <div className="font-bold text-gray-800">{state.locationName || "Location"}</div>
          <div className="text-xs text-gray-500">Lat: {state.latitude || "-"}, Lng: {state.longitude || "-"}</div>
        </Card>
      )
    default:
      return (
        <Card className="p-4 border border-gray-200 bg-white text-center text-gray-400">
          No preview available for this content type.
        </Card>
      )
  }
} 