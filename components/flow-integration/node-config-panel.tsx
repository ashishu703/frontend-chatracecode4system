"use client"
import type { Node } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  X,
  Plus,
  MessageSquare,
  ImageIcon,
  CreditCard,
  RotateCcw,
  Mic,
  Database,
  Video,
  List,
  FileText,
  Zap,
  Phone,
  MapPin,
  ShoppingCart,
  Workflow,
  Eye,
  Gift,
  Edit,
  Save,
  DeleteIcon as Cancel,
  Upload,
  Clock,
  Paperclip,
} from "lucide-react"
import type { NodeData } from "@/types/flow-integration/flow"
import { useNodeContext } from "./node-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { NodeContentPreview } from "./NodeContentPreview"

interface NodeConfigPanelProps {
  node: Node<any>
  onClose: () => void
}

export function NodeConfigPanel({ node, onClose }: NodeConfigPanelProps) {
  const { updateNode } = useNodeContext()
  const state = node.data.data.state ?? {}
  const [selectedMessageType, setSelectedMessageType] = useState(state.messageType || "omnichannel")
  const [selectedContentType, setSelectedContentType] = useState(state.contentType || "")
  const [showContentOptions, setShowContentOptions] = useState(false)
  const [textButtonInput, setTextButtonInput] = useState("")
  // --- Fix: use local state for textButtons and sync with node state ---
  const [textButtons, setTextButtons] = useState<{ name: string }[]>(state.textButtons ?? [])
  const [imageButtonInput, setImageButtonInput] = useState("")
  const [cardButtonInput, setCardButtonInput] = useState("")
  const [audioButtonInput, setAudioButtonInput] = useState("")
  const [videoButtonInput, setVideoButtonInput] = useState("")
  const [gifButtonInput, setGifButtonInput] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingField, setEditingField] = useState("")

  // Add local state for all button types and sync with node state
  const [imageButtons, setImageButtons] = useState<{ name: string }[]>(state.imageButtons ?? [])
  const [cardButtons, setCardButtons] = useState<{ name: string }[]>(state.cardButtons ?? [])
  const [audioButtons, setAudioButtons] = useState<{ name: string }[]>(state.audioButtons ?? [])
  const [videoButtons, setVideoButtons] = useState<{ name: string }[]>(state.videoButtons ?? [])
  const [gifButtons, setGifButtons] = useState<{ name: string }[]>(state.gifButtons ?? [])

  useEffect(() => {
    setTextButtons(state.textButtons ?? [])
  }, [state.textButtons])
  useEffect(() => {
    setImageButtons(state.imageButtons ?? [])
  }, [state.imageButtons])
  useEffect(() => {
    setCardButtons(state.cardButtons ?? [])
  }, [state.cardButtons])
  useEffect(() => {
    setAudioButtons(state.audioButtons ?? [])
  }, [state.audioButtons])
  useEffect(() => {
    setVideoButtons(state.videoButtons ?? [])
  }, [state.videoButtons])
  useEffect(() => {
    setGifButtons(state.gifButtons ?? [])
  }, [state.gifButtons])

  // Add/Remove handlers for each type
  const handleAddTextButton = () => {
    if (textButtonInput.trim()) {
      const newButtons = [...textButtons, { name: textButtonInput.trim() }]
      setTextButtons(newButtons)
      updateNodeData({ textButtons: newButtons })
      setTextButtonInput("")
    }
  }
  const handleRemoveTextButton = (idx: number) => {
    const newButtons = textButtons.filter((_, i) => i !== idx)
    setTextButtons(newButtons)
    updateNodeData({ textButtons: newButtons })
  }
  // Update both local and node state when adding/removing for all types
  const handleAddImageButton = () => {
    if (imageButtonInput.trim()) {
      const newButtons = [...imageButtons, { name: imageButtonInput.trim() }]
      setImageButtons(newButtons)
      updateNodeData({ imageButtons: newButtons })
      setImageButtonInput("")
    }
  }
  const handleRemoveImageButton = (idx: number) => {
    const newButtons = imageButtons.filter((_, i) => i !== idx)
    setImageButtons(newButtons)
    updateNodeData({ imageButtons: newButtons })
  }
  const handleAddCardButton = () => {
    if (cardButtonInput.trim()) {
      const newButtons = [...cardButtons, { name: cardButtonInput.trim() }]
      setCardButtons(newButtons)
      updateNodeData({ cardButtons: newButtons })
      setCardButtonInput("")
    }
  }
  const handleRemoveCardButton = (idx: number) => {
    const newButtons = cardButtons.filter((_, i) => i !== idx)
    setCardButtons(newButtons)
    updateNodeData({ cardButtons: newButtons })
  }
  const handleAddAudioButton = () => {
    if (audioButtonInput.trim()) {
      const newButtons = [...audioButtons, { name: audioButtonInput.trim() }]
      setAudioButtons(newButtons)
      updateNodeData({ audioButtons: newButtons })
      setAudioButtonInput("")
    }
  }
  const handleRemoveAudioButton = (idx: number) => {
    const newButtons = audioButtons.filter((_, i) => i !== idx)
    setAudioButtons(newButtons)
    updateNodeData({ audioButtons: newButtons })
  }
  const handleAddVideoButton = () => {
    if (videoButtonInput.trim()) {
      const newButtons = [...videoButtons, { name: videoButtonInput.trim() }]
      setVideoButtons(newButtons)
      updateNodeData({ videoButtons: newButtons })
      setVideoButtonInput("")
    }
  }
  const handleRemoveVideoButton = (idx: number) => {
    const newButtons = videoButtons.filter((_, i) => i !== idx)
    setVideoButtons(newButtons)
    updateNodeData({ videoButtons: newButtons })
  }
  const handleAddGifButton = () => {
    if (gifButtonInput.trim()) {
      const newButtons = [...gifButtons, { name: gifButtonInput.trim() }]
      setGifButtons(newButtons)
      updateNodeData({ gifButtons: newButtons })
      setGifButtonInput("")
    }
  }
  const handleRemoveGifButton = (idx: number) => {
    const newButtons = gifButtons.filter((_, i) => i !== idx)
    setGifButtons(newButtons)
    updateNodeData({ gifButtons: newButtons })
  }

  // --- Add handleFileUpload function ---
  const handleFileUpload = (file: File, type: string) => {
    const url = URL.createObjectURL(file)
    switch (type) {
      case "image":
        updateNodeData({ imageUrl: url })
        break
      case "cardImage":
        updateNodeData({ cardImageUrl: url })
        break
      case "audio":
        updateNodeData({ audioUrl: url })
        break
      case "video":
        updateNodeData({ videoUrl: url })
        break
      case "gif":
        updateNodeData({ gifUrl: url })
        break
      default:
        break
    }
  }

  const messageTypes = [
    "omnichannel",
    "facebook",
    "whatsapp",
    "messenger",
    "webchat",
    "instagram",
    "instagram comment auto reply",
    "facebook comment auto reply",
  ]

  const contentTypes = [
    { value: "text", label: "Text", icon: MessageSquare },
    { value: "image", label: "Image", icon: ImageIcon },
    { value: "card", label: "Card", icon: CreditCard },
    { value: "carousel", label: "Carousel", icon: RotateCcw },
    { value: "audio", label: "Audio", icon: Mic },
    { value: "getUserData", label: "Get User Data", icon: Database },
    { value: "video", label: "Video", icon: Video },
    { value: "optionsList", label: "Options List", icon: List },
    { value: "videoTemplate", label: "Video Template", icon: Video },
    { value: "messagePro", label: "Message Pro", icon: MessageSquare },
    { value: "gif", label: "GIF", icon: Gift },
    { value: "typingNotification", label: "Typing Notification", icon: MessageSquare },
    { value: "requestFile", label: "Request File", icon: FileText },
    { value: "actions", label: "Actions", icon: Zap },
    { value: "whatsappFlows", label: "WhatsApp Flows", icon: Workflow },
    { value: "viewCatalog", label: "View Catalog", icon: Eye },
    { value: "sendProducts", label: "Send Products", icon: ShoppingCart },
    { value: "location", label: "Location", icon: MapPin },
    { value: "whatsappMessenger", label: "WhatsApp Messenger", icon: Phone },
  ]

  const getUserDataTypes = [
    "Number",
    "Text",
    "Email",
    "Phone",
    "Image",
    "File",
    "Link",
    "Location",
    "Date",
    "Date and Time",
    "Multiple choice",
    "QR Code Reader (Viber)",
    "Save response to a custom field",
    "Email",
    "Phone",
    "First Name",
    "Last Name",
    "Full Name",
    "Retry message if the reply is invalid",
    "Skip Button Label",
  ]

  const updateNodeData = (updates: any) => {
    updateNode(node.id, {
      ...node.data,
      data: {
        ...node.data.data,
      state: {
        ...state,
        ...updates,
        },
      },
    })
  }

  const handleContentTypeSelect = (contentType: string) => {
    setSelectedContentType(contentType)
    setShowContentOptions(false)
    updateNodeData({
      contentType,
      messageType: selectedMessageType,
    })
  }

  const handleMessageChange = (message: string) => {
    updateNodeData({
      message,
      messageType: selectedMessageType,
      contentType: selectedContentType,
    })
  }

  // --- Redesigned Content Forms ---
  const renderContentForm = () => {
    switch (selectedContentType) {
      case "text":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              placeholder="Type a message..."
              value={state.message || ""}
              onChange={(e) => handleMessageChange(e.target.value)}
              rows={3}
            />
            {/* Radio options for text type */}
            <div className="flex gap-2 mt-2">
              <textarea
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Radio Option Name"
                value={textButtonInput}
                onChange={(e) => setTextButtonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTextButton();
                  }
                }}
                rows={2}
              />
              <button
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
                onClick={handleAddTextButton}
                type="button"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {textButtons.length === 0 && <div className="text-gray-400 text-sm text-center">No radio options added yet.</div>}
              {textButtons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <input
                    type="radio"
                    name="text-radio-group"
                    checked={false}
                    readOnly
                    className="accent-blue-500"
                  />
                  <input
                    className="flex-1 border-none outline-none bg-transparent text-gray-700 text-sm"
                    value={btn.name}
                    onChange={e => {
                      const newButtons = [...textButtons]
                      newButtons[idx].name = e.target.value
                      setTextButtons(newButtons)
                      updateNodeData({ textButtons: newButtons })
                    }}
                  />
                  <button
                    className="text-red-400 hover:text-red-600 text-xs font-semibold px-2"
                    onClick={() => handleRemoveTextButton(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case "image":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Image URL"
              value={state.imageUrl || ""}
              onChange={(e) => updateNodeData({ imageUrl: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, "image")
                  }}
                />
                <div className="w-full cursor-pointer bg-gray-100 border border-gray-200 rounded-xl p-2 text-center text-sm text-gray-700 hover:bg-blue-50 transition">
                  Upload from gallery
                </div>
              </label>
              {state.imageUrl && (
                <img
                  src={state.imageUrl || "/placeholder.svg"}
                  alt="preview"
                  className="h-10 w-10 object-cover rounded-lg border border-gray-200"
                />
              )}
            </div>
            {/* Radio options for image type */}
            <div className="flex gap-2 mt-2">
              <textarea
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Radio Option Name"
                value={imageButtonInput}
                onChange={(e) => setImageButtonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddImageButton();
                  }
                }}
                rows={2}
              />
              <button
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
                onClick={handleAddImageButton}
                type="button"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {imageButtons.length === 0 && <div className="text-gray-400 text-sm text-center">No radio options added yet.</div>}
              {imageButtons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <input
                    type="radio"
                    name="image-radio-group"
                    checked={false}
                    readOnly
                    className="accent-blue-500"
                  />
                  <input
                    className="flex-1 border-none outline-none bg-transparent text-gray-700 text-sm"
                    value={btn.name}
                    onChange={e => {
                      const newButtons = [...imageButtons]
                      newButtons[idx].name = e.target.value
                      updateNodeData({ imageButtons: newButtons })
                    }}
                  />
                  <button
                    className="text-red-400 hover:text-red-600 text-xs font-semibold px-2"
                    onClick={() => handleRemoveImageButton(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case "card":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Title"
              value={state.cardTitle || ""}
              onChange={(e) => updateNodeData({ cardTitle: e.target.value })}
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Subtitle"
              value={state.cardSubtitle || ""}
              onChange={(e) => updateNodeData({ cardSubtitle: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Image URL or upload"
                value={state.cardImageUrl || ""}
                onChange={(e) => updateNodeData({ cardImageUrl: e.target.value })}
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, "cardImage")
                  }}
                />
                <div className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-3 py-2 text-sm transition">
                  <Upload className="h-4 w-4" />
                </div>
              </label>
            </div>
            {/* Radio options for card type */}
            <div className="flex gap-2 mt-2">
              <textarea
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Radio Option Name"
                value={cardButtonInput}
                onChange={(e) => setCardButtonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCardButton();
                  }
                }}
                rows={2}
              />
              <button
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
                onClick={handleAddCardButton}
                type="button"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {cardButtons.length === 0 && <div className="text-gray-400 text-sm text-center">No radio options added yet.</div>}
              {cardButtons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <input
                    type="radio"
                    name="card-radio-group"
                    checked={false}
                    readOnly
                    className="accent-blue-500"
                  />
                  <input
                    className="flex-1 border-none outline-none bg-transparent text-gray-700 text-sm"
                    value={btn.name}
                    onChange={e => {
                      const newButtons = [...cardButtons]
                      newButtons[idx].name = e.target.value
                      updateNodeData({ cardButtons: newButtons })
                    }}
                  />
                  <button
                    className="text-red-400 hover:text-red-600 text-xs font-semibold px-2"
                    onClick={() => handleRemoveCardButton(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case "carousel":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              placeholder="Add user data - type a message..."
              value={state.carouselMessage || ""}
              onChange={(e) => updateNodeData({ carouselMessage: e.target.value })}
              rows={3}
            />
            <button
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
            {isEditing && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Get User Data Reply Type</Label>
                <Select value={state.replyType || ""} onValueChange={(value) => updateNodeData({ replyType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reply type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUserDataTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsEditing(false)}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <Cancel className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      case "audio":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Audio URL"
              value={state.audioUrl || ""}
              onChange={(e) => updateNodeData({ audioUrl: e.target.value })}
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "audio")
                }}
              />
              <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2 text-center text-sm text-gray-700 hover:bg-blue-50 transition">
                Upload Audio File
              </div>
            </label>
            {/* Radio options for audio type */}
            <div className="flex gap-2 mt-2">
              <textarea
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Radio Option Name"
                value={audioButtonInput}
                onChange={(e) => setAudioButtonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddAudioButton();
                  }
                }}
                rows={2}
              />
              <button
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
                onClick={handleAddAudioButton}
                type="button"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {audioButtons.length === 0 && <div className="text-gray-400 text-sm text-center">No radio options added yet.</div>}
              {audioButtons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <input
                    type="radio"
                    name="audio-radio-group"
                    checked={false}
                    readOnly
                    className="accent-blue-500"
                  />
                  <input
                    className="flex-1 border-none outline-none bg-transparent text-gray-700 text-sm"
                    value={btn.name}
                    onChange={e => {
                      const newButtons = [...audioButtons]
                      newButtons[idx].name = e.target.value
                      updateNodeData({ audioButtons: newButtons })
                    }}
                  />
                  <button
                    className="text-red-400 hover:text-red-600 text-xs font-semibold px-2"
                    onClick={() => handleRemoveAudioButton(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case "getUserData":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              placeholder="Type a message..."
              value={state.getUserMessage || ""}
              onChange={(e) => updateNodeData({ getUserMessage: e.target.value })}
              rows={3}
            />
            <button
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
            {isEditing && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Get User Data Reply Type</Label>
                <Select
                  value={state.getUserReplyType || ""}
                  onValueChange={(value) => updateNodeData({ getUserReplyType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reply type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {Array.from(new Set(getUserDataTypes)).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <Label className="text-sm">Skip Button Label</Label>
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm"
                    placeholder="Skip button text"
                    value={state.skipButtonLabel || ""}
                    onChange={(e) => updateNodeData({ skipButtonLabel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Auto skip after (seconds)</Label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm"
                    placeholder="Auto skip time"
                    value={state.autoSkipTime || ""}
                    onChange={(e) => updateNodeData({ autoSkipTime: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsEditing(false)}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <Cancel className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      case "video":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Video URL"
              value={state.videoUrl || ""}
                onChange={(e) => updateNodeData({ videoUrl: e.target.value })}
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "video")
                }}
              />
              <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2 text-center text-sm text-gray-700 hover:bg-blue-50 transition">
                Upload Video
              </div>
            </label>
            {/* Radio options for video type */}
            <div className="flex gap-2 mt-2">
              <textarea
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Radio Option Name"
                value={videoButtonInput}
                onChange={(e) => setVideoButtonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddVideoButton();
                  }
                }}
                rows={2}
              />
              <button
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
                onClick={handleAddVideoButton}
                type="button"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {videoButtons.length === 0 && <div className="text-gray-400 text-sm text-center">No radio options added yet.</div>}
              {videoButtons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <input
                    type="radio"
                    name="video-radio-group"
                    checked={false}
                    readOnly
                    className="accent-blue-500"
                  />
                  <input
                    className="flex-1 border-none outline-none bg-transparent text-gray-700 text-sm"
                    value={btn.name}
                    onChange={e => {
                      const newButtons = [...videoButtons]
                      newButtons[idx].name = e.target.value
                      updateNodeData({ videoButtons: newButtons })
                    }}
                  />
                  <button
                    className="text-red-400 hover:text-red-600 text-xs font-semibold px-2"
                    onClick={() => handleRemoveVideoButton(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Quick Reply</Label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm"
                placeholder="Quick reply text"
                value={state.quickReply || ""}
                onChange={(e) => updateNodeData({ quickReply: e.target.value })}
              />
            </div>
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        )

      case "gif":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="GIF URL"
              value={state.gifUrl || ""}
              onChange={(e) => updateNodeData({ gifUrl: e.target.value })}
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, "gif")
                }}
              />
              <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2 text-center text-sm text-gray-700 hover:bg-blue-50 transition">
                Upload GIF
              </div>
            </label>
            {/* Radio options for gif type */}
            <div className="flex gap-2 mt-2">
              <textarea
                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                placeholder="Radio Option Name"
                value={gifButtonInput}
                onChange={(e) => setGifButtonInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddGifButton();
                  }
                }}
                rows={2}
              />
              <button
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
                onClick={handleAddGifButton}
                type="button"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {gifButtons.length === 0 && <div className="text-gray-400 text-sm text-center">No radio options added yet.</div>}
              {gifButtons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <input
                    type="radio"
                    name="gif-radio-group"
                    checked={false}
                    readOnly
                    className="accent-blue-500"
                  />
                  <input
                    className="flex-1 border-none outline-none bg-transparent text-gray-700 text-sm"
                    value={btn.name}
                    onChange={e => {
                      const newButtons = [...gifButtons]
                      newButtons[idx].name = e.target.value
                      updateNodeData({ gifButtons: newButtons })
                    }}
                  />
                  <button
                    className="text-red-400 hover:text-red-600 text-xs font-semibold px-2"
                    onClick={() => handleRemoveGifButton(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Quick Reply</Label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm"
                placeholder="Quick reply text"
                value={state.gifQuickReply || ""}
                onChange={(e) => updateNodeData({ gifQuickReply: e.target.value })}
              />
            </div>
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        )

      case "typingNotification":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <Label className="text-sm font-medium">Typing Duration</Label>
            <Select
              value={state.typingDuration || "2"}
              onValueChange={(value) => updateNodeData({ typingDuration: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 second</SelectItem>
                <SelectItem value="2">2 seconds</SelectItem>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="4">4 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
              </SelectContent>
            </Select>
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <Clock className="h-4 w-4" /> Add
            </button>
          </div>
        )

      case "requestFile":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <Label className="text-sm font-medium">File Type</Label>
            <Select value={state.fileType || ""} onValueChange={(value) => updateNodeData({ fileType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="any">Any File</SelectItem>
              </SelectContent>
            </Select>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              placeholder="Request message..."
              value={state.fileRequestMessage || ""}
              onChange={(e) => updateNodeData({ fileRequestMessage: e.target.value })}
              rows={2}
            />
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <Paperclip className="h-4 w-4" /> Add
            </button>
          </div>
        )

      case "whatsappFlows":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Flow Name"
              value={state.flowName || ""}
              onChange={(e) => updateNodeData({ flowName: e.target.value })}
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Flow ID"
              value={state.flowId || ""}
              onChange={(e) => updateNodeData({ flowId: e.target.value })}
            />
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <Workflow className="h-4 w-4" /> Add Flow
            </button>
          </div>
        )

      case "viewCatalog":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Catalog Name"
              value={state.catalogName || ""}
              onChange={(e) => updateNodeData({ catalogName: e.target.value })}
            />
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              placeholder="Catalog description..."
              value={state.catalogDescription || ""}
              onChange={(e) => updateNodeData({ catalogDescription: e.target.value })}
              rows={2}
            />
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <Eye className="h-4 w-4" /> View Catalog
            </button>
          </div>
        )

      case "sendProducts":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Product IDs (comma separated)"
              value={state.productIds || ""}
              onChange={(e) => updateNodeData({ productIds: e.target.value })}
            />
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              placeholder="Product message..."
              value={state.productMessage || ""}
              onChange={(e) => updateNodeData({ productMessage: e.target.value })}
              rows={2}
            />
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <ShoppingCart className="h-4 w-4" /> Send Products
            </button>
          </div>
        )

      case "location":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Latitude"
              value={state.latitude || ""}
              onChange={(e) => updateNodeData({ latitude: e.target.value })}
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Longitude"
              value={state.longitude || ""}
              onChange={(e) => updateNodeData({ longitude: e.target.value })}
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Location Name"
              value={state.locationName || ""}
              onChange={(e) => updateNodeData({ locationName: e.target.value })}
            />
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <MapPin className="h-4 w-4" /> Add Location
            </button>
          </div>
        )

      case "messagePro":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <Label className="text-sm font-medium">WhatsApp Template Message Pro Options</Label>
            <Select value={state.templateType || ""} onValueChange={(value) => updateNodeData({ templateType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="flows">WhatsApp Flows</SelectItem>
                <SelectItem value="catalog">View Catalog</SelectItem>
                <SelectItem value="products">Send Products</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Template Name"
              value={state.templateName || ""}
              onChange={(e) => updateNodeData({ templateName: e.target.value })}
            />
            <button
              className="flex items-center justify-center gap-2 mt-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-2 font-medium shadow transition"
              type="button"
            >
              <MessageSquare className="h-4 w-4" /> Add Template
            </button>
          </div>
        )

      case "actions":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-stretch w-full">
            <div className="text-gray-400 text-sm text-center">Actions not implemented yet.</div>
          </div>
        )

      case "quickReply":
        return (
          <div className="bg-gray-50 rounded-2xl shadow p-4 flex flex-col gap-3 items-center w-full">
            <button
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-2 text-center text-base text-gray-400 font-medium bg-white hover:bg-blue-50 transition"
              onClick={() => {
                /* Add quick reply logic */
              }}
            >
              + Quick reply
            </button>
          </div>
        )

      default:
        return <div className="text-center py-8 text-gray-500">Select a content type to configure</div>
    }
  }

  return (
    <div className="w-80 max-w-xs bg-white border-l border-gray-200 shadow-xl rounded-r-2xl overflow-y-auto h-full transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 rounded-tr-2xl">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">Send Message</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200 rounded-full">
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      <div className="p-5 space-y-7">
        {/* Message Type Selection */}
        <div>
          <Label className="text-[15px] font-semibold text-gray-700 mb-2 block">Message Type</Label>
          <Select value={selectedMessageType} onValueChange={setSelectedMessageType}>
            <SelectTrigger className="w-full border-gray-200 focus:ring-2 focus:ring-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {messageTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Content Button */}
        <div>
          <Button
            onClick={() => setShowContentOptions(!showContentOptions)}
            className="w-full font-medium bg-gray-50 hover:bg-blue-50 border border-gray-200 text-gray-700 flex items-center gap-2 shadow-sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2 text-blue-500" />
            Add Content
          </Button>
        </div>

        {/* Content Type Options */}
        {showContentOptions && (
          <Card className="p-4 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
            <Label className="text-[15px] font-semibold text-gray-700 mb-3 block">Select Content Type</Label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto min-w-0">
              {contentTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Button
                    key={type.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleContentTypeSelect(type.value)}
                    className="flex flex-col items-center justify-center gap-1 h-auto min-h-[48px] p-2 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors whitespace-normal break-words text-center min-w-0"
                  >
                    <IconComponent className="h-4 w-4 text-blue-500 mb-1" />
                    <span className="text-xs font-medium text-gray-700 whitespace-normal break-words text-center leading-tight">
                      {type.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </Card>
        )}

        {/* Selected Content Type Form */}
        {selectedContentType && (
          <Card className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <Label className="text-[15px] font-semibold text-gray-700">
                {contentTypes.find((t) => t.value === selectedContentType)?.label} Content
              </Label>
            </div>
            <div className="space-y-3">{renderContentForm()}</div>
          </Card>
        )}

        {/* Live Preview - always show if content type is selected */}
        {selectedContentType && (
          <NodeContentPreview state={state} selectedContentType={selectedContentType} />
        )}
      </div>
    </div>
  )
}
