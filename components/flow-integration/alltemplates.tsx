"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Search, Filter, X } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import serverHandler from '@/utils/api/enpointsUtils/serverHandler'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: number
  uid: string
  content: string
  type: string
  title: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// Page size options for selector
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function AllTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
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
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    type: '',
    content: ''
  })
  const [editLoading, setEditLoading] = useState(false)
  const { toast } = useToast()

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.pageSize.toString(),
        search: search,
        sort: sortBy,
        order: sortOrder
      })
      
      const response = await serverHandler.get(`/api/templet/get_templets?${params}`)
      const data = response.data as any
      
      if (data.success) {
        setTemplates(data.data || [])
        setPagination(data.pagination || {
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: pagination.pageSize
        })
      } else {
        console.error('Failed to fetch templates:', data)
        setTemplates([])
      }
    } catch (error: any) {
      console.error('Error fetching templates:', error)
      setTemplates([])
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [pagination.currentPage, pagination.pageSize, search, sortBy, sortOrder])

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

  const deleteTemplate = async (id: number) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this template?'
    );
    
    if (isConfirmed) {
      try {
        const response = await serverHandler.post(`/api/templet/del_templets`, {
          selected: [id]
        });
        
        if ((response.data as any).success) {
          toast({
            title: "Success",
            description: "Template deleted successfully",
            variant: "default"
          })
          // Refresh the template list
          fetchTemplates();
        } else {
          console.error('Failed to delete template:', response.data);
          toast({
            title: "Error",
            description: "Failed to delete template",
            variant: "destructive"
          })
        }
      } catch (error: any) {
        console.error('Error deleting template:', error);
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive"
        })
      }
    }
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template)
    setEditForm({
      title: template.title,
      type: template.type,
      content: formatContentForEdit(template.content)
    })
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingTemplate(null)
    setEditForm({
      title: '',
      type: '',
      content: ''
    })
  }

  const updateTemplate = async () => {
    if (!editingTemplate) return

    setEditLoading(true)
    try {
      const response = await serverHandler.post('/api/templet/update', {
        id: editingTemplate.id,
        title: editForm.title,
        type: editForm.type,
        content: editForm.content
      })

      if ((response.data as any).success) {
        toast({
          title: "Success",
          description: "Template updated successfully",
          variant: "default"
        })
        closeEditModal()
        fetchTemplates() // Refresh the list
      } else {
        console.error('Failed to update template:', response.data)
        toast({
          title: "Error",
          description: "Failed to update template",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error updating template:', error)
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      })
    } finally {
      setEditLoading(false)
    }
  }

  const getStatusBadge = (template: Template) => {
    // You can add logic here to determine if template is active based on your requirements
    const isActive = true // Placeholder - implement your logic
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  const parseTemplateContent = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      if (parsed.type === 'text' && parsed.text?.body) {
        return parsed.text.body
      }
      return content
    } catch {
      return content
    }
  }

  const formatContentForEdit = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return content
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-300">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                All Templates
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
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
                <h2 className="text-lg font-semibold text-slate-800">Template Management</h2>
                <p className="text-sm text-slate-600 mt-1">Manage and monitor your message templates</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search templates..."
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
                      <SelectItem value="type">Type</SelectItem>
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
                  <TableHead>Template ID</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Type</span>
                      {sortBy === 'type' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Content Preview</TableHead>
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
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Updated</span>
                      {sortBy === 'updatedAt' && (
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
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading templates...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-lg">No templates found</p>
                          <p className="text-slate-500 text-sm mt-1">
                            {search ? 'Try adjusting your search criteria' : 'Create your first template to get started'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template, index) => (
                    <TableRow key={template.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-700">
                              {String((pagination.currentPage - 1) * pagination.pageSize + index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-800 hover:text-green-600 transition-colors cursor-pointer">
                            {template.title}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">Message Template</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {template.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.type.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-slate-600 truncate">
                            {parseTemplateContent(template.content)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(template)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {formatDate(template.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {formatDate(template.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
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

      {/* Edit Template Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Template</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Template Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter template title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select 
                value={editForm.type} 
                onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="AUDIO">Audio</SelectItem>
                  <SelectItem value="DOCUMENT">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Template Content</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter template content (JSON format for complex templates)"
                className="min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                For text templates, use simple text. For complex templates, use JSON format.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEditModal}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={updateTemplate}
              disabled={editLoading || !editForm.title || !editForm.type || !editForm.content}
            >
              {editLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 