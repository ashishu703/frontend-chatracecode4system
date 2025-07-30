"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Save, X, Plus, Trash2, Edit, Star } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNodeContext } from "../node-context"
import serverHandler from "@/utils/serverHandler"

// HELPER: This function ensures every option has a unique/stable ID. This is crucial for fixing the connection bug.
const initializeOptions = (optionsData) => {
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
  const [isSaved, setIsSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(data?.title || "Simple Message");
  const [messageNumber, setMessageNumber] = useState(data?.messageNumber || 1);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { deleteNode, updateNode, startNodeId, setStartNodeId } = useNodeContext();

  // FIX: 'options' is now an array of objects ({id, value}) to ensure stable keys and handle IDs.
  const [options, setOptions] = useState(() => initializeOptions(data?.options));

  const isStartNode = startNodeId === id;
  
  // This effect syncs the title/message if data changes from outside
  useEffect(() => {
    if (data?.title) setTitle(data.title);
    if (data?.messageNumber) setMessageNumber(data.messageNumber);
    if (data?.message) setMessage(data.message);
  }, [data?.title, data?.messageNumber, data?.message]);

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

  const handleSave = () => setShowDialog(true);

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
  const handleTitleEdit = () => setIsEditingTitle(true);
  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (updateNode) updateNode(id, { ...data, title });
  };
  const handleTitleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleTitleSave(); };

  const handleSetStartNode = useCallback(() => {
    if (setStartNodeId) {
      setStartNodeId(id);
      toast({ title: "Start node set successfully!", variant: "default" });
    }
  }, [id, setStartNodeId, toast]);

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-800 !border-0" />
      <Card className={`w-[280px] ${selected ? "ring-2 ring-blue-500" : ""}`}>
        <div className="bg-red-400 text-white px-3 py-2 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleSave} onKeyPress={handleTitleKeyPress} className="bg-white text-gray-800 px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white" autoFocus />
            ) : (
              <span className="font-medium text-sm">{title} #{messageNumber}</span>
            )}
            <button onClick={handleTitleEdit} className="p-1 hover:bg-red-500 rounded transition-colors" title="Edit title"><Edit className="w-3 h-3" /></button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleSetStartNode} className="p-1 hover:bg-red-500 rounded transition-colors" title="Set as Start Node"><Star className={`w-4 h-4 transition-colors ${isStartNode ? "text-yellow-400 fill-yellow-400" : "text-white"}`} /></button>
            <button onClick={handleSave} className="p-1" title="Save"><Save className={`w-4 h-4 ${isSaved ? "text-green-200" : "text-white"}`} /></button>
            <button onClick={handleClose} className="p-1" title="Close"><X className="w-4 h-4" /></button>
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

        <div className="p-3 space-y-2 bg-white rounded-b-lg">
          <textarea
            value={message}
            onChange={(e) => {
              const newMessage = e.target.value;
              setMessage(newMessage);
              if (updateNode) updateNode(id, { ...data, message: newMessage });
            }}
            className="w-full h-16 p-2 border border-gray-300 rounded text-sm resize-none text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter your message here"
          />
          <div className="space-y-2">
            {options.map((option, index) => (
              // FIX: Using the stable 'option.id' as the key is better for React.
              <div key={option.id} className="flex items-center gap-2 relative">
                <input
                  value={option.value}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter an option"
                />
                <div className="flex items-center">
                  {options.length > 1 && (<button onClick={() => removeOption(index)} className="bg-red-400 hover:bg-red-500 text-white p-2 rounded transition-colors" title="Remove"><Trash2 className="w-3 h-3" /></button>)}
                  {index === options.length - 1 && (<button onClick={addOption} className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded transition-colors ml-1" title="Add"><Plus className="w-3 h-3" /></button>)}
                </div>

                <Handle
                  type="source"
                  position={Position.Right}
                  id={option.id}
                  className="!w-3 !h-3 !bg-gray-600"
                  style={{ right: -14 }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TextNode;