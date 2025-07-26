"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import serverHandler from "@/utils/serverHandler"
import { useSocket } from "@/contexts/socket-context"
import { SocketDebugPanel } from "./socket-debug-panel"

interface FlowTrigger {
  id: string
  flowId: string
  flowName: string
  triggerType: 'keyword' | 'exact'
  keywords: string[]
  exactMatch: string
  isActive: boolean
}

export function FlowTriggerManager() {
  const [flows, setFlows] = useState<any[]>([])
  const [triggers, setTriggers] = useState<FlowTrigger[]>([])
  const [selectedFlow, setSelectedFlow] = useState<string>("")
  const [triggerType, setTriggerType] = useState<'keyword' | 'exact'>('keyword')
  const [keywords, setKeywords] = useState<string[]>([''])
  const [exactMatch, setExactMatch] = useState("")
  const [isActive, setIsActive] = useState(true)
  const { toast } = useToast()
  const { flows: socketFlows } = useSocket()

  useEffect(() => {
    fetchFlows()
    fetchTriggers()
  }, [])

  const fetchFlows = async () => {
    try {
      const response = await serverHandler.get('/api/chat_flow/get_mine')
      if ((response.data as any).success) {
        setFlows((response.data as any).data || [])
      }
    } catch (error) {
      console.error('Error fetching flows:', error)
    }
  }

  const fetchTriggers = async () => {
    try {
      // This would be your API endpoint for fetching triggers
      // For now, we'll create triggers from flows
      const response = await serverHandler.get('/api/chat_flow/get_mine')
      if ((response.data as any).success) {
        const flowData = (response.data as any).data || []
        const flowTriggers: FlowTrigger[] = flowData.map((flow: any) => ({
          id: flow.id || flow._id,
          flowId: flow.id || flow._id,
          flowName: flow.name || flow.title || 'Untitled Flow',
          triggerType: 'keyword',
          keywords: ['hello', 'hi', 'help'],
          exactMatch: '',
          isActive: true
        }))
        setTriggers(flowTriggers)
      }
    } catch (error) {
      console.error('Error fetching triggers:', error)
    }
  }

  const addKeyword = () => {
    setKeywords([...keywords, ''])
  }

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index)
    setKeywords(newKeywords)
  }

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords]
    newKeywords[index] = value
    setKeywords(newKeywords)
  }

  const saveTrigger = async () => {
    if (!selectedFlow) {
      toast({ title: "Error", description: "Please select a flow", variant: "destructive" })
      return
    }

    if (triggerType === 'keyword' && keywords.every(k => !k.trim())) {
      toast({ title: "Error", description: "Please add at least one keyword", variant: "destructive" })
      return
    }

    if (triggerType === 'exact' && !exactMatch.trim()) {
      toast({ title: "Error", description: "Please enter exact match text", variant: "destructive" })
      return
    }

    try {
      const triggerData = {
        flowId: selectedFlow,
        triggerType,
        keywords: triggerType === 'keyword' ? keywords.filter(k => k.trim()) : [],
        exactMatch: triggerType === 'exact' ? exactMatch : '',
        isActive
      }

      // This would be your API endpoint for saving triggers
      // For now, we'll just update the local state
      const newTrigger: FlowTrigger = {
        id: Date.now().toString(),
        flowId: selectedFlow,
        flowName: flows.find(f => f.id === selectedFlow)?.name || 'Untitled Flow',
        ...triggerData
      }

      setTriggers(prev => [...prev, newTrigger])
      
      // Reset form
      setSelectedFlow("")
      setTriggerType('keyword')
      setKeywords([''])
      setExactMatch("")
      setIsActive(true)

      toast({ title: "Success", description: "Trigger saved successfully", variant: "default" })
    } catch (error) {
      console.error('Error saving trigger:', error)
      toast({ title: "Error", description: "Failed to save trigger", variant: "destructive" })
    }
  }

  const toggleTrigger = async (triggerId: string) => {
    try {
      const updatedTriggers = triggers.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, isActive: !trigger.isActive }
          : trigger
      )
      setTriggers(updatedTriggers)
      
      // This would be your API call to update the trigger
      toast({ title: "Success", description: "Trigger updated", variant: "default" })
    } catch (error) {
      console.error('Error updating trigger:', error)
      toast({ title: "Error", description: "Failed to update trigger", variant: "destructive" })
    }
  }

  const deleteTrigger = async (triggerId: string) => {
    try {
      setTriggers(prev => prev.filter(t => t.id !== triggerId))
      
      // This would be your API call to delete the trigger
      toast({ title: "Success", description: "Trigger deleted", variant: "default" })
    } catch (error) {
      console.error('Error deleting trigger:', error)
      toast({ title: "Error", description: "Failed to delete trigger", variant: "destructive" })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Flow Trigger Manager</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Trigger */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add New Trigger</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flow">Select Flow</Label>
                <Select value={selectedFlow} onValueChange={setSelectedFlow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a flow" />
                  </SelectTrigger>
                  <SelectContent>
                    {flows.map((flow) => (
                      <SelectItem key={flow.id || flow._id} value={flow.id || flow._id}>
                        {flow.name || flow.title || 'Untitled Flow'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="triggerType">Trigger Type</Label>
                <Select value={triggerType} onValueChange={(value: 'keyword' | 'exact') => setTriggerType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keyword Match</SelectItem>
                    <SelectItem value="exact">Exact Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {triggerType === 'keyword' && (
              <div>
                <Label>Keywords</Label>
                <div className="space-y-2">
                  {keywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={keyword}
                        onChange={(e) => updateKeyword(index, e.target.value)}
                        placeholder="Enter keyword"
                      />
                      {keywords.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeKeyword(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addKeyword}>
                    Add Keyword
                  </Button>
                </div>
              </div>
            )}

            {triggerType === 'exact' && (
              <div>
                <Label htmlFor="exactMatch">Exact Match Text</Label>
                <Input
                  id="exactMatch"
                  value={exactMatch}
                  onChange={(e) => setExactMatch(e.target.value)}
                  placeholder="Enter exact text to match"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <Button onClick={saveTrigger} className="w-full">
              Save Trigger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Active Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No triggers configured</p>
            ) : (
              triggers.map((trigger) => (
                <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{trigger.flowName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={trigger.triggerType === 'keyword' ? 'default' : 'secondary'}>
                        {trigger.triggerType}
                      </Badge>
                      {trigger.triggerType === 'keyword' && (
                        <div className="flex gap-1">
                          {trigger.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {trigger.triggerType === 'exact' && (
                        <Badge variant="outline" className="text-xs">
                          "{trigger.exactMatch}"
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={trigger.isActive}
                      onCheckedChange={() => toggleTrigger(trigger.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTrigger(trigger.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </div>
      
      <div>
        <SocketDebugPanel />
      </div>
    </div>
  )
} 