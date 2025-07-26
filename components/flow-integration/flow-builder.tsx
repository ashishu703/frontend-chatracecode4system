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

// import { NodeSidebar } from "./node-sidebar"
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
          message: "Welcome! How can I help you today?",
        },
      },
      title: "Simple Message",
      messageNumber: 1,
      message: "Welcome! How can I help you today?",
      options: [""],
    } as NodeData,
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
  
  // Auto-generate flow ID when component mounts
  useEffect(() => {
    if (!flowId) {
      const generatedId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setFlowId(generatedId);
    }
  }, [flowId]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [hasShownNoFlowsToast, setHasShownNoFlowsToast] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [showEdgeDialog, setShowEdgeDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [edgeKeyword, setEdgeKeyword] = useState("{{OTHER_MSG}}");
  const [edgeKeywords, setEdgeKeywords] = useState<string[]>(["{{OTHER_MSG}}"]);

  const toolbarNodeOptions = [
    { type: "simpleMessageNode", label: "Text Message", dataType: "simpleMessage" },
    { type: "videoMessageNode", label: "Video Message", dataType: "videoMessage" },
    { type: "imageMessageNode", label: "Image Message", dataType: "imageMessage" },
    { type: "audioMessageNode", label: "Audio Message", dataType: "audioMessage" },
    { type: "documentMessageNode", label: "Document Message", dataType: "documentMessage" },
    { type: "buttonMessageNode", label: "Button Message", dataType: "buttonMessage" },
    { type: "listMessageNode", label: "List Message", dataType: "listMessage" },
    { type: "disableChatTillNode", label: "Disable Chat", dataType: "disableChatTill" },
    { type: "requestAPINode", label: "API Request", dataType: "requestAPI" },
    { type: "assignAgentNode", label: "Assign Agent", dataType: "assignAgent" },
  ];
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);

  const handleAddNode = (nodeType: string) => {
    const centerX = 400 + Math.random() * 200;
    const centerY = 200 + Math.random() * 200;
    const option = toolbarNodeOptions.find(opt => opt.type === nodeType);
    if (!option) return;
    let defaultState = getDefaultConfig(option.dataType as NodeData["type"]);
    
    // Get the next message number for sequential numbering
    const existingMessageNodes = nodes.filter(node => 
      node.type === 'simpleMessageNode' || 
      node.type === 'imageMessageNode' || 
      node.type === 'videoMessageNode' || 
      node.type === 'audioMessageNode' || 
      node.type === 'documentMessageNode' || 
      node.type === 'buttonMessageNode' || 
      node.type === 'listMessageNode'
    );
    const nextMessageNumber = existingMessageNodes.length + 1;
    
    const newNode: Node<NodeData> = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: centerX, y: centerY },
          data: {
      type: option.dataType as NodeData["type"],
      data: { state: defaultState },
      title: option.label,
      messageNumber: nextMessageNumber,
    } as NodeData,
    };
    setNodes((nds) => nds.concat(newNode));
    setAddPopoverOpen(false);
  };

  // Add flow
  const addFlowMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        console.log('Sending payload to /api/chat_flow/add_new:', JSON.stringify(payload, null, 2));
        const res = await serverHandler.post('/api/chat_flow/add_new', payload);
        console.log('API response:', res.data);
        return res.data as any;
      } catch (error: any) {
        console.error('API error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: 'Success', description: 'Flow saved', variant: 'default' });
        queryClient.invalidateQueries({ queryKey: ['chat-flows'] });
      } else {
        toast({ title: 'Error', description: data.msg || 'Please subscribe a plan to proceed', variant: 'destructive' });
        console.error('Save failed:', data);
      }
    },
    onError: (err: any) => {
      console.error('Mutation error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
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
      console.log('Connection attempt:', params);
      console.log('Available nodes:', nodes.map(n => ({ id: n.id, type: n.type, dataType: n.data?.type })));
      
      // More permissive validation - allow most connections
      if (params.source && params.target && params.source !== params.target) {
        console.log('Connection validated, showing dialog');
        setPendingConnection(params);
        setEdgeKeywords(["{{OTHER_MSG}}"]);
        setShowEdgeDialog(true);
      } else {
        console.log('Connection validation failed:', { source: params.source, target: params.target });
      }
    },
    [nodes],
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
          data: { state: getDefaultConfig(type as NodeData["type"]) },
        } as NodeData,
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
    if (!(flowTitle || '').trim() || !Array.isArray(nodes) || nodes.length === 0 || !Array.isArray(edges)) {
      toast({ title: 'Error', description: 'Please fill the title and ensure you have at least one node in your flow.', variant: 'destructive' });
      console.error('Validation failed:', { flowTitle, flowId, nodes, edges });
      return;
    }
    
    console.log('Original nodes before cleaning:', nodes);
    
    const cleanedNodes = nodes.map((node) => {
      // Ensure we have the node type - try multiple sources
      let nodeType = node.data?.type;
      
      // Fallback: if data.type is not available, try to extract from node.type
      if (!nodeType && node.type) {
        // Remove "Node" suffix from node.type to get the business type
        const extractedType = node.type.replace('Node', '');
        // Convert camelCase to the expected format
        if (extractedType === 'simpleMessage') nodeType = 'simpleMessage';
        else if (extractedType === 'imageMessage') nodeType = 'imageMessage';
        else if (extractedType === 'videoMessage') nodeType = 'videoMessage';
        else if (extractedType === 'audioMessage') nodeType = 'audioMessage';
        else if (extractedType === 'documentMessage') nodeType = 'documentMessage';
        else if (extractedType === 'buttonMessage') nodeType = 'buttonMessage';
        else if (extractedType === 'listMessage') nodeType = 'listMessage';
        else if (extractedType === 'disableChatTill') nodeType = 'disableChatTill';
        else if (extractedType === 'requestAPI') nodeType = 'requestAPI';
        else if (extractedType === 'assignAgent') nodeType = 'assignAgent';
      }
      
      if (!nodeType) {
        console.error('Node missing type information:', node);
        toast({ title: 'Error', description: `Node ${node.id} is missing type information`, variant: 'destructive' });
        return null;
      }
      
      const cleanedNode = {
        id: node.id,
        type: node.type,
        nodeType: nodeType, // Change to camelCase to match backend expectation
        position: node.position,
        data: node.data,
      };
      
      console.log(`Cleaned node ${node.id}:`, cleanedNode);
      return cleanedNode;
    }).filter(Boolean) as any[]; // Remove any null nodes
    
    if (cleanedNodes.length === 0) {
      toast({ title: 'Error', description: 'No valid nodes to save', variant: 'destructive' });
      return;
    }
    
    const cleanedEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || "{{OTHER_MSG}}",
    }));

    const payload = {
      title: (flowTitle || '').trim(),
      flowId: (flowId || '').trim(),
      nodes: cleanedNodes,
      edges: cleanedEdges,
    };
    
    console.log('Saving flow with payload:', JSON.stringify(payload, null, 2));
    
    // Test payload structure
    console.log('Testing payload structure:');
    payload.nodes.forEach((node, index) => {
      if (node) {
        console.log(`Node ${index}:`, {
          id: node.id,
          type: node.type,
          nodeType: node.nodeType,
          has_nodeType: 'nodeType' in node,
          nodeType_value: node.nodeType
        });
      }
    });
    
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
    if (!(flowTitle || '').trim()) {
      setShowSaveDialog(true);
      setPendingSave(true);
      return;
    }
    saveFlow();
  };

  const handleDialogSave = () => {
    if (!(flowTitle || '').trim()) {
      toast({ title: 'Error', description: 'Please enter a flow title', variant: 'destructive' });
      return;
    }
    setShowSaveDialog(false);
    setPendingSave(false);
    saveFlow();
  };

  const handleEdgeCreate = () => {
    if (pendingConnection && edgeKeywords.length > 0) {
      setEdges((eds) => {
        const newEdges = edgeKeywords
          .filter((keyword) =>
            !eds.some(
              (e) =>
                e.source === pendingConnection.source &&
                e.target === pendingConnection.target &&
                e.sourceHandle === keyword
            )
          )
          .map((keyword) => ({
            ...pendingConnection,
            id: `${pendingConnection.source}-${pendingConnection.target}-${keyword}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            sourceHandle: keyword,
          }));
        return [...eds, ...newEdges];
      });

      const keywordList = edgeKeywords.join(", ");
      toast({
        title: "Edges Created",
        description: `Created ${edgeKeywords.length} edge(s) with keywords: ${keywordList}`,
        variant: "default",
      });
    }
    setShowEdgeDialog(false);
    setPendingConnection(null);
    setEdgeKeywords(["{{OTHER_MSG}}"]);
  };

  const handleEdgeCancel = () => {
    setShowEdgeDialog(false);
    setPendingConnection(null);
    setEdgeKeywords(["{{OTHER_MSG}}"]);
  };

  const addKeyword = () => {
    if (edgeKeyword.trim() && !edgeKeywords.includes(edgeKeyword.trim())) {
      setEdgeKeywords([...edgeKeywords, edgeKeyword.trim()]);
      setEdgeKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setEdgeKeywords(edgeKeywords.filter(k => k !== keywordToRemove));
  };

  // Flows list UI
  return (
    <div>
      {/* Save Dialog for Title Only */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Flow Title</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flow Title</label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter flow title"
                value={flowTitle}
                onChange={e => setFlowTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flow ID (Auto-generated)</label>
              <input
                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600"
                value={flowId}
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">This ID is automatically generated and cannot be changed</p>
            </div>
            <button
              className="bg-blue-500 text-white rounded px-4 py-2 mt-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDialogSave}
              disabled={!(flowTitle || '').trim()}
            >
              Save Flow
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edge Creation Dialog */}
      <Dialog open={showEdgeDialog} onOpenChange={setShowEdgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Edge Keyword</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Keyword/Trigger</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter keyword (e.g., hii, hello, welcome)"
                  value={edgeKeyword}
                  onChange={e => setEdgeKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <button
                  className="bg-blue-500 text-white rounded px-3 py-2 hover:bg-blue-600 disabled:opacity-50"
                  onClick={addKeyword}
                  disabled={!edgeKeyword.trim()}
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Press Enter or click Add to add keywords. Use <code className="bg-gray-100 px-1 rounded">{"{{OTHER_MSG}}"}</code> to catch any message.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Keywords</label>
              <div className="flex flex-wrap gap-1 min-h-[40px] p-2 border rounded bg-gray-50">
                {edgeKeywords.length === 0 ? (
                  <span className="text-gray-400 text-sm">No keywords added yet</span>
                ) : (
                  edgeKeywords.map((keyword, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                        title="Remove keyword"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Quick keywords:</p>
              <div className="flex flex-wrap gap-1">
                {["hii", "hello", "welcome", "hi", "hey", "start", "help", "{{OTHER_MSG}}"].map((keyword) => (
                  <button
                    key={keyword}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    onClick={() => {
                      if (!edgeKeywords.includes(keyword)) {
                        setEdgeKeywords([...edgeKeywords, keyword]);
                      }
                    }}
                    disabled={edgeKeywords.includes(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEdgeCreate}
                disabled={edgeKeywords.length === 0}
              >
                Create Edges ({edgeKeywords.length})
              </button>
              <button
                className="bg-gray-300 text-gray-700 rounded px-4 py-2 hover:bg-gray-400"
                onClick={handleEdgeCancel}
              >
                Cancel
              </button>
            </div>
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
            {/* NodeConfigPanel sidebar removed as requested */}
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
