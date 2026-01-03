"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, Plus, Trash2, Clock, MessageCircle, Calendar, Copy, Play, GitBranch } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Handle, Position } from "@xyflow/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"

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
        setShowDialog(false)
        toast({ title: "Template saved!", variant: "default" })
        setTemplateName("")
      } else {
        toast({ title: "Error", description: (response.data as any)?.msg || "Failed to save", variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.msg || "Failed to save", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetStartNode = useCallback(() => {
    if (setStartNodeId) {
      if (isStartNode) {
        setStartNodeId(null)
        toast({ title: "Start node removed", variant: "default" })
      } else {
        setStartNodeId(id)
        toast({ title: "Start node set!", variant: "default" })
  }
    }
  }, [id, setStartNodeId, toast, isStartNode])

  const handleCopy = useCallback(() => {
    if (duplicateNode) {
      duplicateNode(id)
      toast({ title: "Node copied successfully!", variant: "default" })
    }
  }, [id, duplicateNode, toast])

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
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-400 !border-2 !border-white" />
      
      {/* Hover Action Buttons */}
      {isHovered && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1 z-10">
          <button 
            onClick={handleSetStartNode} 
            className="p-1.5 hover:bg-green-50 rounded transition-colors" 
            title={isStartNode ? "Remove as start node" : "Set as start node"}
          >
            <Play className={`w-4 h-4 ${isStartNode ? "text-green-600 fill-green-600" : "text-green-600"}`} />
            </button>
          <button 
            onClick={handleCopy} 
            className="p-1.5 hover:bg-blue-50 rounded transition-colors" 
            title="Copy"
          >
            <Copy className="w-4 h-4 text-blue-600" />
            </button>
          <button 
            onClick={() => deleteNode(id)} 
            className="p-1.5 hover:bg-red-50 rounded transition-colors" 
            title="Delete"
          >
            <X className="w-4 h-4 text-red-600" />
            </button>
        </div>
      )}

      <div className={`w-[320px] bg-white rounded-lg shadow-md ${selected ? "ring-2 ring-blue-500" : "border border-gray-200"}`}>
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">
                {title} #{messageNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Conditional Branch</p>
            </div>
          </div>
        </div>

        {/* Condition Form */}
        <div className="px-3 py-2 space-y-3">
          {/* Channel Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">CHANNEL</label>
            <Select value={channelType} onValueChange={handleChannelTypeChange}>
              <SelectTrigger className="p-2 border border-gray-300 rounded-lg text-sm">
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
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-1.5">Selected Channels:</div>
                <div className="space-y-1.5">
                  {channelType === "omni" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("facebook")}
                        onChange={() => handleChannelToggle("facebook")}
                        className="rounded"
                      />
                      <label className="text-xs">Facebook</label>
                    </div>
                  ) : channelType === "facebook" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("facebook")}
                        onChange={() => handleChannelToggle("facebook")}
                        className="rounded"
                      />
                      <label className="text-xs">Facebook</label>
                    </div>
                  ) : channelType === "instagram" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("instagram")}
                        onChange={() => handleChannelToggle("instagram")}
                        className="rounded"
                      />
                      <label className="text-xs">Instagram</label>
                    </div>
                  ) : channelType === "whatsapp" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes("whatsapp")}
                        onChange={() => handleChannelToggle("whatsapp")}
                        className="rounded"
                      />
                      <label className="text-xs">WhatsApp</label>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Time Delay */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">TIME DELAY</label>
            <div className="space-y-2">
              <Select value={timeDelayType} onValueChange={handleTimeDelayTypeChange}>
                <SelectTrigger className="p-2 border border-gray-300 rounded-lg text-sm">
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
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                  />
                  <Select value={timeDelayUnit} onValueChange={handleTimeDelayUnitChange}>
                    <SelectTrigger className="w-[140px] p-2 border border-gray-300 rounded-lg text-sm">
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
                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="mt-2 space-y-2">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 relative">
                <Handle
                  type="source"
                  position={Position.Right}
                  id={option.id}
                  className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white absolute right-0 top-1/2 transform -translate-y-1/2"
                  style={{ right: "-6px" }}
                />
                <Input
                  placeholder="Enter an option"
                  value={option.value}
                  onChange={(e) => updateOption(index, e.target.value)}
                  onBlur={() => handleOptionBlur(index)}
                  className="flex-1 pr-8 p-2 border border-gray-300 rounded-lg text-sm"
                />
                {options.length > 1 && (
                  <button onClick={() => removeOption(index)} className="bg-red-400 hover:bg-red-500 text-white p-1.5 rounded transition-colors" title="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {index === options.length - 1 && (
                  <button onClick={addOption} className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded transition-colors" title="Add">
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
      </div>

          {/* Continue Section */}
          <div className="flex items-center justify-end pt-2 relative">
            <span className="text-sm text-gray-700 font-medium mr-2">Continue</span>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="main-output"
              className="!w-5 !h-5 !bg-gray-400 !border-2 !border-white !rounded-full absolute right-0 top-1/2 transform -translate-y-1/2"
              style={{ right: '-10px' }}
      />
          </div>
        </div>
      </div>

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