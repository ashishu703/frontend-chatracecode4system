"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Search, Filter, Bot, ToggleLeft, ToggleRight } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import serverHandler from '@/utils/serverHandler'
import { useToast } from '@/hooks/use-toast'

interface Flow {
  id: number
  uid: string
  flow_id: string
  title: string
  createdAt: string
  isActive: boolean
}

interface Chatbot {
  id: number
  title: string
  status: boolean
  flow_id: number
  flow_title: string
  for_all: boolean
  chats: string[]
  createdAt: string
  updatedAt: string
  active: boolean // Added active property
}

interface Pagination {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// Page size options for selector
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const CHANNEL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'whatsapp', label: 'WhatsApp' },
  // Add more channels as needed
]

export default function ChatbotView() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [flows, setFlows] = useState<Flow[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10
  })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    flow_id: '',
    for_all: false,
    chats: [] as string[]
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const [allChatbots, setAllChatbots] = useState<Chatbot[]>([])
  const [selectedChatbotId, setSelectedChatbotId] = useState<string>("")
  const [channel, setChannel] = useState('')
  const [allFlows, setAllFlows] = useState<{ id: string, title: string }[]>([])

  // Fetch all flows from /api/chat_flow/get_mine for the flow dropdown
  const fetchAllFlows = async () => {
    try {
      const response = await serverHandler.get(`/api/chat_flow/get_mine`)
      const data = response.data as any
      if (data.success) {
        const flows = (data.data || []).map((flow: any) => ({ id: flow.id?.toString(), title: flow.title }))
        setAllFlows(flows)
      } else {
        setAllFlows([])
      }
    } catch (error) {
      setAllFlows([])
    }
  }

  useEffect(() => {
    fetchAllFlows()
  }, [])

  const fetchChatbots = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.pageSize.toString(),
        search: search,
        sort: sortBy,
        order: sortOrder
      })
      
      const response = await serverHandler.get(`/api/chatbot/get_chatbot?${params}`)
      const data = response.data as any
      
      if (data.success) {
        setChatbots(data.data || [])
        setPagination(data.pagination || {
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: pagination.pageSize
        })
        console.log('Fetched chatbots:', data.data)
      } else {
        console.error('Failed to fetch chatbots:', data)
        setChatbots([])
      }
    } catch (error: any) {
      console.error('Error fetching chatbots:', error)
      setChatbots([])
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }))
    } finally {
      setLoading(false)
    }
  }

  const fetchFlows = async () => {
    try {
      const response = await serverHandler.get('/api/chat_flow/get_mine')
      const data = response.data as any
      
      if (data.success) {
        // Only show active flows
        const activeFlows = (data.data || []).filter((flow: Flow) => flow.isActive)
        setFlows(activeFlows)
      } else {
        setFlows([])
      }
    } catch (error: any) {
      console.error('Error fetching flows:', error)
      setFlows([])
    }
  }

  // Fetch all chatbots for assignment in modal
  const fetchAllChatbots = async () => {
    try {
      const response = await serverHandler.get(`/api/chatbot/get_chatbot`)
      const data = response.data as any
      if (data.success) {
        setAllChatbots(data.data || [])
      } else {
        setAllChatbots([])
      }
    } catch (error) {
      setAllChatbots([])
    }
  }

  useEffect(() => {
    fetchChatbots()
  }, [pagination.currentPage, pagination.pageSize, search, sortBy, sortOrder])

  useEffect(() => {
    fetchFlows()
  }, [])

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handlePageSizeChange = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }))
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openAddModal = () => {
    setFormData({
      title: '',
      flow_id: '',
      for_all: true, // Always true when channel is selected
      chats: []
    })
    setChannel('')
    setAddModalOpen(true)
  }

  const openEditModal = (chatbot: Chatbot) => {
    setEditingChatbot(chatbot)
    setFormData({
      title: chatbot.title,
      flow_id: chatbot.flow_id.toString(),
      for_all: chatbot.for_all,
      chats: chatbot.chats || []
    })
    setEditModalOpen(true)
  }

  const closeModals = () => {
    setAddModalOpen(false)
    setEditModalOpen(false)
    setEditingChatbot(null)
    setFormData({
      title: '',
      flow_id: '',
      for_all: false,
      chats: []
    })
  }

  const saveChatbot = async () => {
    if (!formData.title || !formData.flow_id) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        flow_id: parseInt(formData.flow_id),
        for_all: formData.for_all,
        chats: formData.chats,
        status: 1 // Always create as active
      }

      let response
      if (editingChatbot) {
        response = await serverHandler.post('/api/chatbot/update_chatbot', {
          id: editingChatbot.id,
          ...payload
        })
        } else {
        response = await serverHandler.post('/api/chatbot/add_chatbot', payload)
      }

      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: editingChatbot ? "Chatbot updated successfully" : "Chatbot created successfully",
          variant: "default"
        })
        closeModals()
        fetchChatbots()
      } else {
        console.error('Failed to save chatbot:', response.data)
        toast({
          title: "Error",
          description: (response.data as any).msg || "Failed to save chatbot",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error saving chatbot:', error)
      toast({
        title: "Error",
        description: "Failed to save chatbot",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteChatbot = async (id: number) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this chatbot?'
    )
    
    if (isConfirmed) {
      try {
        const response = await serverHandler.post('/api/chatbot/del_chatbot', {
          id: id.toString()
        })
        
        if ((response.data as any).success) {
          toast({
            title: "Success",
            description: "Chatbot deleted successfully",
            variant: "default"
          })
          fetchChatbots()
      } else {
          console.error('Failed to delete chatbot:', response.data)
          toast({
            title: "Error",
            description: "Failed to delete chatbot",
            variant: "destructive"
          })
        }
      } catch (error: any) {
        console.error('Error deleting chatbot:', error)
        toast({
          title: "Error",
          description: "Failed to delete chatbot",
          variant: "destructive"
        })
      }
    }
  }

  const toggleChatbotStatus = async (chatbot: Chatbot) => {
    try {
      const response = await serverHandler.post('/api/chatbot/change_bot_status', {
        id: chatbot.id.toString(),
        status: chatbot.active ? 0 : 1 // use .active, not .status
      })
      console.log('Status change response:', response.data)

      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Chatbot status updated successfully",
          variant: "default"
        })
        fetchChatbots()
      } else {
        console.error('Failed to update chatbot status:', response.data)
        toast({
          title: "Error",
          description: "Failed to update chatbot status",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error updating chatbot status:', error)
      toast({
        title: "Error",
        description: "Failed to update chatbot status",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (chatbot: Chatbot) => {
    return (
      <Badge variant={chatbot.active ? "default" : "secondary"}>
        {chatbot.active ? "Active" : "Inactive"}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-300">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Chatbot Management
              </h1>
            </div>
      </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openAddModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Chatbot
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Table Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Chatbot Management</h2>
                <p className="text-sm text-slate-600 mt-1">Manage and monitor your chatbots</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search chatbots..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select value={sortBy} onValueChange={handleSort}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      {sortBy === 'title' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {sortBy === 'createdAt' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading chatbots...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : chatbots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Bot className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-lg">No chatbots found</p>
                          <p className="text-slate-500 text-sm mt-1">
                            {search ? 'Try adjusting your search criteria' : 'Create your first chatbot to get started'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  chatbots.map((chatbot, index) => (
                    <TableRow key={chatbot.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-700">
                              {String((pagination.currentPage - 1) * pagination.pageSize + index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
                            {chatbot.title}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">Chatbot</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {chatbot.flow_title || 'No Flow'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {chatbot.for_all ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              All Chats
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {chatbot.chats?.length || 0} Specific Chats
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={!!chatbot.active}
                            onCheckedChange={() => toggleChatbotStatus(chatbot)}
                          />
                          {getStatusBadge(chatbot)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {formatDate(chatbot.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(chatbot)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteChatbot(chatbot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{" "}
                  {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Rows per page:</span>
                  <Select 
                    value={String(pagination.pageSize)} 
                    onValueChange={(val) => handlePageSizeChange(Number(val))}
                  >
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
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                      className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                          isActive={pagination.currentPage === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  
                  {pagination.totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          isActive={pagination.currentPage === pagination.totalPages}
                          onClick={() => handlePageChange(pagination.totalPages)}
                          className="cursor-pointer"
                        >
                          {pagination.totalPages}
                      </PaginationLink>
                    </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      className={pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Chatbot Modal */}
      <Dialog open={addModalOpen || editModalOpen} onOpenChange={closeModals}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>{editingChatbot ? "Edit Chatbot" : "Add New Chatbot"}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Select Channel */}
            <div className="space-y-2">
              <Label htmlFor="channel">Select Channel *</Label>
              <Select
                value={channel}
                onValueChange={(value) => {
                  setChannel(value)
                  setFormData(prev => ({ ...prev, for_all: true })) // Always for all chats when channel is selected
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">All incoming chats for the selected channel will be included.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Chatbot Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter chatbot title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flow">Select Flow *</Label>
              <Select 
                value={formData.flow_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, flow_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow" />
                </SelectTrigger>
                <SelectContent>
                  {allFlows.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id}>{flow.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                All flows in the system are shown
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.for_all}
                  disabled
                  onCheckedChange={() => {}}
                />
                <Label htmlFor="for_all">Turn on for all chats</Label>
              </div>
              <p className="text-xs text-slate-500">
                When enabled, this chatbot will be triggered for all incoming chats of the selected channel
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeModals}
              disabled={saving}
            >
                Cancel
              </Button>
              <Button
                onClick={saveChatbot}
              disabled={saving || !formData.title || !formData.flow_id || !channel}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {editingChatbot ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingChatbot ? "Update Chatbot" : "Create Chatbot"
              )}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
