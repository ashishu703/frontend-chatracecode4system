"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, Plus, Save, Trash2, Edit, Star, Clock, MessageCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import serverHandler from "@/utils/serverHandler"

const initializeOptions = (optionsData: any[]) => {
  if (!optionsData || !Array.isArray(optionsData) || optionsData.length === 0) {
    return [{ id: `opt-${Date.now()}`, value: "" }]
  }
  return optionsData.map((opt, index) => {
    if (typeof opt === "object" && opt.id && typeof opt.value !== "undefined") return opt
    return {
      id: `opt-${Date.now()}-${index}`,
      value: typeof opt === "string" ? opt : ""
    }
  })
}

const buildNodeData = (
  channelType: string,
  selectedChannels: string[],
  timeDelayType: string,
  timeDelayValue: number,
  timeDelayUnit: string,
  title: string,
  messageNumber: number,
  options: any[],
  selectedDate: string
) => ({
  type: "condition" as const,
  data: {
    state: {
      channelType: channelType || "",
      selectedChannels: selectedChannels || [],
      timeDelayType: timeDelayType || "",
      timeDelayValue: timeDelayValue || 0,
      timeDelayUnit: timeDelayUnit || "seconds"
    },
    selectedDate: selectedDate || ""
  },
  title,
  messageNumber,
  channelType,
  selectedChannels,
  timeDelayType,
  timeDelayValue,
  timeDelayUnit,
  options,
  selectedDate
})

const CHANNEL_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "omni", label: "Omni Channel" }
]

const TIME_UNITS = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" }
]

export function ConditionNode({ data, selected, id }: any) {
  const [channelType, setChannelType] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [timeDelayType, setTimeDelayType] = useState("")
  const [timeDelayValue, setTimeDelayValue] = useState(0)
  const [timeDelayUnit, setTimeDelayUnit] = useState("seconds")
  const [selectedDate, setSelectedDate] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState("Condition Node")
  const [messageNumber, setMessageNumber] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId } = useNodeContext()
  const [options, setOptions] = useState(() => initializeOptions(data?.options))
  const isStartNode = startNodeId === id

  useEffect(() => {
    setChannelType(data?.channelType || "")
    setSelectedChannels(data?.selectedChannels || [])
    setTimeDelayType(data?.timeDelayType || "")
    setTimeDelayValue(data?.timeDelayValue || 0)
    setTimeDelayUnit(data?.timeDelayUnit || "seconds")
    setSelectedDate(data?.selectedDate || "")
    setTitle(data?.title || "Condition Node")
    setMessageNumber(data?.messageNumber || 1)
    setOptions(initializeOptions(data?.options))
  }, [data])

  const syncData = useCallback((customData = {}) => {
    const newData = buildNodeData(channelType, selectedChannels, timeDelayType, timeDelayValue, timeDelayUnit, title, messageNumber, options, selectedDate)
    updateNode?.(id, { ...newData, ...customData })
  }, [channelType, selectedChannels, timeDelayType, timeDelayValue, timeDelayUnit, title, messageNumber, options, selectedDate, updateNode, id])

  const handleChannelTypeChange = (value: string) => {
    setChannelType(value === "none" ? "" : value)
    if (value === "omni") {
      setSelectedChannels(["facebook", "instagram"])
    } else if (value && value !== "none") {
      setSelectedChannels([value])
    } else {
      setSelectedChannels([])
    }
  }

  const handleChannelToggle = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel))
    } else {
      setSelectedChannels([...selectedChannels, channel])
    }
  }

  const handleTimeDelayTypeChange = (value: string) => {
    setTimeDelayType(value === "none" ? "" : value)
  }

  const handleTimeDelayValueChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setTimeDelayValue(numValue)
  }

  const handleTimeDelayUnitChange = (value: string) => {
    setTimeDelayUnit(value)
  }

  const handleDateChange = (value: string) => {
    setSelectedDate(value)
  }

  const handleFieldBlur = () => {
    syncData()
  }

  const handleSave = () => setShowDialog(true)

  const handleDialogSave = async () => {
    if (!templateName.trim()) {
      toast({ title: "Template name is required", variant: "destructive" })
      return
    }

    setIsSaving(true)
    const payload = {
      content: {
        type: "condition",
        channelType,
        selectedChannels,
        timeDelayType,
        timeDelayValue,
        timeDelayUnit,
        selectedDate
      },
      title: templateName,
      type: "CONDITION"
    }

    try {
      const response = await serverHandler.post("/api/templet/add_new", payload)
      if ((response.data as any)?.success) {
        setIsSaved(true)
        setShowDialog(false)
        toast({ title: "Template saved!", variant: "default" })
        setTimeout(() => setIsSaved(false), 2000)
      } else {
        toast({ title: "Error", description: (response.data as any)?.msg || "Failed to save", variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.msg || "Failed to save", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTitleEdit = () => setIsEditingTitle(true)
  const handleTitleSave = () => {
    setIsEditingTitle(false)
    syncData()
  }

  const handleSetStartNode = useCallback(() => {
    setStartNodeId?.(id)
    toast({ title: "Start node set!", variant: "default" })
  }, [id, setStartNodeId, toast])

  const addOption = () => {
    const newOptions = [...options, { id: `opt-${Date.now()}`, value: "" }]
    setOptions(newOptions)
    setTimeout(() => {
      const newData = buildNodeData(channelType, selectedChannels, timeDelayType, timeDelayValue, timeDelayUnit, title, messageNumber, newOptions, selectedDate)
      updateNode?.(id, { ...newData, options: newOptions })
    }, 0)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = options.map((opt, i) => (i === index ? { ...opt, value } : opt))
    setOptions(newOptions)
  }

  const handleOptionBlur = (index: number) => {
    syncData()
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    setTimeout(() => {
      const newData = buildNodeData(channelType, selectedChannels, timeDelayType, timeDelayValue, timeDelayUnit, title, messageNumber, newOptions, selectedDate)
      updateNode?.(id, { ...newData, options: newOptions })
    }, 0)
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />
      <div className={`w-[320px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm ${selected ? "ring-2 ring-blue-500" : ""}`}>
        {/* Header */}
        <div className="bg-purple-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyPress={(e) => e.key === "Enter" && handleTitleSave()}
                className="bg-white text-gray-800 px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
                autoFocus
              />
            ) : (
              <span className="font-medium text-sm">{title} #{messageNumber}</span>
            )}
            <button onClick={handleTitleEdit} className="p-1 hover:bg-purple-600 rounded transition-colors" title="Edit title">
              <Edit className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSetStartNode} className="p-1 hover:bg-purple-600 rounded transition-colors" title="Set Start">
              <Star className={`w-4 h-4 ${isStartNode ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
            </button>
            <button onClick={handleSave} className="p-1" title="Save">
              <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
            </button>
            <button onClick={() => deleteNode(id)} className="p-1" title="Delete">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Condition Form */}
        <div className="p-4 space-y-4">
          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Channel
            </label>
            <Select value={channelType} onValueChange={handleChannelTypeChange}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select channel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {CHANNEL_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Channel Selection Details */}
            {channelType && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Selected Channels:</div>
                <div className="space-y-2">
                  {channelType === "omni" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("facebook")}
                        onChange={() => handleChannelToggle("facebook")}
                        className="rounded"
                      />
                      <label className="text-sm">Facebook</label>
                    </div>
                  ) : channelType === "facebook" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("facebook")}
                        onChange={() => handleChannelToggle("facebook")}
                        className="rounded"
                      />
                      <label className="text-sm">Facebook</label>
                    </div>
                  ) : channelType === "instagram" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("instagram")}
                        onChange={() => handleChannelToggle("instagram")}
                        className="rounded"
                      />
                      <label className="text-sm">Instagram</label>
                    </div>
                  ) : channelType === "whatsapp" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("whatsapp")}
                        onChange={() => handleChannelToggle("whatsapp")}
                        className="rounded"
                      />
                      <label className="text-sm">WhatsApp</label>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Time Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Delay
            </label>
            <div className="space-y-3">
              <Select value={timeDelayType} onValueChange={handleTimeDelayTypeChange}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select time delay type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="datewise">Date-wise</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="minute">Minute</SelectItem>
                  <SelectItem value="second">Second</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>

              {timeDelayType && timeDelayType !== "date" && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Value"
                    value={timeDelayValue}
                    onChange={(e) => handleTimeDelayValueChange(e.target.value)}
                    onBlur={handleFieldBlur}
                    className="flex-1 border-gray-300"
                    min="0"
                  />
                  <Select value={timeDelayUnit} onValueChange={handleTimeDelayUnitChange}>
                    <SelectTrigger className="w-24 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_UNITS.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {timeDelayType === "date" && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onBlur={handleFieldBlur}
                    className="flex-1 border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="mt-4 space-y-2">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 relative">
                <Handle
                  type="source"
                  position={Position.Right}
                  id={option.id}
                  className="w-3 h-3 bg-purple-500 border-0 absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: "-6px" }}
                />
                <Input
                  placeholder="Enter an option"
                  value={option.value}
                  onChange={(e) => updateOption(index, e.target.value)}
                  onBlur={() => handleOptionBlur(index)}
                  className="flex-1 pr-8"
                />
                {options.length > 1 && (
                  <button onClick={() => removeOption(index)} className="bg-red-400 hover:bg-red-500 text-white p-2 rounded transition-colors" title="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index === options.length - 1 && (
                  <button onClick={addOption} className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded transition-colors" title="Add">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Black dot handle on right side middle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="main-output"
        className="w-3 h-3 bg-gray-800 border-2 border-white shadow-md"
        style={{ 
          right: "-8px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10
        }}
      />

      {/* Dialog for saving template */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <button
              className="bg-purple-500 text-white rounded px-3 py-1 mt-2 disabled:opacity-50"
              onClick={handleDialogSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ConditionNode 