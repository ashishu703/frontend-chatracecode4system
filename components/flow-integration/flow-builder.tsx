"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// import { NodeSidebar } from "./node-sidebar"
import { NodeConfigPanel } from "./node-config-panel";
// FlowHeader is not used here
import { NodeContextProvider } from "./node-context";
import { nodeTypes } from "./nodes";
import { validateConnection } from "@/lib/flow-integration/flow-validation";
import type {
  FlowData,
  NodeData,
  FlowTemplate,
} from "@/types/flow-integration/flow";
import {
  Plus,
  ZoomIn,
  ZoomOut,
  Layout,
  Save,
  Copy as CopyIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { Button } from "./ui/button";
import type { Node as XYNode } from "@xyflow/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const initialNodes: Node<NodeData>[] = [
  {
    id: `simpleMessage-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`,
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

const initialEdges: Edge[] = [];

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
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAutoOrganize: () => void;
}
function FlowToolbar({
  onAddNode,
  addPopoverOpen,
  setAddPopoverOpen,
  toolbarNodeOptions,
  onSave,
  onZoomIn,
  onZoomOut,
  onAutoOrganize,
}: FlowToolbarProps) {
  return (
    <TooltipProvider>
      <div
        className="fixed left-1/2 bottom-8 z-50 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-lg"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[400px] p-4 z-50">
                <div className="grid grid-cols-2 gap-2">
                  {toolbarNodeOptions.map((opt: ToolbarNodeOption) => (
                    <Button
                      key={opt.type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        onAddNode(opt.type);
                        setAddPopoverOpen(false);
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>Add Node</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSave} variant="default" size="icon" className="bg-blue-500 hover:bg-blue-600">
              <Save className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save Flow</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onZoomIn}>
              <ZoomIn className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onZoomOut}>
              <ZoomOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAutoOrganize}>
              <Layout className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto Organize</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

interface FlowBuilderContentProps {
  initialFlowData?: any;
}

function FlowBuilderContent({ initialFlowData }: FlowBuilderContentProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [uiState, setUiState] = useState({
    isPreviewMode: false,
    sidebarOpen: false,
    hasShownNoFlowsToast: false,
    showSaveDialog: false,
    pendingSave: false,
    addPopoverOpen: false,
  });

  const updateUiState = (updates: Partial<typeof uiState>) => {
    setUiState((prev) => ({ ...prev, ...updates }));
  };
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [flowTitle, setFlowTitle] = useState("");
  const [flowId, setFlowId] = useState("");

  const { toast } = useToast();

  // Auto-generate flow ID when creating a new flow only
  useEffect(() => {
    if (
      !flowId &&
      !(initialFlowData && (initialFlowData.flowId || initialFlowData.flow_id))
    ) {
      const generatedId = `flow_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setFlowId(generatedId);
    }
  }, [flowId, initialFlowData]);

  // Load initial flow data if provided (for editing mode)
  useEffect(() => {
    if (initialFlowData) {
      const mapBusinessToUiType = (businessType: string) => {
        switch (businessType) {
          case "simpleMessage":
            return "simpleMessageNode";
          case "imageMessage":
            return "imageMessageNode";
          case "audioMessage":
            return "audioMessageNode";
          case "videoMessage":
            return "videoMessageNode";
          case "documentMessage":
            return "documentMessageNode";
          case "buttonMessage":
            return "buttonMessageNode";
          case "listMessage":
            return "listMessageNode";
          case "assignAgent":
            return "assignAgentNode";
          case "disableChatTill":
            return "disableChatTillNode";
          case "requestAPI":
            return "requestAPINode";
          case "mailMessage":
            return "sendEmailNode";
          case "condition":
            return "conditionNode";
          case "delay":
            return "delayNode";
          case "start":
            return "startNode";
          default:
            return "genericNode";
        }
      };

      const transformNodes = (nodesToTransform: any[]) => {
        return Array.isArray(nodesToTransform)
          ? nodesToTransform.map((node: any) => {
              const businessType =
                node.nodeType || node.type || node?.data?.type;
              const uiType = mapBusinessToUiType(businessType);
              return {
                ...node,

                id: node.id,
                type: uiType,
                data: {
                  // Ensure business type is present inside data for editors
                  type: businessType,
                  ...(node.data || {}),
                },
              } as any;
            })
          : [];
      };

      const transformedNodes = transformNodes(initialFlowData.nodes);
      const transformedEdges = Array.isArray(initialFlowData.edges)
        ? initialFlowData.edges
        : [];

      setNodes(transformedNodes);
      setEdges(transformedEdges);
      // After nodes/edges mount, adjust viewport so connections render without refresh
      requestAnimationFrame(() => {
        try {
          reactFlowInstance.fitView();
        } catch {}
      });
      setFlowTitle(initialFlowData.title || "");
      // Handle both flowId and flow_id from API response
      setFlowId(initialFlowData.flowId || initialFlowData.flow_id || flowId);
      toast({
        title: "Success",
        description: "Flow loaded for editing",
        variant: "default",
      });
    }
  }, [initialFlowData, flowId, toast]);
  const queryClient = useQueryClient();
  const [startNodeId, setStartNodeId] = useState<string | null>(null);

  const toolbarNodeOptions = [
    {
      type: "simpleMessageNode",
      label: "Text Message",
      dataType: "simpleMessage",
    },
    {
      type: "videoMessageNode",
      label: "Video Message",
      dataType: "videoMessage",
    },
    {
      type: "imageMessageNode",
      label: "Image Message",
      dataType: "imageMessage",
    },
    {
      type: "audioMessageNode",
      label: "Audio Message",
      dataType: "audioMessage",
    },
    {
      type: "documentMessageNode",
      label: "Document Message",
      dataType: "documentMessage",
    },
    {
      type: "buttonMessageNode",
      label: "Button Message",
      dataType: "buttonMessage",
    },
    { type: "listMessageNode", label: "List Message", dataType: "listMessage" },
    { type: "sendEmailNode", label: "Mail Node", dataType: "mailMessage" },
    {
      type: "disableChatTillNode",
      label: "Disable Chat",
      dataType: "disableChatTill",
    },
    { type: "requestAPINode", label: "API Request", dataType: "requestAPI" },
    { type: "assignAgentNode", label: "Assign Agent", dataType: "assignAgent" },
    { type: "conditionNode", label: "Condition", dataType: "condition" },
    { type: "delayNode", label: "Delay", dataType: "delay" },
  ];
  const [pendingConnection, setPendingConnection] = useState<any>(null);

  const handleAddNode = (nodeType: string) => {
    const centerX = 400 + Math.random() * 200;
    const centerY = 200 + Math.random() * 200;
    const option = toolbarNodeOptions.find((opt) => opt.type === nodeType);
    if (!option) return;
    let defaultState = getDefaultConfig(option.dataType as NodeData["type"]);

    const existingMessageNodes = nodes.filter(
      (node) =>
        node.type === "simpleMessageNode" ||
        node.type === "imageMessageNode" ||
        node.type === "videoMessageNode" ||
        node.type === "audioMessageNode" ||
        node.type === "documentMessageNode" ||
        node.type === "buttonMessageNode" ||
        node.type === "listMessageNode" ||
        node.type === "sendEmailNode"
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
    updateUiState({ addPopoverOpen: false });

    if (pendingConnection) {
      const newEdge: Edge = {
        id: `e${pendingConnection.source}-${
          newNode.id
        }-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        source: pendingConnection.source,
        target: newNode.id,
        sourceHandle: pendingConnection.sourceHandle,
        type: "smoothstep",
      };
      setEdges((eds) => eds.concat(newEdge));
      setPendingConnection(null);
      console.log("Node created and connected from pending connection");
    }
  };

  const addFlowMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        console.log(
          "Sending payload to /api/chat_flow/add_new:",
          JSON.stringify(payload, null, 2)
        );
        const res = await serverHandler.post("/api/chat_flow/add_new", payload);
        console.log("API response:", res.data);
        return res.data as any;
      } catch (error: any) {
        console.error("API error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config,
        });
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log("Flow save response:", data);
      if (data.success) {
        const savedFlowId = data.id || data.flowId || flowId;
        const savedTitle = data.title || flowTitle;

        toast({
          title: "Success",
          description: `Flow saved successfully`,
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["chat-flows"] });

        console.log("Flow saved successfully:", {
          databaseFlowId: savedFlowId,
          flowIdString: flowId,
          title: savedTitle,
          nodesCount: nodes.length,
          edgesCount: edges.length,
          edges: edges,
          fullResponse: data,
          message: data.msg,
        });

        
      } else {
        toast({
          title: "Error",
          description: data.msg || "Please subscribe a plan to proceed",
          variant: "destructive",
        });
        console.error("Save failed:", data);
      }
    },
    onError: (err: any) => {
      console.error("Mutation error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      // Check for specific error messages
      const errorData = err.response?.data;
      let errorMessage = "An error occurred while saving the flow";
      
      if (errorData?.message === "User plan expired") {
        errorMessage = "Your subscription plan has expired. Please renew your plan to continue using this feature.";
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Mutation error:", err);
    },
  });

  const updateFlowMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        console.log(
          "Sending payload to /api/chat_flow/update:",
          JSON.stringify(payload, null, 2)
        );
        const res = await serverHandler.post("/api/chat_flow/update", payload);
        console.log("API response:", res.data);
        return res.data as any;
      } catch (error: any) {
        console.error("API error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config,
        });
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Success",
          description: "Flow updated successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["chat-flows"] });

        console.log("Flow updated successfully:", {
          message: data.msg,
          fullResponse: data,
        });
      } else {
        toast({
          title: "Error",
          description: data.msg || "Failed to update flow",
          variant: "destructive",
        });
        console.error("Update failed:", data);
      }
    },
    onError: (err: any) => {
      console.error("Mutation error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast({
        title: "Error",
        description: `API error: ${err?.message || err}`,
        variant: "destructive",
      });
      console.error("Mutation error:", err);
    },
  });

  const deleteFlowMutation = useMutation({
    mutationFn: async ({ id, flowId }: { id: string; flowId: string }) => {
      const res = await serverHandler.post("/api/chat_flow/del_flow", {
        id,
        flowId,
      });
      return res.data as any;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Success",
          description: "Flow deleted",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["chat-flows"] });
      } else {
        toast({
          title: "Error",
          description: data.msg,
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const uploadMedia = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await serverHandler.post(
        "/api/user/return_media_url",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if ((res.data as any).success) {
        return (res.data as any).url;
      }
      return false;
    } catch (err) {
      toast({
        title: "Error",
        description: "Media upload failed",
        variant: "destructive",
      });
      return false;
    }
  };

  const onConnectStart = useCallback((event: any, params: any) => {
    console.log("Connection start:", params);
    setPendingConnection({
      source: params.nodeId,
      sourceHandle: params.handleId,
      target: "",
      targetHandle: null,
    });
  }, []);

  const onConnectEnd = useCallback((event: any) => {
    console.log("Connection end:", event);
    
    setPendingConnection((prev: any) => {
      if (prev && !prev.target) {
        console.log("Connection ended without target, opening popup");
        updateUiState({ addPopoverOpen: true });
      }
      return prev; 
    });
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log("Connection attempt:", params);

      setPendingConnection(null);
      updateUiState({ addPopoverOpen: false }); 

      if (params.source && params.target && params.source !== params.target) {
        const existingConnection = edges.find(
          (edge) =>
            edge.source === params.source &&
            edge.sourceHandle === params.sourceHandle
        );

        if (existingConnection) {
          console.log(
            "Connection already exists from this source handle, removing old connection"
          );
          setEdges((eds) =>
            eds.filter(
              (edge) =>
                !(
                  edge.source === params.source &&
                  edge.sourceHandle === params.sourceHandle
                )
            )
          );
          toast({
            title: "Connection Updated",
            description:
              "Previous connection removed and new connection created.",
            variant: "default",
          });
        }

        console.log("Connection validated, creating edge");
        const newEdge: Edge = {
          id: `e${params.source}-${params.target}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 5)}`,
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle,
          type: "smoothstep",
        };
        setEdges((eds) => eds.concat(newEdge));
      } else {
        console.log("Connection validation failed:", {
          source: params.source,
          target: params.target,
        });
      }
    },
    [setEdges, edges, toast]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleAutoOrganize = useCallback(() => {
    if (nodes.length === 0) return;
    
    const nodeWidth = 400;
    const nodeHeight = 300;
    const horizontalSpacing = 450;
    const verticalSpacing = 350;
    
    const organizedNodes = nodes.map((node, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return {
        ...node,
        position: {
          x: col * horizontalSpacing + 100,
          y: row * verticalSpacing + 100,
        },
      };
    });
    
    setNodes(organizedNodes);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 100);
  }, [nodes, setNodes, reactFlowInstance]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: `${type}-${Date.now()}`,
        type: `${type}Node`,
        position,
        data: {
          type: type as NodeData["type"],
          data: { state: getDefaultConfig(type as NodeData["type"]) },
        } as NodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const getDefaultConfig = (type: NodeData["type"]) => {
    switch (type) {
      case "simpleMessage":
        return {
          state: {
            msgContent: {
              text: { body: "" },
            },
            keyword: [],
          },
        };
      case "imageMessage":
        return {
          state: {
            msgContent: {
              image: { link: "", caption: "" },
            },
          },
        };
      case "audioMessage":
        return {
          state: {
            msgContent: {
              audio: { link: "" },
            },
          },
        };
      case "videoMessage":
        return {
          state: {
            msgContent: {
              video: { link: "", caption: "" },
            },
          },
        };
      case "documentMessage":
        return {
          state: {
            msgContent: {
              document: { link: "", caption: "" },
            },
          },
        };
      case "buttonMessage":
        return {
          state: {
            msgContent: {
              interactive: {
                type: "button",
                body: "",
                action: { buttons: [] },
              },
            },
          },
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
                action: { button: "", sections: [] },
              },
            },
          },
        };
      case "mailMessage":
        return {
          state: {
            label: "Send Email",
            from: "",
            to: "",
            subject: "",
            preheader: "",
            headline: "",
            text: "",
            image: "",
            button: "",
          },
        };
      case "assignAgent":
        return {
          state: {
            agentId: "",
            assignmentType: "specific",
            fallbackAction: "continue",
          },
        };
      case "disableChatTill":
        return {
          state: {
            duration: 3600,
            message: "",
          },
        };
      case "requestAPI":
        return {
          state: {
            method: "POST",
            url: "",
            headers: {},
            body: {},
            responseMapping: {},
          },
        };
      case "condition":
        return {
          state: {
            conditions: [],
            onTrueGoTo: "",
            onFalseGoTo: "",
            delayInSeconds: 0,
          },
        };
      case "delay":
        return {
          state: {
            duration: 1,
            unit: "seconds",
          },
        };
      default:
        return { state: {} };
    }
  };

  // Save flow handler
  const saveFlow = async () => {
    if (
      !(flowTitle || "").trim() ||
      !Array.isArray(nodes) ||
      nodes.length === 0 ||
      !Array.isArray(edges)
    ) {
      toast({
        title: "Error",
        description:
          "Please fill the title and ensure you have at least one node in your flow.",
        variant: "destructive",
      });
      console.error("Validation failed:", { flowTitle, flowId, nodes, edges });
      return;
    }

    console.log("Original nodes before cleaning:", nodes);

    const cleanedNodes = nodes
      .map((node) => {
        // Ensure we have the node type - try multiple sources
        let nodeType = node.data?.type;

        // Fallback: if data.type is not available, try to extract from node.type
        if (!nodeType && node.type) {
          // Remove "Node" suffix from node.type to get the business type
          const extractedType = node.type.replace("Node", "");
          // Convert camelCase to the expected format
          if (extractedType === "simpleMessage") nodeType = "simpleMessage";
          else if (extractedType === "imageMessage") nodeType = "imageMessage";
          else if (extractedType === "videoMessage") nodeType = "videoMessage";
          else if (extractedType === "audioMessage") nodeType = "audioMessage";
          else if (extractedType === "documentMessage")
            nodeType = "documentMessage";
          else if (extractedType === "buttonMessage")
            nodeType = "buttonMessage";
          else if (extractedType === "listMessage") nodeType = "listMessage";
          else if (extractedType === "disableChatTill")
            nodeType = "disableChatTill";
          else if (extractedType === "requestAPI") nodeType = "requestAPI";
          else if (extractedType === "assignAgent") nodeType = "assignAgent";
          else if (extractedType === "condition") nodeType = "condition";
        }

        if (!nodeType) {
          console.error("Node missing type information:", node);
          toast({
            title: "Error",
            description: `Node ${node.id} is missing type information`,
            variant: "destructive",
          });
          return null;
        }

        const cleanedNode = {
          id: node.id,
          type: node.type,
          nodeType: nodeType,
          position: node.position,
          data: node.data,
        };

        console.log(`Cleaned node ${node.id}:`, cleanedNode);
        return cleanedNode;
      })
      .filter(Boolean) as any[]; // Remove any null nodes

    if (cleanedNodes.length === 0) {
      toast({
        title: "Error",
        description: "No valid nodes to save",
        variant: "destructive",
      });
      return;
    }

    // Edges: persist exactly what the user created
    let cleanedEdges: Edge[] = [] as any;

    if (edges.length === 0) {
      // do nothing
    } else {
      // Process manual edges; keep the handle IDs and include type
      cleanedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        type: edge.type || "smoothstep",
      }));
    }

    const payload = {
      title: (flowTitle || "").trim(),
      flowId: (flowId || "").trim(),
      nodes: cleanedNodes,
      edges: cleanedEdges,
      // Add a flag to indicate this is a new flow creation
      isNewFlow: !initialFlowData || !initialFlowData.flowId,
    };

    console.log("Saving flow with payload:", JSON.stringify(payload, null, 2));

    // Test payload structure
    console.log("Testing payload structure:");
    payload.nodes.forEach((node, index) => {
      if (node) {
        console.log(`Node ${index}:`, {
          id: node.id,
          type: node.type,
          nodeType: node.nodeType,
          has_nodeType: "nodeType" in node,
          nodeType_value: node.nodeType,
        });
      }
    });

    // Debug edges structure
    console.log("Testing edges structure:");
    payload.edges.forEach((edge, index) => {
      console.log(`Edge ${index}:`, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        has_sourceHandle: "sourceHandle" in edge,
        sourceHandle_value: edge.sourceHandle,
      });
    });

    // Determine if this is a new flow or updating existing flow
    if (
      initialFlowData &&
      (initialFlowData.flowId || initialFlowData.flow_id)
    ) {
      addFlowMutation.mutate(payload);
    } else {
      addFlowMutation.mutate(payload);
    }
  };

  // Load flow by ID
  const loadFlow = async (id: string) => {
    try {
      const res = await serverHandler.post("/api/chat_flow/get_by_flow_id", {
        flowId: id,
      });
      const api = res.data as any;
      if (api && api.success) {
        // Backend returns flattened shape: { success: true, nodes, edges, ... }
        const flowData = api.data ?? api;

        const mapBusinessToUiType = (businessType: string) => {
          switch (businessType) {
            case "simpleMessage":
              return "simpleMessageNode";
            case "imageMessage":
              return "imageMessageNode";
            case "audioMessage":
              return "audioMessageNode";
            case "videoMessage":
              return "videoMessageNode";
            case "documentMessage":
              return "documentMessageNode";
            case "buttonMessage":
              return "buttonMessageNode";
            case "listMessage":
              return "listMessageNode";
            case "assignAgent":
              return "assignAgentNode";
            case "disableChatTill":
              return "disableChatTillNode";
            case "requestAPI":
              return "requestAPINode";
            case "mailMessage":
              return "sendEmailNode";
            case "condition":
              return "conditionNode";
          case "delay":
            return "delayNode";
            case "start":
              return "startNode";
            default:
              return "genericNode";
          }
        };

        const transformedNodes = Array.isArray(flowData.nodes)
          ? flowData.nodes.map((node: any) => {
              const businessType =
                node.nodeType || node.type || node?.data?.type;
              return {
                ...node,
                id: node.id,
                type: mapBusinessToUiType(businessType),
                data: { type: businessType, ...(node.data || {}) },
              };
            })
          : [];

        const incomingEdges = Array.isArray(flowData.edges)
          ? flowData.edges
          : [];

        // Do not inject placeholder handles; render exactly what backend sent

        setNodes(transformedNodes);
        setEdges(incomingEdges);
        try {
          requestAnimationFrame(() => reactFlowInstance.fitView());
        } catch {}
        setFlowTitle(flowData.title || "");
        setFlowId(flowData.flowId || flowData.flow_id || id);
        toast({
          title: "Success",
          description: "Flow loaded",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: (api as any)?.msg || "Failed to load flow",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load flow",
        variant: "destructive",
      });
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
    if (!(flowTitle || "").trim()) {
      updateUiState({ showSaveDialog: true, pendingSave: true });
      return;
    }
    saveFlow();
  };

  const handleDialogSave = () => {
    if (!(flowTitle || "").trim()) {
      toast({
        title: "Error",
        description: "Please enter a flow title",
        variant: "destructive",
      });
      return;
    }
    updateUiState({ showSaveDialog: false, pendingSave: false });
    saveFlow();
  };

  // Flows list UI
  return (
    <div>
      {/* Save Dialog for Title Only */}
      <Dialog
        open={uiState.showSaveDialog}
        onOpenChange={(open) => updateUiState({ showSaveDialog: open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Flow Title</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flow Title
              </label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter flow title"
                value={flowTitle}
                onChange={(e) => setFlowTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flow ID (Auto-generated)
              </label>
              <input
                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600"
                value={flowId}
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                This ID is automatically generated and cannot be changed
              </p>
            </div>
            <button
              className="bg-blue-500 text-white rounded px-4 py-2 mt-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDialogSave}
              disabled={!(flowTitle || "").trim()}
            >
              Save Flow
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <NodeContextProvider
        nodes={nodes}
        setNodes={setNodes}
        edges={edges}
        setEdges={setEdges}
        startNodeId={startNodeId}
        setStartNodeId={setStartNodeId}
      >
        <div className="h-full flex flex-col" style={{ backgroundColor: '#F2F6FA' }}>
          <div className="flex-1 flex relative">
            {/* Canvas */}
            <div
              className="flex-1 relative w-full h-[calc(100vh-64px)] min-h-[400px]"
              ref={reactFlowWrapper}
              style={{ 
                backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundColor: '#F2F6FA'
              }}
            >
              <ReactFlow
                nodes={nodes as any}
                edges={edges as any}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes as any}
                fitView
                className={uiState.isPreviewMode ? "pointer-events-none" : ""}
              >
                <Background color="#d1d5db" gap={20} />
                <Controls />
                <MiniMap
                  nodeColor={(node) => {
                    switch (node.data?.type) {
                      case "start":
                        return "#10b981";
                      case "text":
                        return "#3b82f6";
                      case "image":
                        return "#8b5cf6";
                      case "apiRequest":
                        return "#f59e0b";
                      default:
                        return "#6b7280";
                    }
                  }}
                />
              </ReactFlow>
              {/* Floating toolbar centered at bottom */}
              <FlowToolbar
                onAddNode={handleAddNode}
                addPopoverOpen={uiState.addPopoverOpen}
                setAddPopoverOpen={(open) =>
                  updateUiState({ addPopoverOpen: open })
                }
                toolbarNodeOptions={toolbarNodeOptions}
                onSave={handleSaveClick}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onAutoOrganize={handleAutoOrganize}
              />
            </div>
          </div>
        </div>
      </NodeContextProvider>
    </div>
  );
}

interface FlowBuilderProps {
  initialFlowData?: any;
}

export function FlowBuilder({ initialFlowData }: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent initialFlowData={initialFlowData} />
    </ReactFlowProvider>
  );
}
