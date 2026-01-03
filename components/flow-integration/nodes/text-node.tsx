"use client"

import { Handle, Position, type NodeProps, useEdges } from "@xyflow/react"
import { Save, X, Copy, MessageSquare, Play } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"

// HELPER: This function ensures every option has a unique/stable ID. This is crucial for fixing the connection bug.
const initializeOptions = (optionsData: any) => {
  if (!optionsData || !Array.isArray(optionsData) || optionsData.length === 0) {
    return [{ id: `opt-${Date.now()}`, value: "" }];
  }
  return optionsData.map((opt, index) => {
    if (typeof opt === 'object' && opt.id && typeof opt.value !== 'undefined') {
      return opt;
    }
    return {
      id: `opt-${Date.now()}-${index}`,
      value: typeof opt === 'string' ? opt : ''
    };
  });
};

export function TextNode({ data, selected, id }: NodeProps<any>) {
  const [message, setMessage] = useState(data?.message || "");
  const [showDialog, setShowDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [title, setTitle] = useState(data?.title || "Send Text");
  const [messageNumber, setMessageNumber] = useState(data?.messageNumber || 1);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { deleteNode, updateNode, startNodeId, setStartNodeId } = useNodeContext();

  // FIX: 'options' is now an array of objects ({id, value}) to ensure stable keys and handle IDs.
  const [options, setOptions] = useState(() => initializeOptions(data?.options));

  // Check if continue handle is connected
  const edges = useEdges();
  const isContinueConnected = edges.some(
    edge => edge.source === id && edge.sourceHandle === "continue"
  );

  const isStartNode = startNodeId === id;
  
  // This effect syncs the title/message if data changes from outside
  useEffect(() => {
    if (data?.title) setTitle(data.title);
    if (data?.messageNumber) setMessageNumber(data.messageNumber);
    if (data?.message) setMessage(data.message);
    if (data?.keywords && Array.isArray(data.keywords)) {
      const kwArray = data.keywords.map((kw: any, idx: number) => ({
        id: kw.id || `kw-${Date.now()}-${idx}`,
        value: typeof kw === 'string' ? kw : (kw.value || '')
      }));
      // Ensure we show next empty field if current has value (up to 11)
      const result = [...kwArray];
      for (let i = 0; i < result.length && i < 10; i++) {
        if (result[i].value.trim() && (i === result.length - 1)) {
          result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" });
        }
      }
      setKeywords(result.slice(0, 11));
    } else if (data?.options && Array.isArray(data.options)) {
      const opts = initializeOptions(data.options).map(opt => ({ id: opt.id, value: opt.value }));
      const result = [...opts];
      for (let i = 0; i < result.length && i < 10; i++) {
        if (result[i].value.trim() && (i === result.length - 1)) {
          result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" });
        }
      }
      setKeywords(result.slice(0, 11));
    }
  }, [data?.title, data?.messageNumber, data?.message, data?.keywords, data?.options]);

  // FIX: All functions now work with the new options structure [{id, value}].
  const addOption = () => {
    const newOptions = [...options, { id: `opt-${Date.now()}`, value: "" }];
    setOptions(newOptions);
    if (updateNode) updateNode(id, { ...data, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = options.map((opt, i) => i === index ? { ...opt, value } : opt);
    setOptions(newOptions);
    if (updateNode) updateNode(id, { ...data, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (updateNode) updateNode(id, { ...data, options: newOptions });
    }
  };

  const handleSave = () => {
    setShowDialog(true);
  };

  const handleDialogSave = async () => {
    if (!templateName.trim()) {
      toast({ title: "Template name is required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const payload = {
      content: { type: "text", text: { preview_url: true, body: message || "" } },
      title: templateName,
      type: "TEXT"
    };
    try {
      const response = await serverHandler.post('/api/templet/add_new', payload);
      if ((response.data as any).success) {
        setIsSaved(true);
        setShowDialog(false);
        toast({ title: "Template saved successfully!", variant: "default" });
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        toast({ title: "Error", description: (response.data as any).msg || "Failed to save template", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.msg || "Failed to save template", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => { if (deleteNode) deleteNode(id); };
  const [isHovered, setIsHovered] = useState(false);

  const handleSetStartNode = useCallback(() => {
    if (setStartNodeId) {
      if (isStartNode) {
        setStartNodeId(null);
        toast({ title: "Start node removed", variant: "default" });
      } else {
      setStartNodeId(id);
      toast({ title: "Start node set successfully!", variant: "default" });
    }
    }
  }, [id, setStartNodeId, toast, isStartNode]);

  const { duplicateNode } = useNodeContext();
  const handleCopy = useCallback(() => {
    if (duplicateNode) {
      duplicateNode(id);
      toast({ title: "Node copied successfully!", variant: "default" });
    }
  }, [id, duplicateNode, toast]);

  // Initialize keywords - show next field when current has value, up to 11 max
  const [keywords, setKeywords] = useState(() => {
    if (data?.keywords && Array.isArray(data.keywords)) {
      const kwArray = data.keywords.map((kw: any, idx: number) => ({
        id: kw.id || `kw-${Date.now()}-${idx}`,
        value: typeof kw === 'string' ? kw : (kw.value || '')
      }));
      // Ensure we show next empty field if current has value (up to 11)
      const result = [...kwArray];
      for (let i = 0; i < result.length && i < 10; i++) {
        if (result[i].value.trim() && (i === result.length - 1)) {
          result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" });
        }
      }
      return result.slice(0, 11); // Max 11 keywords
    }
    const opts = options.length > 0 ? options.map(opt => ({ id: opt.id, value: opt.value })) : [{ id: `kw-${Date.now()}`, value: "" }];
    // Ensure we show next empty field if current has value
    const result = [...opts];
    for (let i = 0; i < result.length && i < 10; i++) {
      if (result[i].value.trim() && (i === result.length - 1)) {
        result.push({ id: `kw-${Date.now()}-${i + 1}`, value: "" });
      }
    }
    return result.slice(0, 11); // Max 11 keywords
  });

  const keywordInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = { ...newKeywords[index], value };
    
    // If current keyword has text and it's the last one, add next (up to 11 max)
    if (value.trim() && index === newKeywords.length - 1 && newKeywords.length < 11) {
      newKeywords.push({ id: `kw-${Date.now()}`, value: "" });
    }
    
    // Remove empty keywords after current (but keep at least one)
    if (!value.trim()) {
      // Remove all empty keywords after this index
      for (let i = newKeywords.length - 1; i > index; i--) {
        if (!newKeywords[i].value.trim()) {
          newKeywords.pop();
        } else {
          break;
        }
      }
    }
    
    setKeywords(newKeywords);
    if (updateNode) updateNode(id, { ...data, keywords: newKeywords, options: newKeywords });
  };

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
            onClick={handleClose} 
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
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base">
                {title} #{messageNumber}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">Text Message</p>
          </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-3">
          {/* BODY Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">BODY</label>
          <textarea
            id="text-message"
            value={message}
            onChange={(e) => {
              const newMessage = e.target.value;
              setMessage(newMessage);
              if (updateNode) updateNode(id, { ...data, message: newMessage });
            }}
              className="w-full min-h-[60px] p-2.5 border border-gray-300 rounded-lg text-sm resize-none text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="This is a first flow."
            />
                </div>

          {/* KEYWORDS Section */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">KEYWORDS</label>
            <div className="space-y-2">
              {keywords.map((keyword, index) => (
                <div key={keyword.id} className="flex items-center gap-2 relative">
                  <input
                    ref={(el) => {
                      keywordInputRefs.current[keyword.id] = el;
                    }}
                    value={keyword.value}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    placeholder={index === 0 ? "hiii" : `Keyword ${index + 1}`}
                  />
                <Handle
                  type="source"
                  position={Position.Right}
                    id={keyword.id}
                    className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white absolute right-2 top-1/2 transform -translate-y-1/2"
                    style={{ right: '8px' }}
                />
              </div>
            ))}
          </div>
          </div>
                
          {/* Continue Section */}
          <div className="flex items-center justify-end pt-2 relative">
            <span className="text-sm text-gray-700 font-medium mr-2">Continue</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="continue"
              className={`!w-5 !h-5 !border-2 !border-white !rounded-full absolute right-0 top-1/2 transform -translate-y-1/2 ${isContinueConnected ? '!bg-blue-500' : '!bg-gray-400'}`}
              style={{ right: '-10px' }}
                />
              </div>
            </div>

        {/* Dialog for saving template */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Save Template</DialogTitle></DialogHeader>
            <input className="border rounded px-2 py-1 w-full" placeholder="Enter template name" value={templateName} onChange={e => setTemplateName(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !isSaving) handleDialogSave() }} autoFocus />
            <DialogFooter>
              <button className="bg-green-500 text-white rounded px-3 py-1 mt-2 disabled:opacity-50" onClick={handleDialogSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
    </div>
  );
}

export default TextNode;