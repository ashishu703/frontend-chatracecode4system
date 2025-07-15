"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, FolderOpen, LayoutTemplateIcon as Template, Trash2 } from "lucide-react"
import type { Node, Edge } from "@xyflow/react"
import type { NodeData, FlowTemplate } from "@/types/flow"

interface TemplateManagerProps {
  nodes: Node<NodeData>[]
  edges: Edge[]
  onLoadTemplate: (template: FlowTemplate) => void
}

export function TemplateManager({ nodes, edges, onLoadTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<FlowTemplate[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")

  const saveTemplate = () => {
    if (!templateName.trim()) return

    const newTemplate: FlowTemplate = {
      id: `template_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    }

    setTemplates((prev) => [...prev, newTemplate])
    setIsCreateDialogOpen(false)
    setTemplateName("")
    setTemplateDescription("")
  }

  const loadTemplate = (template: FlowTemplate) => {
    onLoadTemplate(template)
    setIsLoadDialogOpen(false)
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId))
  }

  return (
    <div className="flex space-x-2">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Flow Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Customer Support Flow"
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="A template for handling customer support inquiries"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveTemplate}>Save Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Template className="h-4 w-4 mr-2" />
            Load Template
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Flow Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No templates saved yet</p>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{template.nodes.length} nodes</span>
                        <span>{template.edges.length} connections</span>
                        <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => loadTemplate(template)}>
                        <FolderOpen className="h-4 w-4 mr-1" />
                        Load
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
