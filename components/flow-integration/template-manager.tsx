"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Save, FolderOpen, LayoutTemplateIcon as Template, Trash2 } from "lucide-react"
import type { Node, Edge } from "@xyflow/react"
import type { NodeData, FlowTemplate } from "@/types/flow"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import serverHandler from '@/utils/serverHandler';

interface TemplateManagerProps {
  nodes: Node<NodeData>[]
  edges: Edge[]
  onLoadTemplate: (template: FlowTemplate) => void
}

export function TemplateManager({ nodes, edges, onLoadTemplate }: TemplateManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // Fetch templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['chatbot-templates'],
    queryFn: async () => {
      const res = await serverHandler.get('/api/templet/get_templets');
      if (!(res.data as any).success) throw new Error((res.data as any).msg || 'Failed to fetch templates');
      return (res.data as any).data;
    },
    gcTime: 5 * 60 * 1000,
  });

  // Add template
  const addTemplateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await serverHandler.post('/api/templet/add_new', payload);
      return res.data as any;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Template saved', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['chatbot-templates'] });
        setIsCreateDialogOpen(false);
        setTemplateName("");
        setTemplateDescription("");
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Delete templates
  const deleteTemplatesMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await serverHandler.post('/api/templet/del_templets', { selected: ids });
      return res.data as any;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Templates deleted', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['chatbot-templates'] });
        setSelectedTemplates([]);
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const saveTemplate = () => {
    if (!templateName.trim()) return
    addTemplateMutation.mutate({
      title: templateName,
      content: JSON.stringify({ nodes, edges }),
      type: "flow",
    });
  }

  const loadTemplate = (template: any) => {
    // Parse content and pass to onLoadTemplate
    try {
      const parsed = JSON.parse(template.content);
      onLoadTemplate({
        id: template.id,
        name: template.title,
        description: template.type,
        nodes: parsed.nodes,
        edges: parsed.edges,
        createdAt: template.createdAt,
      });
      setIsLoadDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Invalid template content', variant: 'destructive' });
    }
  }

  const handleDelete = (id: string) => {
    deleteTemplatesMutation.mutate([id]);
  }

  const handleBulkDelete = () => {
    if (selectedTemplates.length > 0) {
      deleteTemplatesMutation.mutate(selectedTemplates);
    }
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
          <DialogDescription>Dialog to save the current flow as a template.</DialogDescription>
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
              <Button onClick={saveTemplate} disabled={addTemplateMutation.isLoading}>Save Template</Button>
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
          <DialogDescription>Dialog to load a saved flow template.</DialogDescription>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">Loading templates...</p>
            ) : error ? (
              <p className="text-red-500 text-center py-8">{error.message}</p>
            ) : templates && templates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No templates saved yet</p>
            ) : (
              <>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={templates && selectedTemplates.length === templates.length}
                    onChange={e => setSelectedTemplates(e.target.checked ? templates.map((t: any) => t.id) : [])}
                  />
                  <span className="ml-2 text-xs">Select All</span>
                  <Button size="sm" variant="destructive" className="ml-auto" onClick={handleBulkDelete} disabled={selectedTemplates.length === 0}>Delete Selected</Button>
                </div>
                {templates.map((template: any) => (
                  <Card key={template.id} className="p-4 mb-2 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{template.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{template.type}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>ID: {template.id}</span>
                        <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={e => setSelectedTemplates(e.target.checked ? [...selectedTemplates, template.id] : selectedTemplates.filter(id => id !== template.id))}
                      />
                      <Button variant="outline" size="sm" onClick={() => loadTemplate(template)}>
                        <FolderOpen className="h-4 w-4 mr-1" />
                        Load
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
