"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Trash2,
  MoreHorizontal
} from "lucide-react"
import { useDispatch } from "react-redux"
import { setCurrentView } from "@/store/slices/dashboardSlice"
import { whatsappTemplatesAPI } from "@/utils/api/broadcast/whatsapp-templates"
import { formatDateToIST } from "@/utils/api/utility/date.utils"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { TempleteItem } from "@/types/broadcast/broadCastResponse"

type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT'

interface StatusFilter {
  value: TemplateStatus
  label: string
  checked: boolean
}

type SortOption = 'latest' | 'oldest' | 'name'

interface SavedTemplatesPageProps {
  savedTemplates?: TempleteItem[]
  setCurrentTemplate?: (template: TempleteItem) => void
  setCurrentPage?: (page: "home" | "create-template") => void
}

// Constants
const TEMPLATE_CATEGORIES = [
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Customer Support" },
  { value: "sales", label: "Sales" },
  { value: "notification", label: "Notification" }
] as const

const STATUS_OPTIONS: StatusFilter[] = [
  { value: "DRAFT", label: "Draft", checked: true },
  { value: "PENDING", label: "Pending", checked: true },
  { value: "APPROVED", label: "Approved", checked: true }, 
  { value: "REJECTED", label: "Rejected", checked: true }
]

const ITEMS_PER_PAGE = 10

// Status badge configuration
const STATUS_BADGE_CONFIG = {
  APPROVED: { 
    color: "bg-green-100 text-green-700 border-green-200", 
    icon: CheckCircle 
  },
  PENDING: { 
    color: "bg-yellow-100 text-yellow-700 border-yellow-200", 
    icon: Clock 
  },
  REJECTED: { 
    color: "bg-red-100 text-red-700 border-red-200", 
    icon: XCircle 
  },
  DRAFT: { 
    color: "bg-gray-100 text-gray-700 border-gray-200", 
    icon: FileText 
  }
} as const

export default function SavedTemplatesPage({
  savedTemplates = [],
  setCurrentTemplate,
  setCurrentPage,
}: SavedTemplatesPageProps) {
  const dispatch = useDispatch()
  const { toast } = useToast()
  
  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("latest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>(STATUS_OPTIONS)
  const [currentPage, setCurrentPageState] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TempleteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<TempleteItem | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null)

  // Memoized values
  const filteredAndSortedTemplates = useMemo(() => {
    const sourceTemplates = templates.length > 0 ? templates : savedTemplates
    
    let filtered = sourceTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilters.find(f => f.value === template.status)?.checked !== false
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case "oldest":
          return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [templates, savedTemplates, searchTerm, sortBy, statusFilters])

  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAndSortedTemplates, currentPage])

  const totalPages = Math.ceil(filteredAndSortedTemplates.length / ITEMS_PER_PAGE)

  // API call
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await whatsappTemplatesAPI.getMyMetaTemplates()
      
      if (response) {
        const transformedTemplates: TempleteItem[] = response.data.map((template: any) => ({
          id: template.id || template.template_id || '',
          name: template.name || template.template_name || '',
          category: template.category || 'marketing',
          status: (template.status || 'PENDING') as TemplateStatus,
          language: template.language || 'en',
          lastUpdated: template.updated_at || template.created_at || new Date().toISOString(),
          parameter_format: template.parameter_format || 'TEXT',
          components: template.components || []
        }))
        setTemplates(transformedTemplates)
      } else {
        setError('Failed to fetch templates')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates')
      console.error('Failed to fetch templates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const goToCreateTemplate = useCallback(() => {
    dispatch(setCurrentView("create-template"))
  }, [dispatch])

  const handleStatusFilterChange = useCallback((statusValue: TemplateStatus) => {
    setStatusFilters(prev => 
      prev.map(status => 
        status.value === statusValue 
          ? { ...status, checked: !status.checked }
          : status
      )
    )
  }, [])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
    setShowSortDropdown(false)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPageState(page)
  }, [])

  const handleDeleteTemplate = useCallback((template: TempleteItem) => {
    setTemplateToDelete(template)
    setShowDeleteConfirm(true)
  }, [])

  const confirmDeleteTemplate = useCallback(async () => {
    if (!templateToDelete) return
    try {
      setDeletingTemplate(templateToDelete.id)
      const response = await whatsappTemplatesAPI.deleteMetaTemplate(templateToDelete.name) 
      if (response.success || response.msg === 'template_deleted') {
        setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id))
        toast({
          title: "Success!",
          description: `Template "${templateToDelete.name}" deleted successfully.`,
          variant: "default",
        })
        fetchTemplates()
      } else {
        toast({
          title: "Error",
          description: response.message || response.msg || 'Failed to delete template',
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: 'Failed to delete template. Please try again.',
        variant: "destructive",
      })
    } finally {
      setDeletingTemplate(null)
      setShowDeleteConfirm(false)
      setTemplateToDelete(null)
    }
  }, [templateToDelete, fetchTemplates, toast])

  const toggleDropdown = useCallback((templateId: string) => {
    setOpenDropdown(prev => prev === templateId ? null : templateId)
  }, [])


  const getStatusBadge = useCallback((status: TemplateStatus) => {
    const config = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.DRAFT
    const { color, icon: Icon } = config
    
    return (
      <Badge className={`${color} flex items-center gap-1 pointer-events-none`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }, [])

  const getCategoryLabel = useCallback((category: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.value === category)?.label || category
  }, [])



  const renderTableRow = useCallback((template: TempleteItem, index: number) => (
    <tr key={template.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
      <td className="py-3 px-4">
        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
          {template.name}
        </span>
      </td>
      <td className="py-3 px-4 text-gray-700">
        {getCategoryLabel(template.category)}
      </td>
      <td className="py-3 px-4">
        {getStatusBadge(template.status as TemplateStatus)}
      </td>
      <td className="py-3 px-4 text-gray-700">{template.language}</td>
      <td className="py-3 px-4 text-gray-700">{formatDateToIST(template.lastUpdated)}</td>
      <td className="py-3 px-4">
        <div className="relative dropdown-container">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => toggleDropdown(template.id)}
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </Button>
          
          {openDropdown === template.id && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  handleDeleteTemplate(template)
                  setOpenDropdown(null)
                }}
                disabled={deletingTemplate === template.id}
              >
                <Trash2 className="w-4 h-4" />
                {deletingTemplate === template.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  ), [getCategoryLabel, getStatusBadge, handleDeleteTemplate, toggleDropdown, openDropdown])

  const renderPagination = useCallback(() => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            className={`w-8 h-8 p-0 ${page === currentPage ? 'bg-green-500 hover:bg-green-600' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  ), [currentPage, totalPages, handlePageChange])

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header Skeleton */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

                         {/* Table Skeleton */}
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-gray-50 border-b border-gray-200">
                   <tr>
                     <th className="text-left py-3 px-4 font-medium text-gray-700">Template Name</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-700">Language</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {Array.from({ length: 5 }).map((_, index) => (
                     <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                       <td className="py-3 px-4">
                         <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                       </td>
                       <td className="py-3 px-4">
                         <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                       </td>
                       <td className="py-3 px-4">
                         <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                       </td>
                       <td className="py-3 px-4">
                         <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                       </td>
                       <td className="py-3 px-4">
                         <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                       </td>
                       <td className="py-3 px-4">
                         <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Templates</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchTemplates} className="bg-green-500 hover:bg-green-600">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Your Templates</h1>
                <p className="text-gray-600 mt-1">
                  Select or create your template and submit it for WhatsApp approval. All templates must adhere to{" "}
                  <a href="#" className="text-green-600 underline">WhatsApp's guidelines</a>.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={goToCreateTemplate}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Template Message
                </Button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <div className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg">
                  <div className="grid grid-cols-2 gap-1 mr-2">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">{filteredAndSortedTemplates.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sorted by:</span>
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-2"
                    >
                      {sortBy === "latest" ? "Latest" : sortBy === "oldest" ? "Oldest" : "Name"}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    {showSortDropdown && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                          onClick={() => handleSortChange("latest")}
                        >
                          Latest
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          onClick={() => handleSortChange("oldest")}
                        >
                          Oldest
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
                          onClick={() => handleSortChange("name")}
                        >
                          Name
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Template Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 flex items-center gap-2">
                    Status
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowFilterModal(true)}
                    >
                      <Filter className="w-3 h-3" />
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Language</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <div className="flex flex-col items-center justify-center">
                        <img 
                          src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1754993129/no_data.14591486_tv48zw.svg" 
                          alt="No data" 
                          className="w-48 h-48 object-contain mb-4" 
                        />
                        <p className="text-gray-600 text-lg font-medium">No Templates Found</p>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new template.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTemplates.map((template, index) => renderTableRow(template, index))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredAndSortedTemplates.length)} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTemplates.length)} of{" "}
              {filteredAndSortedTemplates.length} entries
            </div>
            {renderPagination()}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filter by Status</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFilterModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-6">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {statusFilters.map((status) => (
                  <label key={status.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={status.checked}
                      onChange={() => handleStatusFilterChange(status.value)}
                      className="w-4 h-4 text-green-500 border-2 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white px-8"
                onClick={() => setShowFilterModal(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setTemplateToDelete(null)
        }}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        description={`Are you sure you want to delete template "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Template"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingTemplate === templateToDelete?.id}
      />
    </div>
  )
}