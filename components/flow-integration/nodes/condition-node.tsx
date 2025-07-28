"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Save, X, Plus, Trash2, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import serverHandler from "@/utils/serverHandler"

interface Condition {
  id: string
  type: string
  operator: string
  value: string
}

const CONDITION_TYPES = [
  { value: "channel", label: "Channel" },
  { value: "messageText", label: "Message Text" },
  { value: "timeDelay", label: "Time Delay" },
  { value: "userTag", label: "User Tag" },
  { value: "timeOfDay", label: "Time of Day" },
  { value: "previousNode", label: "Previous Node" },
  { value: "customVariable", label: "Custom Variable" },
  { value: "buttonClicked", label: "Button Clicked" }
]

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "includes", label: "Includes" },
  { value: "not_includes", label: "Not Includes" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "greater_than_or_equal", label: "Greater Than or Equal" },
  { value: "less_than_or_equal", label: "Less Than or Equal" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" }
]

export function ConditionNode({ data, selected, id }: NodeProps<any>) {
  const [conditions, setConditions] = useState<Condition[]>(data?.conditions || [])
  const [onTrueGoTo, setOnTrueGoTo] = useState(data?.onTrueGoTo || "")
  const [onFalseGoTo, setOnFalseGoTo] = useState(data?.onFalseGoTo || "")
  const [delayInSeconds, setDelayInSeconds] = useState(data?.delayInSeconds || 0)
  const [isSaved, setIsSaved] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(data?.title || "Condition")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { deleteNode, updateNode } = useNodeContext()

  // Initialize state from data if not already set
  useEffect(() => {
    if (data?.title && !title) {
      setTitle(data.title)
    }
    if (data?.conditions && !conditions.length) {
      setConditions(data.conditions)
    }
    if (data?.onTrueGoTo && !onTrueGoTo) {
      setOnTrueGoTo(data.onTrueGoTo)
    }
    if (data?.onFalseGoTo && !onFalseGoTo) {
      setOnFalseGoTo(data.onFalseGoTo)
    }
    if (data?.delayInSeconds !== undefined && delayInSeconds === 0) {
      setDelayInSeconds(data.delayInSeconds)
    }
  }, [data, title, conditions, onTrueGoTo, onFalseGoTo, delayInSeconds])

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      type: "channel",
      operator: "equals",
      value: ""
    }
    const newConditions = [...conditions, newCondition]
    setConditions(newConditions)
    if (updateNode) {
      updateNode(id, {
        ...data,
        conditions: newConditions
      })
    }
  }

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    setConditions(newConditions)
    if (updateNode) {
      updateNode(id, {
        ...data,
        conditions: newConditions
      })
    }
  }

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = conditions.filter((_, i) => i !== index)
      setConditions(newConditions)
      if (updateNode) {
        updateNode(id, {
          ...data,
          conditions: newConditions
        })
      }
    }
  }

  const handleSave = () => {
    setShowDialog(true)
  }

  const handleDialogSave = async () => {
    if (templateName.trim()) {
      setIsSaving(true)
      
      const payload = {
        content: {
          type: "condition",
          conditions: conditions,
          onTrueGoTo,
          onFalseGoTo,
          delayInSeconds
        },
        title: templateName,
        type: "CONDITION"
      }

      try {
        const response = await serverHandler.post('/api/templet/add_new', payload)
        
        if ((response.data as any).success) {
          setIsSaved(true)
          setShowDialog(false)
          toast({ title: "Template saved successfully!", variant: "default" })
          setTimeout(() => setIsSaved(false), 2000)
        } else {
          toast({ title: "Error", description: (response.data as any).msg || "Failed to save template", variant: "destructive" })
        }
      } catch (error: any) {
        console.error('Error saving template:', error)
        toast({ 
          title: "Error", 
          description: error.response?.data?.msg || error.message || "Failed to save template", 
          variant: "destructive" 
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      toast({ title: "Template name is required.", variant: "destructive" })
    }
  }

  const handleClose = () => {
    deleteNode(id)
  }

  const handleTitleEdit = () => {
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    if (updateNode) {
      updateNode(id, {
        ...data,
        title
      })
    }
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    }
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-800 border-0" />

      <Card className={`w-[320px] overflow-hidden ${selected ? "ring-2 ring-blue-500" : ""}`}>
        {/* Header */}
        <div className="bg-purple-500 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyPress={handleTitleKeyPress}
                className="bg-white text-gray-800 px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
                autoFocus
              />
            ) : (
              <span className="font-medium text-sm">{title}</span>
            )}
            <button 
              onClick={handleTitleEdit} 
              className="p-1 hover:bg-purple-600 rounded transition-colors"
              title="Edit title"
            >
              <Edit className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="p-1" title="Save">
              <Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} />
            </button>
            <button onClick={handleClose} className="p-1" title="Close">
              <X className="w-4 h-4" />
            </button>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Template</DialogTitle>
                </DialogHeader>
                <input
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Enter template name"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSaving) {
                      handleDialogSave()
                    }
                  }}
                  autoFocus
                />
                <DialogFooter>
                  <button
                    className="bg-green-500 text-white rounded px-3 py-1 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDialogSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Conditions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Conditions</Label>
            {conditions.map((condition, index) => (
              <div key={condition.id} className="border border-gray-200 rounded p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Condition {index + 1}</span>
                  {conditions.length > 1 && (
                    <button
                      onClick={() => removeCondition(index)}
                      className="bg-red-400 hover:bg-red-500 text-white p-1 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Select 
                    value={condition.type} 
                    onValueChange={(value) => updateCondition(index, 'type', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={condition.operator} 
                    onValueChange={(value) => updateCondition(index, 'operator', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(op => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
            
            <button
              onClick={addCondition}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Condition
            </button>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Navigation</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">If True →</Label>
                <Input
                  value={onTrueGoTo}
                  onChange={(e) => {
                    setOnTrueGoTo(e.target.value)
                    if (updateNode) {
                      updateNode(id, {
                        ...data,
                        onTrueGoTo: e.target.value
                      })
                    }
                  }}
                  placeholder="Node ID"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">If False →</Label>
                <Input
                  value={onFalseGoTo}
                  onChange={(e) => {
                    setOnFalseGoTo(e.target.value)
                    if (updateNode) {
                      updateNode(id, {
                        ...data,
                        onFalseGoTo: e.target.value
                      })
                    }
                  }}
                  placeholder="Node ID"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Delay */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">Delay (seconds)</Label>
            <Input
              type="number"
              value={delayInSeconds}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                setDelayInSeconds(value)
                if (updateNode) {
                  updateNode(id, {
                    ...data,
                    delayInSeconds: value
                  })
                }
              }}
              placeholder="0"
              className="h-8 text-xs"
              min="0"
            />
          </div>
        </div>
      </Card>

      {/* Output handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 bg-green-500 border-0"
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-red-500 border-0"
        style={{ top: '70%' }}
      />
    </div>
  )
}

export default ConditionNode 