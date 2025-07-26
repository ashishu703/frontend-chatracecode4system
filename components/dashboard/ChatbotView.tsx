"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import serverHandler from '@/utils/serverHandler';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Flow {
  id: number
  uid: string
  flow_id: string
  title: string
  createdAt: string
  prevent_list: any
  ai_list: any
}

interface Chatbot {
  id: number
  title: string
  status: boolean
  flow: Flow
  chats: string[]
  for_all: boolean
}

interface Chat {
  id: string
  name: string
}

interface QuickReply {
  id: string
  text: string
  type: string
  category: string
  created_at: string
}

interface PaginationState {
  page: number
  size: number
  total: number
  totalPages: number
}

const RESPONSE_TYPES = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "button", label: "Button" },
  { value: "list", label: "List" },
]

// Add PAGE_SIZE_OPTIONS for selector
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ChatbotView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"auto" | "canned">("auto")

  // Auto Chatbot States
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [flows, setFlows] = useState<Flow[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [chatbotLoading, setChatbotLoading] = useState(false)
  const [showChatbotForm, setShowChatbotForm] = useState(false)
  const [editBot, setEditBot] = useState<Chatbot | null>(null)
  const [chatbotForm, setChatbotForm] = useState({
    title: "",
    flow: null as Flow | null,
    chats: [] as string[],
    for_all: false,
  })
  const [chatbotSaving, setChatbotSaving] = useState(false)
  const [chatbotPagination, setChatbotPagination] = useState<PaginationState>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  })

  // Canned Responses States
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const [cannedLoading, setCannedLoading] = useState(false)
  const [showCannedForm, setShowCannedForm] = useState(false)
  const [editReply, setEditReply] = useState<QuickReply | null>(null)
  const [cannedForm, setCannedForm] = useState({
    type: "text",
    category: "",
    text: "",
    media: "",
    buttons: [],
    list: [],
  })
  const [cannedSaving, setCannedSaving] = useState(false)
  const [cannedPagination, setCannedPagination] = useState<PaginationState>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  })

  // Add state for search, filter, and page size for both tables
  const [chatbotSearch, setChatbotSearch] = useState('');
  const [chatbotSort, setChatbotSort] = useState('created_at');
  const [chatbotOrder, setChatbotOrder] = useState('desc');
  const [cannedSearch, setCannedSearch] = useState('');
  const [cannedCategory, setCannedCategory] = useState('');
  const [cannedSort, setCannedSort] = useState('category,created_at');
  const [cannedOrder, setCannedOrder] = useState('asc,desc');

  // Mock API Functions
  // Replace fetchChatbots with real API call and full pagination
  const fetchChatbots = async (page = 1, size = 10, search = '', sort = 'created_at', order = 'desc') => {
    setChatbotLoading(true);
    try {
      const res = await serverHandler.get(`/api/chat_flow/get_mine?page=${page}&size=${size}&search=${encodeURIComponent(search)}&sort=${sort}&order=${order}`);
      console.log('API /api/chat_flow/get_mine response:', res.data);
      const data = res.data as any;
      if (data && data.success) {
        // Map the API data to the Chatbot table format if needed
        const apiData = data.data || [];
        const mapped = apiData.map((item: any) => ({
          id: item.id,
          title: item.title,
          flow: item.flow_id || item.flowId || '',
          flow_title: item.title,
          status: item.is_active ?? true, // fallback to true if not present
          chats: [],
          for_all: false,
        }));
        setChatbots(mapped);
        setChatbotPagination({
          page: data.pagination?.currentPage || page,
          size: data.pagination?.pageSize || size,
          total: data.pagination?.totalItems || mapped.length,
          totalPages: data.pagination?.totalPages || 1,
        });
      } else {
        setChatbots([]);
        setChatbotPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
        toast({ title: 'Error', description: data?.msg || 'Failed to fetch chatbots', variant: 'destructive' });
        console.error('API /api/chat_flow/get_mine error:', data);
      }
    } catch (error: any) {
      setChatbots([]);
      setChatbotPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
      toast({ title: 'Error', description: error?.message || 'Failed to fetch chatbots', variant: 'destructive' });
      console.error('API /api/chat_flow/get_mine exception:', error);
    } finally {
      setChatbotLoading(false);
    }
  };

  const fetchFlows = async () => {
    try {
      const res = await serverHandler.get('/api/chat_flow/get_mine');
      const data = res.data as any;
      if (data && data.success) {
        setFlows(data.data || []);
      } else {
        setFlows([]);
        toast({ title: 'Error', description: 'Failed to fetch flows', variant: 'destructive' });
      }
    } catch (error: any) {
      setFlows([]);
      toast({ title: 'Error', description: error?.message || 'Failed to fetch flows', variant: 'destructive' });
    }
  }

  const fetchChats = async () => {
    try {
      const res = await serverHandler.get('/api/chat/get_chats');
      setChats(res.data.data || []);
    } catch (error) {
      setChats([]);
    }
  }

  const openChatbotForm = (bot?: Chatbot) => {
    if (bot) {
      setEditBot(bot)
      setChatbotForm({
        title: bot.title,
        flow: bot.flow,
        chats: bot.chats,
        for_all: bot.for_all,
      })
    } else {
      setEditBot(null)
      setChatbotForm({ title: "", flow: null, chats: [], for_all: false })
    }
    setShowChatbotForm(true)
  }

  // Update CRUD actions to use real API endpoints
  const saveChatbot = async () => {
    if (!chatbotForm.title || !chatbotForm.flow) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setChatbotSaving(true);
    try {
      const payload = {
        chats: chatbotForm.chats,
        for_all: chatbotForm.for_all ? 1 : 0,
        flow_id: chatbotForm.flow.id, // Use database ID (integer) instead of flow_id (string)
        title: chatbotForm.title,
      };

      if (editBot) {
        const updatePayload = { ...payload, id: editBot.id };
        const res = await serverHandler.post('/api/chatbot/update_chatbot', updatePayload);
        if (res.data.success) {
          toast({ title: 'Success', description: 'Chatbot updated successfully' });
        } else {
          toast({ title: 'Error', description: res.data.message || 'Failed to update chatbot', variant: 'destructive' });
        }
      } else {
        const res = await serverHandler.post('/api/chatbot/add_chatbot', payload);
        if (res.data.success) {
          toast({ title: 'Success', description: 'Chatbot created successfully' });
        } else {
          toast({ title: 'Error', description: res.data.message || 'Failed to create chatbot', variant: 'destructive' });
        }
      }
      setShowChatbotForm(false);
      fetchChatbots(chatbotPagination.page, chatbotPagination.size, chatbotSearch, chatbotSort, chatbotOrder);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save chatbot', variant: 'destructive' });
    } finally {
      setChatbotSaving(false);
    }
  };

  const toggleChatbotStatus = async (bot: Chatbot) => {
    try {
      const res = await serverHandler.post('/api/chatbot/change_bot_status', { 
        id: bot.id.toString(), 
        status: bot.status ? 0 : 1 
      });
      if (res.data.success) {
        toast({ title: 'Success', description: res.data.msg || 'Status updated successfully' });
        fetchChatbots(chatbotPagination.page, chatbotPagination.size, chatbotSearch, chatbotSort, chatbotOrder);
      } else {
        toast({ title: 'Error', description: res.data.message || 'Failed to update status', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update status', variant: 'destructive' });
    }
  };

  const deleteChatbot = async (bot: Chatbot) => {
    if (!window.confirm('Delete this chatbot?')) return;
    try {
      const res = await serverHandler.post('/api/chatbot/del_chatbot', { id: bot.id.toString() });
      if (res.data.success) {
        toast({ title: 'Success', description: res.data.msg || 'Chatbot deleted successfully' });
        fetchChatbots(chatbotPagination.page, chatbotPagination.size, chatbotSearch, chatbotSort, chatbotOrder);
      } else {
        toast({ title: 'Error', description: res.data.message || 'Failed to delete chatbot', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to delete chatbot', variant: 'destructive' });
    }
  };

  // Canned Responses Functions
  // Replace fetchQuickReplies with real API call and full pagination
  const fetchQuickReplies = async (page = 1, size = 10, search = '', category = '', sort = 'category,created_at', order = 'asc,desc') => {
    setCannedLoading(true);
    try {
      const res = await serverHandler.get(`/api/quick_reply/get_quick_replies?page=${page}&size=${size}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&sort=${sort}&order=${order}`);
      const data = res.data;
      setQuickReplies(data.data || []);
      setCannedPagination({
        page,
        size,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      });
    } catch (error) {
      setQuickReplies([]);
      setCannedPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setCannedLoading(false);
    }
  };

  const openCannedForm = (reply?: QuickReply) => {
    if (reply) {
      setEditReply(reply)
      setCannedForm({
        type: reply.type,
        category: reply.category || "",
        text: reply.text || "",
        media: "",
        buttons: [],
        list: [],
      })
    } else {
      setEditReply(null)
      setCannedForm({ type: "text", category: "", text: "", media: "", buttons: [], list: [] })
    }
    setShowCannedForm(true)
  }

  // Update CRUD actions to use real API endpoints
  const saveCannedResponse = async () => {
    setCannedSaving(true);
    try {
      if (editReply) {
        await serverHandler.post('/api/quick_reply/update_quick_reply', { id: editReply.id, ...cannedForm });
      } else {
        await serverHandler.post('/api/quick_reply/add_quick_reply', cannedForm);
      }
      setShowCannedForm(false);
      fetchQuickReplies(cannedPagination.page, cannedPagination.size, cannedSearch, cannedCategory, cannedSort, cannedOrder);
    } catch (error) {
      // handle error
    } finally {
      setCannedSaving(false);
    }
  };

  const deleteCannedResponse = async (reply: QuickReply) => {
    if (!window.confirm('Delete this response?')) return;
    try {
      await serverHandler.post('/api/quick_reply/delete_quick_reply', { id: reply.id });
      fetchQuickReplies(cannedPagination.page, cannedPagination.size, cannedSearch, cannedCategory, cannedSort, cannedOrder);
    } catch (error) {}
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'auto') {
      fetchChatbots(chatbotPagination.page, chatbotPagination.size, chatbotSearch, chatbotSort, chatbotOrder);
      fetchFlows();
      fetchChats();
    } else {
      fetchQuickReplies(cannedPagination.page, cannedPagination.size, cannedSearch, cannedCategory, cannedSort, cannedOrder);
    }
    // eslint-disable-next-line
  }, [activeTab, chatbotPagination.page, chatbotPagination.size, chatbotSearch, chatbotSort, chatbotOrder, cannedPagination.page, cannedPagination.size, cannedSearch, cannedCategory, cannedSort, cannedOrder]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Simple Tab Buttons */}
      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === "auto" ? "default" : "outline"} onClick={() => setActiveTab("auto")}>
          Auto Chatbot
        </Button>
        <Button variant={activeTab === "canned" ? "default" : "outline"} onClick={() => setActiveTab("canned")}>
          Canned Responses
        </Button>
      </div>

      {/* Auto Chatbot Content */}
      {activeTab === "auto" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Auto Chatbot</h2>
            <Button onClick={() => openChatbotForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Chatbot
            </Button>
          </div>
          {/* Page size selector and total count */}
          <div className="flex justify-end mb-2">
            <div className="text-sm text-muted-foreground">
              Total: {chatbotPagination.total}
            </div>
          </div>
          {/* Table and pagination at bottom */}
          <div className="relative flex flex-col min-h-[350px]"> {/* min-h to ensure space for pagination */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Flow Title</TableHead>
                  <TableHead>Is Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatbotLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : chatbots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No chatbots found
                    </TableCell>
                  </TableRow>
                ) : (
                  chatbots.map((bot, index) => (
                    <TableRow key={bot.id}>
                      <TableCell>{(chatbotPagination.page - 1) * chatbotPagination.size + index + 1}</TableCell>
                      <TableCell>{bot.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bot.flow?.title || bot.flow_title || 'No Flow'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={bot.status} onCheckedChange={() => toggleChatbotStatus(bot)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openChatbotForm(bot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteChatbot(bot)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Always show pagination bar, even if only 1 page or no data */}
            <div className="mt-4 flex-1 flex items-end w-full">
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Rows per page:</span>
                      <Select value={String(chatbotPagination.size)} onValueChange={val => {
                        setChatbotPagination(prev => ({ ...prev, size: Number(val), page: 1 }));
                      }}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </PaginationItem>
                  {/* Page numbers */}
                  {Array.from({ length: Math.max(chatbotPagination.totalPages, 1) }, (_, i) => i + 1).map(pageNum => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={chatbotPagination.page === pageNum}
                        onClick={() => {
                          if (chatbotPagination.page !== pageNum) {
                            setChatbotPagination(prev => ({ ...prev, page: pageNum }));
                          }
                        }}
                        aria-disabled={chatbotPagination.totalPages <= 1}
                      >
                        <span>{pageNum}</span>
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      )}

      {/* Canned Responses Content */}
      {activeTab === "canned" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Canned Responses</h2>
            <Button onClick={() => openCannedForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
          {/* Page size selector and total count */}
          <div className="flex justify-end mb-2">
            <div className="text-sm text-muted-foreground">
              Total: {cannedPagination.total}
            </div>
          </div>
          {/* Table and pagination at bottom */}
          <div className="relative flex flex-col min-h-[350px]"> {/* min-h to ensure space for pagination */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cannedLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : quickReplies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No responses found
                    </TableCell>
                  </TableRow>
                ) : (
                  quickReplies.map((reply, index) => (
                    <TableRow key={reply.id}>
                      <TableCell>{(cannedPagination.page - 1) * cannedPagination.size + index + 1}</TableCell>
                      <TableCell>{reply.text || `${reply.type} response`}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{reply.type}</Badge>
                      </TableCell>
                      <TableCell>{reply.created_at ? new Date(reply.created_at).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openCannedForm(reply)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteCannedResponse(reply)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Always show pagination bar, even if only 1 page or no data */}
            <div className="mt-4 flex-1 flex items-end w-full">
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Rows per page:</span>
                      <Select value={String(cannedPagination.size)} onValueChange={val => {
                        setCannedPagination(prev => ({ ...prev, size: Number(val), page: 1 }));
                      }}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </PaginationItem>
                  {/* Page numbers */}
                  {Array.from({ length: Math.max(cannedPagination.totalPages, 1) }, (_, i) => i + 1).map(pageNum => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={cannedPagination.page === pageNum}
                        onClick={() => {
                          if (cannedPagination.page !== pageNum) {
                            setCannedPagination(prev => ({ ...prev, page: pageNum }));
                          }
                        }}
                        aria-disabled={cannedPagination.totalPages <= 1}
                      >
                        <span>{pageNum}</span>
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Form Dialog */}
      <Dialog open={showChatbotForm} onOpenChange={setShowChatbotForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editBot ? "Edit Chatbot" : "Add New Chatbot"}</DialogTitle>
          </DialogHeader>
          <DialogDescription>Configure your chatbot settings and select a flow.</DialogDescription>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input
                value={chatbotForm.title}
                onChange={(e) => setChatbotForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Enter chatbot title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Flow *</label>
              <Select 
                value={chatbotForm.flow?.id?.toString() || ""} 
                onValueChange={(val) => {
                  const selectedFlow = flows.find(f => f.id.toString() === val);
                  setChatbotForm((f) => ({ ...f, flow: selectedFlow || null }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow" />
                </SelectTrigger>
                <SelectContent>
                  {flows.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id.toString()}>
                      {flow.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Switch
                  checked={chatbotForm.for_all}
                  onCheckedChange={(val) => setChatbotForm((f) => ({ ...f, for_all: val, chats: val ? [] : f.chats }))}
                />
                <span>Turn on for all chats</span>
              </div>
              {!chatbotForm.for_all && (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                  {chats.map((chat) => (
                    <label key={chat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chatbotForm.chats.includes(chat.id)}
                        onChange={(e) => {
                          setChatbotForm((f) => ({
                            ...f,
                            chats: e.target.checked ? [...f.chats, chat.id] : f.chats.filter((id) => id !== chat.id),
                          }))
                        }}
                      />
                      <span className="text-sm">{chat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowChatbotForm(false)} disabled={chatbotSaving}>
                Cancel
              </Button>
              <Button
                onClick={saveChatbot}
                disabled={
                  chatbotSaving ||
                  !chatbotForm.title ||
                  !chatbotForm.flow ||
                  (!chatbotForm.for_all && chatbotForm.chats.length === 0)
                }
              >
                {chatbotSaving ? (editBot ? "Updating..." : "Creating...") : editBot ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canned Response Form Dialog */}
      <Dialog open={showCannedForm} onOpenChange={setShowCannedForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editReply ? "Edit Response" : "Add New Response"}</DialogTitle>
          </DialogHeader>
          <DialogDescription>Dialog to add or edit a canned response.</DialogDescription>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select value={cannedForm.type} onValueChange={(val) => setCannedForm((f) => ({ ...f, type: val }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input
                value={cannedForm.category}
                onChange={(e) => setCannedForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Enter category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <Input
                value={cannedForm.text}
                onChange={(e) => setCannedForm((f) => ({ ...f, text: e.target.value }))}
                placeholder="Enter response text"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCannedForm(false)} disabled={cannedSaving}>
                Cancel
              </Button>
              <Button onClick={saveCannedResponse} disabled={cannedSaving || !cannedForm.text}>
                {cannedSaving ? (editReply ? "Updating..." : "Creating...") : editReply ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
