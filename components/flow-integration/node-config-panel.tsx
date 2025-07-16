"use client"
import type { Node } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, Trash2 } from "lucide-react"
import type { NodeData } from "@/types/flow"
import { useNodeContext } from "./node-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NodeConfigPanelProps {
  node: Node<NodeData>
  onClose: () => void
}

export function NodeConfigPanel({ node, onClose }: NodeConfigPanelProps) {
  const { updateNode, deleteNode } = useNodeContext()

  const updateConfig = (updates: Partial<NodeData["config"]>) => {
    updateNode(node.id, {
      ...node.data,
      config: { ...node.data.config, ...updates },
    })
  }

  const renderConfigForm = () => {
    switch (node.data.type) {
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="content">Text Content</Label>
              <Textarea
                id="content"
                value={node.data.config.content || ""}
                onChange={(e) => updateConfig({ content: e.target.value })}
                rows={4}
                placeholder="Hello! How can I help you today?"
              />
            </div>
            <div>
              <Label htmlFor="delay">Delay (milliseconds)</Label>
              <Input
                id="delay"
                type="number"
                value={node.data.config.delay || 0}
                onChange={(e) => updateConfig({ delay: Number.parseInt(e.target.value) || 0 })}
                placeholder="1000"
              />
            </div>
            <div>
              <Label>Quick Replies</Label>
              {(node.data.config.quickReplies || []).map((reply: any, index: number) => (
                <div key={index} className="flex space-x-2 mt-2">
                  <Input
                    placeholder="Button text"
                    value={reply.text}
                    onChange={(e) => {
                      const newReplies = [...(node.data.config.quickReplies || [])]
                      newReplies[index] = { ...reply, text: e.target.value }
                      updateConfig({ quickReplies: newReplies })
                    }}
                  />
                  <Input
                    placeholder="Payload"
                    value={reply.payload}
                    onChange={(e) => {
                      const newReplies = [...(node.data.config.quickReplies || [])]
                      newReplies[index] = { ...reply, payload: e.target.value }
                      updateConfig({ quickReplies: newReplies })
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newReplies = (node.data.config.quickReplies || []).filter(
                        (_: any, i: number) => i !== index,
                      )
                      updateConfig({ quickReplies: newReplies })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newReplies = [...(node.data.config.quickReplies || []), { text: "", payload: "" }]
                  updateConfig({ quickReplies: newReplies })
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Quick Reply
              </Button>
            </div>
          </div>
        )

      case "image":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="url">Image URL</Label>
              <Input
                id="url"
                value={node.data.config.url || ""}
                onChange={(e) => updateConfig({ url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={node.data.config.caption || ""}
                onChange={(e) => updateConfig({ caption: e.target.value })}
                placeholder="Our latest product!"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={node.data.config.alt || ""}
                onChange={(e) => updateConfig({ alt: e.target.value })}
                placeholder="Product showcase"
              />
            </div>
          </div>
        )

      case "audio":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="url">Audio URL</Label>
              <Input
                id="url"
                value={node.data.config.url || ""}
                onChange={(e) => updateConfig({ url: e.target.value })}
                placeholder="https://example.com/audio.mp3"
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={node.data.config.caption || ""}
                onChange={(e) => updateConfig({ caption: e.target.value })}
                placeholder="Listen to our latest podcast"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoPlay"
                checked={node.data.config.autoPlay || false}
                onChange={(e) => updateConfig({ autoPlay: e.target.checked })}
              />
              <Label htmlFor="autoPlay">Auto-play</Label>
            </div>
          </div>
        )

      case "video":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="url">Video URL</Label>
              <Input
                id="url"
                value={node.data.config.url || ""}
                onChange={(e) => updateConfig({ url: e.target.value })}
                placeholder="https://example.com/video.mp4"
              />
            </div>
            <div>
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={node.data.config.thumbnail || ""}
                onChange={(e) => updateConfig({ thumbnail: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={node.data.config.caption || ""}
                onChange={(e) => updateConfig({ caption: e.target.value })}
                placeholder="Product demo video"
              />
            </div>
          </div>
        )

      case "document":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="url">Document URL</Label>
              <Input
                id="url"
                value={node.data.config.url || ""}
                onChange={(e) => updateConfig({ url: e.target.value })}
                placeholder="https://example.com/document.pdf"
              />
            </div>
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={node.data.config.title || ""}
                onChange={(e) => updateConfig({ title: e.target.value })}
                placeholder="User Guide"
              />
            </div>
            <div>
              <Label htmlFor="fileType">File Type</Label>
              <Select
                value={node.data.config.fileType || "pdf"}
                onValueChange={(value) => updateConfig({ fileType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">DOC</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="xls">XLS</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                  <SelectItem value="ppt">PPT</SelectItem>
                  <SelectItem value="pptx">PPTX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "button":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="text">Main Text</Label>
              <Textarea
                id="text"
                value={node.data.config.text || ""}
                onChange={(e) => updateConfig({ text: e.target.value })}
                placeholder="What would you like to do?"
                rows={2}
              />
            </div>
            <div>
              <Label>Buttons</Label>
              {(node.data.config.buttons || []).map((button: any, index: number) => (
                <div key={index} className="border p-3 rounded mt-2">
                  <div className="space-y-2">
                    <Select
                      value={button.type || "postback"}
                      onValueChange={(value) => {
                        const newButtons = [...(node.data.config.buttons || [])]
                        newButtons[index] = { ...button, type: value }
                        updateConfig({ buttons: newButtons })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postback">Postback</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Button title"
                      value={button.title}
                      onChange={(e) => {
                        const newButtons = [...(node.data.config.buttons || [])]
                        newButtons[index] = { ...button, title: e.target.value }
                        updateConfig({ buttons: newButtons })
                      }}
                    />
                    {button.type === "url" && (
                      <Input
                        placeholder="URL"
                        value={button.url || ""}
                        onChange={(e) => {
                          const newButtons = [...(node.data.config.buttons || [])]
                          newButtons[index] = { ...button, url: e.target.value }
                          updateConfig({ buttons: newButtons })
                        }}
                      />
                    )}
                    {button.type === "phone" && (
                      <Input
                        placeholder="Phone number"
                        value={button.phone || ""}
                        onChange={(e) => {
                          const newButtons = [...(node.data.config.buttons || [])]
                          newButtons[index] = { ...button, phone: e.target.value }
                          updateConfig({ buttons: newButtons })
                        }}
                      />
                    )}
                    {button.type === "postback" && (
                      <Input
                        placeholder="Payload"
                        value={button.payload || ""}
                        onChange={(e) => {
                          const newButtons = [...(node.data.config.buttons || [])]
                          newButtons[index] = { ...button, payload: e.target.value }
                          updateConfig({ buttons: newButtons })
                        }}
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newButtons = (node.data.config.buttons || []).filter((_: any, i: number) => i !== index)
                        updateConfig({ buttons: newButtons })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newButtons = [...(node.data.config.buttons || []), { type: "postback", title: "", payload: "" }]
                  updateConfig({ buttons: newButtons })
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Button
              </Button>
            </div>
          </div>
        )

      case "list":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="header">Header</Label>
              <Input
                id="header"
                value={node.data.config.header || ""}
                onChange={(e) => updateConfig({ header: e.target.value })}
                placeholder="Our Services"
              />
            </div>
            <div>
              <Label htmlFor="body">Body Text</Label>
              <Textarea
                id="body"
                value={node.data.config.body || ""}
                onChange={(e) => updateConfig({ body: e.target.value })}
                placeholder="Please select an option:"
                rows={2}
              />
            </div>
            <div>
              <Label>List Sections</Label>
              {(node.data.config.sections || []).map((section: any, index: number) => (
                <div key={index} className="border p-3 rounded mt-2">
                  <div className="space-y-2">
                    <Input
                      placeholder="Section title"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...(node.data.config.sections || [])]
                        newSections[index] = { ...section, title: e.target.value }
                        updateConfig({ sections: newSections })
                      }}
                    />
                    <Input
                      placeholder="Description"
                      value={section.description}
                      onChange={(e) => {
                        const newSections = [...(node.data.config.sections || [])]
                        newSections[index] = { ...section, description: e.target.value }
                        updateConfig({ sections: newSections })
                      }}
                    />
                    <Input
                      placeholder="Image URL (optional)"
                      value={section.image || ""}
                      onChange={(e) => {
                        const newSections = [...(node.data.config.sections || [])]
                        newSections[index] = { ...section, image: e.target.value }
                        updateConfig({ sections: newSections })
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSections = (node.data.config.sections || []).filter((_: any, i: number) => i !== index)
                        updateConfig({ sections: newSections })
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSections = [...(node.data.config.sections || []), { title: "", description: "", image: "" }]
                  updateConfig({ sections: newSections })
                }}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
            <div>
              <Label>Action Button (Optional)</Label>
              <div className="space-y-2 mt-2">
                <Input
                  placeholder="Button text"
                  value={node.data.config.button?.text || ""}
                  onChange={(e) => {
                    updateConfig({
                      button: {
                        ...node.data.config.button,
                        text: e.target.value,
                      },
                    })
                  }}
                />
                <Input
                  placeholder="Payload"
                  value={node.data.config.button?.payload || ""}
                  onChange={(e) => {
                    updateConfig({
                      button: {
                        ...node.data.config.button,
                        payload: e.target.value,
                      },
                    })
                  }}
                />
              </div>
            </div>
          </div>
        )

      case "assignAgent":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="agentId">Agent ID</Label>
              <Input
                id="agentId"
                value={node.data.config.agentId || ""}
                onChange={(e) => updateConfig({ agentId: e.target.value })}
                placeholder="agent123"
              />
            </div>
            <div>
              <Label htmlFor="message">Transfer Message</Label>
              <Textarea
                id="message"
                value={node.data.config.message || ""}
                onChange={(e) => updateConfig({ message: e.target.value })}
                placeholder="Transferring you to a support agent..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="fallback">Fallback Action</Label>
              <Select
                value={node.data.config.fallback || "continue_flow"}
                onValueChange={(value) => updateConfig({ fallback: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue_flow">Continue Flow</SelectItem>
                  <SelectItem value="end_chat">End Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "disableChat":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={node.data.config.duration || 60}
                onChange={(e) => updateConfig({ duration: Number.parseInt(e.target.value) || 60 })}
                placeholder="60"
              />
            </div>
            <div>
              <Label htmlFor="message">Disable Message</Label>
              <Textarea
                id="message"
                value={node.data.config.message || ""}
                onChange={(e) => updateConfig({ message: e.target.value })}
                placeholder="Chat disabled for maintenance. Please check back later."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="resumeAction">Resume Action</Label>
              <Select
                value={node.data.config.resumeAction || "notify"}
                onValueChange={(value) => updateConfig({ resumeAction: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notify">Notify</SelectItem>
                  <SelectItem value="continue">Continue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "apiRequest":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={node.data.config.label || ""}
                onChange={(e) => updateConfig({ label: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Select
                value={node.data.config.method || "POST"}
                onValueChange={(value) => updateConfig({ method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">API URL</Label>
              <Input
                id="url"
                value={node.data.config.url || ""}
                onChange={(e) => updateConfig({ url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Textarea
                id="headers"
                value={JSON.stringify(node.data.config.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value)
                    updateConfig({ headers })
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={4}
                placeholder='{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token123"\n}'
              />
            </div>
            <div>
              <Label htmlFor="body">Request Body (JSON)</Label>
              <Textarea
                id="body"
                value={JSON.stringify(node.data.config.body || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const body = JSON.parse(e.target.value)
                    updateConfig({ body })
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={4}
                placeholder='{\n  "userId": "{{user.id}}",\n  "action": "check_status"\n}'
              />
            </div>
            <div>
              <Label htmlFor="responseMapping">Response Mapping (JSON)</Label>
              <Textarea
                id="responseMapping"
                value={JSON.stringify(node.data.config.responseMapping || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const responseMapping = JSON.parse(e.target.value)
                    updateConfig({ responseMapping })
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={4}
                placeholder='{\n  "status": "response.status",\n  "message": "response.data.message"\n}'
              />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={node.data.config.label || ""}
              onChange={(e) => updateConfig({ label: e.target.value })}
            />
          </div>
        )
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Configure Node</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm font-medium capitalize">{node.data.type} Node</span>
        </div>
        <p className="text-xs text-gray-500">ID: {node.id}</p>
      </Card>

      <div className="space-y-6">
        {renderConfigForm()}

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              deleteNode(node.id)
              onClose()
            }}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </div>
    </div>
  )
}
