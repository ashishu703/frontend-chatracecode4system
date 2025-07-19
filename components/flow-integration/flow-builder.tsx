"use client"

import React, { useCallback, useState, useRef, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { NodeSidebar } from "./node-sidebar"
import { NodeConfigPanel } from "./node-config-panel"
import { FlowHeader } from "./flow-header"
import { NodeContextProvider } from "./node-context"
import { nodeTypes } from "./nodes"
import { validateConnection } from "@/lib/flow-integration/flow-validation"
import type { FlowData, NodeData, FlowTemplate } from "@/types/flow-integration/flow"
import { ChevronRight, ChevronLeft, Eye, Plus, ZoomIn, ZoomOut, Layout, Save } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import serverHandler from '@/utils/serverHandler';
import { Button } from "./ui/button";
import type { Node as XYNode } from '@xyflow/react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const initialNodes: Node<NodeData>[] = [
  {
    id: "simpleMessage-1",
    type: "simpleMessageNode",
    position: { x: 250, y: 100 },
    data: {
      type: "simpleMessage",
      data: {
        state: {
          label: "Send Message",
          content: "Welcome! How can I help you today?",
        },
      },
    },
  },
];

const initialEdges: Edge[] = []

interface ToolbarNodeOption {
  type: string;
  label: string;
}
interface FlowToolbarProps {
  onAddNode: (type: string) => void;
  addPopoverOpen: boolean;
  setAddPopoverOpen: (open: boolean) => void;
  toolbarNodeOptions: ToolbarNodeOption[];
  onSave: () => void;
}
function FlowToolbar({ onAddNode, addPopoverOpen, setAddPopoverOpen, toolbarNodeOptions, onSave }: FlowToolbarProps) {
  return (
    <TooltipProvider>
      <div className="fixed left-1/2 bottom-8 z-50 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-lg" style={{boxShadow: '0 2px 16px rgba(0,0,0,0.08)'}}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><Eye className="h-5 w-5" /></Button>
          </TooltipTrigger>
          <TooltipContent>Preview</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon"><Plus className="h-5 w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-2 z-50">
                <div className="flex flex-col gap-2">
                  {toolbarNodeOptions.map((opt: ToolbarNodeOption) => (
                    <Button key={opt.type} variant="outline" size="sm" className="w-full justify-start" onClick={() => onAddNode(opt.type)}>
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>Add</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSave} variant="default" size="icon"><Save className="h-5 w-5" /></Button>
          </TooltipTrigger>
          <TooltipContent>Save Flow</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><ZoomIn className="h-5 w-5" /></Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><ZoomOut className="h-5 w-5" /></Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon"><Layout className="h-5 w-5" /></Button>
          </TooltipTrigger>
          <TooltipContent>Auto Organize</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

function FlowBuilderContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const reactFlowInstance = useReactFlow()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  // Add state for flow title and flowId
  const [flowTitle, setFlowTitle] = useState("");
  const [flowId, setFlowId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [hasShownNoFlowsToast, setHasShownNoFlowsToast] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  const toolbarNodeOptions = [
    { type: "simpleMessage", label: "Send Message" },
    { type: "startFlow", label: "Start Flow" },
    { type: "actions", label: "Actions" },
    { type: "condition", label: "Condition" },
    { type: "sendEmail", label: "Send Email" },
    { type: "splitTraffic", label: "Split Traffic" },
    { type: "wait", label: "Wait" },
    { type: "landingPage", label: "Landing Page" },
    { type: "addNotes", label: "Add Notes" },
  ];
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);

  const handleAddNode = (nodeType: string) => {
    const centerX = 400 + Math.random() * 200;
    const centerY = 200 + Math.random() * 200;
    let defaultState = getDefaultConfig(nodeType as NodeData["type"]);
    if (nodeType === "sendEmail") {
      defaultState = {
        label: "Send Email",
        from: "",
        to: "",
        subject: "",
        preheader: "",
        headline: "",
        text: "",
        image: "",
        button: "",
      };
    }
    if (nodeType === "startFlow") {
      // Render a box like the Send Message node, but with type 'startFlowNode'
      const newNode: Node<NodeData> = {
        id: `startFlow-${Date.now()}`,
        type: `startFlowNode`,
        position: { x: centerX, y: centerY },
        data: {
          type: "startFlow",
          data: { state: { label: "Start Flow", content: "Click to select a flow" } },
        },
      };
      setNodes((nds) => nds.concat(newNode));
      setAddPopoverOpen(false);
      return;
    }
    const newNode: Node<NodeData> = {
      id: `${nodeType}-${Date.now()}`,
      type: `${nodeType}Node`,
      position: { x: centerX, y: centerY },
      data: {
        type: nodeType as NodeData["type"],
        data: { state: defaultState },
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setAddPopoverOpen(false);
  };

  // Add flow
  const addFlowMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        const res = await serverHandler.post('/api/chat_flow/add_new', payload);
        console.log('API response:', res.data);
        return res.data as any;
      } catch (error) {
        console.error('API error:', error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Flow saved', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['chat-flows'] });
      } else {
        toast({ title: 'Error', description: `Failed to save flow: ${data.msg || 'Unknown error'}`, variant: 'destructive' });
        console.error('Save failed:', data);
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: `API error: ${err?.message || err}`, variant: 'destructive' });
      console.error('Mutation error:', err);
    },
  });

  // Delete flow
  const deleteFlowMutation = useMutation({
    mutationFn: async ({ id, flowId }: { id: string, flowId: string }) => {
      const res = await serverHandler.post('/api/chat_flow/del_flow', { id, flowId });
      return res.data as any;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Flow deleted', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['chat-flows'] });
      } else {
        toast({ title: 'Error', description: data.msg, variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Media upload
  const uploadMedia = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await serverHandler.post('/api/user/return_media_url', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if ((res.data as any).success) {
        return (res.data as any).url;
      }
      return false;
    } catch (err) {
      toast({ title: 'Error', description: 'Media upload failed', variant: 'destructive' });
      return false;
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (validateConnection(params, nodes)) {
        setEdges((eds) => addEdge(params, eds))
      }
    },
    [nodes, setEdges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node<NodeData> = {
        id: `${type}-${Date.now()}`,
        type: `${type}Node`,
        position,
        data: {
          type: type as NodeData["type"],
          config: getDefaultConfig(type as NodeData["type"]),
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes],
  )

  const getDefaultConfig = (type: NodeData["type"]) => {
    // Only return the structure required for each node type as per backend contract
    switch (type) {
      case "simpleMessage":
        return {
          state: {
            msgContent: {
              text: { body: "" }
            },
            keyword: []
          }
        };
      case "imageMessage":
        return {
          state: {
            msgContent: {
              image: { link: "", caption: "" }
            }
          }
        };
      case "audioMessage":
        return {
          state: {
            msgContent: {
              audio: { link: "" }
            }
          }
        };
      case "videoMessage":
        return {
          state: {
            msgContent: {
              video: { link: "", caption: "" }
            }
          }
        };
      case "documentMessage":
        return {
          state: {
            msgContent: {
              document: { link: "", caption: "" }
            }
          }
        };
      case "buttonMessage":
        return {
          state: {
            msgContent: {
              interactive: {
                type: "button",
                body: "",
                action: { buttons: [] }
              }
            }
          }
        };
      case "listMessage":
        return {
          state: {
            msgContent: {
              interactive: {
                type: "list",
                header: "",
                body: "",
                footer: "",
                action: { button: "", sections: [] }
              }
            }
          }
        };
      case "assignAgent":
        return {
          state: {
            agentId: "",
            assignmentType: "specific",
            fallbackAction: "continue"
          }
        };
      case "disableChatTill":
        return {
          state: {
            duration: 3600,
            message: ""
          }
        };
      case "requestAPI":
        return {
          state: {
            method: "POST",
            url: "",
            headers: {},
            body: {},
            responseMapping: {}
          }
        };
      default:
        return { state: {} };
    }
  };

  // Save flow handler
  const saveFlow = async () => {
    if (!(flowTitle || '').trim() || !(flowId || '').trim() || !Array.isArray(nodes) || nodes.length === 0 || !Array.isArray(edges)) {
      toast({ title: 'Error', description: 'Please fill all fields: Title, Flow ID, at least one node, and edges.', variant: 'destructive' });
      console.error('Validation failed:', { flowTitle, flowId, nodes, edges });
      return;
    }
    const cleanedNodes = nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    }));
    const payload = {
      title: (flowTitle || '').trim(),
      flowId: (flowId || '').trim(),
      nodes: cleanedNodes,
      edges,
    };
    console.log('Saving flow with payload:', payload);
    addFlowMutation.mutate(payload);
  };

  // Load flow by ID
  const loadFlow = async (id: string) => {
    try {
      const res = await serverHandler.post('/api/chat_flow/get_by_flow_id', { flowId: id });
      if ((res.data as any).success && (res.data as any).data) {
        const flowData = (res.data as any).data;
        setNodes(Array.isArray(flowData.nodes) ? flowData.nodes : []);
        setEdges(Array.isArray(flowData.edges) ? flowData.edges : []);
        setFlowTitle(flowData.title || '');
        setFlowId(flowData.flowId || id);
        toast({ title: 'Success', description: 'Flow loaded', variant: 'default' });
      } else {
        toast({ title: 'Error', description: (res.data as any).msg || 'Failed to load flow', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to load flow', variant: 'destructive' });
    }
  };

  // Delete flow handler
  const handleDeleteFlow = (id: string, flowId: string) => {
    if (window.confirm("Are you sure you want to delete this flow?")) {
      deleteFlowMutation.mutate({ id, flowId });
    }
  };

  // Add a fallback for loadTemplate if not defined
  const loadTemplate = (template: any) => {};

  // Show toast if no flows found, only once after loading
  useEffect(() => {
    // This useEffect is no longer needed as flows are removed from the UI
  }, []);

  const handleSaveClick = () => {
    if (!(flowTitle || '').trim() || !(flowId || '').trim()) {
      setShowSaveDialog(true);
      setPendingSave(true);
      return;
    }
    saveFlow();
  };

  const handleDialogSave = () => {
    if (!(flowTitle || '').trim() || !(flowId || '').trim()) {
      // Optionally show a toast or error in the dialog
      return;
    }
    setShowSaveDialog(false);
    setPendingSave(false);
    saveFlow();
  };

  // Flows list UI
  return (
    <div>
      {/* Save Dialog for Title and Flow ID */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Flow Title and Flow ID</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <input
              className="border rounded px-2 py-1"
              placeholder="Flow Title"
              value={flowTitle}
              onChange={e => setFlowTitle(e.target.value)}
              autoFocus
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Flow ID"
              value={flowId}
              onChange={e => setFlowId(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white rounded px-3 py-1 mt-2"
              onClick={handleDialogSave}
              disabled={!(flowTitle || '').trim() || !(flowId || '').trim()}
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <NodeContextProvider nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges}>
        <div className="h-full flex flex-col bg-gray-50">
          <div className="flex-1 flex relative">
            {/* Canvas */}
            <div className="flex-1 relative w-full h-[calc(100vh-64px)] min-h-[400px]" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={nodes as any}
                edges={edges as any}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                className={isPreviewMode ? "pointer-events-none" : ""}
              >
                <Background />
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    switch (node.data?.type) {
                      case "start":
                        return "#10b981"
                      case "text":
                        return "#3b82f6"
                      case "image":
                        return "#8b5cf6"
                      case "apiRequest":
                        return "#f59e0b"
                      default:
                        return "#6b7280"
                    }
                  }}
                />
              </ReactFlow>
              {/* Floating toolbar centered at bottom */}
              <FlowToolbar onAddNode={handleAddNode} addPopoverOpen={addPopoverOpen} setAddPopoverOpen={setAddPopoverOpen} toolbarNodeOptions={toolbarNodeOptions} onSave={handleSaveClick} />
            </div>
            {selectedNode && <NodeConfigPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
          </div>
        </div>
      </NodeContextProvider>
    </div>
  )
}

export function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent />
    </ReactFlowProvider>
  )
}
