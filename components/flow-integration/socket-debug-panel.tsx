"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSocket } from "@/contexts/socket-context"

export function SocketDebugPanel() {
  const { socket, isConnected, messages, templates, flows, isLoading } = useSocket()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Socket Status
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
                     <div className="space-y-2">
             <div className="flex justify-between">
               <span>Socket ID:</span>
               <span className="font-mono text-sm">{socket?.id || "Not connected"}</span>
             </div>
             <div className="flex justify-between">
               <span>Total Messages:</span>
               <span>{messages.length}</span>
             </div>
             <div className="flex justify-between">
               <span>Templates Loaded:</span>
               <span>{isLoading ? "Loading..." : templates.length}</span>
             </div>
             <div className="flex justify-between">
               <span>Flows Loaded:</span>
               <span>{isLoading ? "Loading..." : flows.length}</span>
             </div>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No messages yet</p>
            ) : (
              messages.slice(-10).reverse().map((msg, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={msg.route === 'incoming' ? "default" : "secondary"}>
                      {msg.route}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">
                    {msg.body?.text || msg.body?.caption || msg.message || "No content"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Chat ID: {msg.chat_id}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loaded Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No templates loaded</p>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="p-2 border rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{template.title}</span>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {template.content.substring(0, 50)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loaded Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {flows.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No flows loaded</p>
            ) : (
              flows.map((flow) => (
                <div key={flow.id} className="p-2 border rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{flow.name}</span>
                    <Badge variant={flow.isActive ? "default" : "secondary"}>
                      {flow.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {flow.nodes?.length || 0} nodes, {flow.edges?.length || 0} edges
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 