"use client"

import { useRef, useState } from "react"
import { Plus, Trash2, Smile, Bold, Italic, Strikethrough, Image as ImageIcon, Video as VideoIcon, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WhatsAppPreview } from "./whatsapp-preview"
import { Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'

interface ButtonConfig {
  id: string
  type: string
  text: string
  url?: string
  phone?: string
  variable?: string
  mediaUrl?: string 
}

export function BroadcastTemplateBuilder() {
  const [templateName, setTemplateName] = useState("test")
  const [category, setCategory] = useState("Marketing")
  const [language, setLanguage] = useState("English")
  const [broadcastType, setBroadcastType] = useState<"None"|"Text"|"Image"|"Video"|"Document">("Image")
  // Header inputs for Text/Image/Video/Document
  const [headerText, setHeaderText] = useState("")
  const [headerUrl, setHeaderUrl] = useState("")
  const [bodyText, setBodyText] = useState(`Hello {{name}},`)
  const [footerText, setFooterText] = useState("")
  const [buttons, setButtons] = useState<ButtonConfig[]>([
    { id: "1", type: "Call to action", text: "Call to action" },
  ])

  // Catalog ID toggle
  const [showCatalogId, setShowCatalogId] = useState(false)
  const [catalogId, setCatalogId] = useState("")

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const addButton = () => {
    if (buttons.length < 2) {
      const newButton: ButtonConfig = {
        id: Date.now().toString(),
        type: "Call to action",
        text: "Call to action",
      }
      setButtons([...buttons, newButton])
    }
  }

  const removeButton = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id))
  }

  const updateButton = (id: string, field: string, value: string) => {
    setButtons(
      buttons.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  const insertEmoji = (emoji: string) => {
    const textarea = bodyTextareaRef.current
    if (!textarea) {
      setBodyText(prev => prev + emoji)
      return
    }
    const start = textarea.selectionStart ?? bodyText.length
    const end = textarea.selectionEnd ?? bodyText.length
    const before = bodyText.slice(0, start)
    const after = bodyText.slice(end)
    const next = `${before}${emoji}${after}`
    setBodyText(next)
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      textarea.focus()
    })
  }

  const getCharacterCount = (text: string, max: number) => {
    const len = String(text || "").length
    return `${len}/${max}`
  }

  const wrapSelection = (startToken: string, endToken?: string) => {
    const textarea = bodyTextareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    const selected = bodyText.slice(start, end)
    const before = bodyText.slice(0, start)
    const after = bodyText.slice(end)
    const close = endToken ?? startToken
    const next = `${before}${startToken}${selected}${close}${after}`
    setBodyText(next)
    requestAnimationFrame(() => {
      const cursor = start + startToken.length + selected.length + close.length
      textarea.selectionStart = textarea.selectionEnd = cursor
      textarea.focus()
    })
  }

  return (
    <div className="relative h-screen overflow-hidden bg-gray-50 pr-80">
      {/* Main Content (scrollable) */}
      <div className="p-6 h-screen overflow-y-auto">
        {/* Template Details */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Utility">Utility</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Catalog ID toggle */}
        <div className="mb-8 flex items-center gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showCatalogId}
              onChange={() => setShowCatalogId(!showCatalogId)}
              className="w-4 h-4 text-green-600"
            />
            <span className="text-sm text-gray-700">Include Catalog ID (optional)</span>
          </label>
          {showCatalogId && (
            <Input
              value={catalogId}
              onChange={(e) => setCatalogId(e.target.value)}
              placeholder="Catalog ID"
              className="w-48"
            />
          )}
        </div>

        {/* Broadcast Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">Broadcast title</h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Highlight your brand here, use images or videos, to stand out</p>
          <div className="flex gap-6">
            {["None", "Text", "Image", "Video", "Document"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="broadcastType"
                  value={type}
                  checked={broadcastType === type}
                  onChange={(e) => setBroadcastType(e.target.value as "None"|"Text"|"Image"|"Video"|"Document")}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
          {/* Header inputs */}
          <div className="mt-4">
            {broadcastType === "Text" && (
              <Input
                placeholder="Header text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                className="w-full"
              />
            )}
            {broadcastType === "Image" && (
              <div className="flex items-center gap-3">
                <Input
                  placeholder="https://.../image.png"
                  value={headerUrl}
                  onChange={(e) => setHeaderUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" className="bg-transparent">
                  <ImageIcon className="w-4 h-4 mr-2" />Upload Media
                </Button>
              </div>
            )}
            {broadcastType === "Video" && (
              <div className="flex items-center gap-3">
                <Input
                  placeholder="https://.../video.mp4"
                  value={headerUrl}
                  onChange={(e) => setHeaderUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" className="bg-transparent">
                  <VideoIcon className="w-4 h-4 mr-2" />Upload Media
                </Button>
              </div>
            )}
            {broadcastType === "Document" && (
              <div className="flex items-center gap-3">
                <Input
                  placeholder="https://.../file.pdf"
                  value={headerUrl}
                  onChange={(e) => setHeaderUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" className="bg-transparent">
                  <File className="w-4 h-4 mr-2" />Upload Media
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-900">Body</h2>
            {/* Variable Button */}
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-500 hover:bg-green-50 bg-transparent"
              onClick={() => {
                const variableName = prompt("Enter variable name (e.g., name)")
                if (variableName) {
                  setBodyText(prev => prev + ` {{${variableName}}}`)
                }
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Variable
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Make your messages personal using variables like <span className="text-green-600">{"{{name}}"}</span> and get more replies!
          </p>

          {/* Text Editor Toolbar */}
          <div className="flex items-center gap-2 mb-2 p-2 border-b border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection("*", "*")}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection("_", "_")}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => wrapSelection("~", "~")}>
              <Strikethrough className="w-4 h-4" />
            </Button>
            <div className="ml-auto text-sm text-gray-500">{getCharacterCount(bodyText, 1024)}</div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute z-10">
              <Picker
                onSelect={(emoji: any) => {
                  if (emoji && typeof emoji.native === 'string') {
                    insertEmoji(emoji.native)
                  }
                  setShowEmojiPicker(false)
                }}
              />
            </div>
          )}

          {/* Single Textarea for Body */}
          <Textarea
            ref={bodyTextareaRef}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="min-h-[120px] resize-none border border-gray-200 p-3"
            placeholder="Template Message..."
          />
        </div>

        {/* Footer */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">Footer</h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Footers are great to add any disclaimers or to add a thoughtful PS
          </p>
          <div className="relative">
            <Textarea
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <div className="absolute bottom-2 right-2 text-sm text-gray-500">{getCharacterCount(footerText, 60)}</div>
          </div>
        </div>
        

        {/* Buttons */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-medium text-gray-900">Buttons</h2>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Create up to 2 buttons that let customers respond to your message or take action.
          </p>

          <div className="space-y-4">
            {buttons.map((button) => (
              <div key={button.id} className="flex items-center gap-4">
                <Select value={button.type} onValueChange={(value) => updateButton(button.id, "type", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call to action">Call to action</SelectItem>
                    <SelectItem value="Visit Website">Visit Website</SelectItem>
                    <SelectItem value="Dynamic">Dynamic</SelectItem>
                    <SelectItem value="Call Phone">Call Phone</SelectItem>
                  </SelectContent>
                </Select>

                {/* Button label */}
                <Input
                  value={button.text}
                  onChange={(e) => updateButton(button.id, "text", e.target.value)}
                  placeholder="Button label"
                  className="w-48"
                />

                {button.type === "Call Phone" ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1">
                      <Input
                        value={button.phone || ""}
                        onChange={(e) => updateButton(button.id, "phone", e.target.value)}
                        placeholder="Phone number"
                        className="pr-12"
                      />
                      <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                        {getCharacterCount(button.phone || "", 20)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">+91</span>
                      <div className="text-xs text-gray-500">3/20</div>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex-1">
                    <Input
                      value={button.url || ""}
                      onChange={(e) => updateButton(button.id, "url", e.target.value)}
                      placeholder="Enter URL"
                      className={`pr-16 ${button.type === "Visit Website" ? "border-red-300" : ""}`}
                    />
                    <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                      {button.type === "Dynamic" ? "31/2000" : "31/20"}
                    </div>
                  </div>
                )}

                {/* Media URL for Video/Document */}
                {broadcastType !== "Text" && (
                  <Input
                    placeholder="Media URL"
                    value={button.mediaUrl || ""}
                    onChange={(e) => updateButton(button.id, "mediaUrl", e.target.value)}
                    className="w-48"
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeButton(button.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {buttons.length < 2 && (
              <Button
                variant="outline"
                onClick={addButton}
                className="w-full border-dashed border-gray-300 text-gray-600 hover:border-gray-400 bg-transparent"
              >
                Add button
              </Button>
            )}
          </div>
        </div>

        {/* Page actions at bottom (scroll with page) */}
        <div className="flex justify-end gap-3 mt-10">
          <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent">Save as draft</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">Save and submit</Button>
        </div>
      </div>
      

      {/* Preview Panel (fixed) */}
      <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 p-4 overflow-hidden">
        <WhatsAppPreview
          headerType={broadcastType}
          headerText={headerText}
          headerUrl={headerUrl}
          catalogEnabled={showCatalogId}
          catalogId={catalogId}
          bodyText={bodyText}
          footerText={footerText}
          buttons={buttons}
        />
      </div>
    </div>
  )
}