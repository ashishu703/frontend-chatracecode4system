"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, Copy, Play, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Handle, Position } from "@xyflow/react"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TIME_UNITS = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" }
]

export function DelayNode({ data, selected, id }: any) {
  const [duration, setDuration] = useState(data?.duration || 1)
  const [unit, setUnit] = useState(data?.unit || "seconds")
  const [title, setTitle] = useState(data?.title || "Delay")
  const [messageNumber, setMessageNumber] = useState(data?.messageNumber || 1)
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const { deleteNode, updateNode, startNodeId, setStartNodeId } = useNodeContext()
  const isStartNode = startNodeId === id

  useEffect(() => {
    setDuration(data?.duration || 1)
    setUnit(data?.unit || "seconds")
    setTitle(data?.title || "Delay")
    setMessageNumber(data?.messageNumber || 1)
  }, [data])

  const syncData = useCallback(() => {
    if (updateNode) {
      updateNode(id, {
        ...data,
        duration,
        unit,
        title,
        messageNumber,
        type: "delay"
      })
    }
  }, [duration, unit, title, messageNumber, updateNode, id, data])

  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setDuration(numValue)
  }

  const handleDurationBlur = () => {
    syncData()
  }

  const handleUnitChange = (value: string) => {
    setUnit(value)
    syncData()
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

  const { duplicateNode } = useNodeContext()
  const handleCopy = useCallback(() => {
    if (duplicateNode) {
      duplicateNode(id)
      toast({ title: "Node copied successfully!", variant: "default" })
    }
  }, [id, duplicateNode, toast])

  const handleDelete = () => {
    deleteNode(id)
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
            onClick={handleDelete} 
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
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">
                {title} #{messageNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Wait before continuing</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-3">
          {/* DURATION Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">DURATION</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                onBlur={handleDurationBlur}
                min="0"
                className="flex-1 p-2 border border-gray-300 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
              />
              <Select value={unit} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-[140px] p-2 border border-gray-300 rounded-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_UNITS.map((timeUnit) => (
                    <SelectItem key={timeUnit.value} value={timeUnit.value}>
                      {timeUnit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Continue Section */}
          <div className="flex items-center justify-end pt-2 relative">
            <span className="text-sm text-gray-700 font-medium mr-2">Continue</span>
            <Handle
              type="source"
              position={Position.Right}
              id="continue"
              className="!w-5 !h-5 !bg-gray-400 !border-2 !border-white !rounded-full absolute right-0 top-1/2 transform -translate-y-1/2"
              style={{ right: '-10px' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DelayNode
