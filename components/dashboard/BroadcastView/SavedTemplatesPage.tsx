"use client"
import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Save, 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Edit, 
  Search,
  ChevronDown,
  Copy,
  Eye,
  Filter,
  Play,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  FileText,
  X
} from "lucide-react"
import { useDispatch } from "react-redux"
import { setCurrentView } from "@/store/slices/dashboardSlice"

// Template categories for filtering
const TEMPLATE_CATEGORIES = [
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Customer Support" },
  { value: "sales", label: "Sales" },
  { value: "notification", label: "Notification" }
]

// Status options for filtering
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", checked: true },
  { value: "PENDING", label: "Pending", checked: true },
  { value: "APPROVED", label: "Approved", checked: true }, 
  { value: "REJECTED", label: "Rejected", checked: true },
  { value: "DELETED", label: "Deleted", checked: false },
  { value: "PAUSED", label: "Paused", checked: false },
  { value: "DISABLED", label: "Disabled", checked: false }
]

export default function SavedTemplatesPage({
  savedTemplates = [],
  setCurrentTemplate,
  setCurrentPage,
}: {
  savedTemplates?: any[]
  setCurrentTemplate?: (t: any) => void
  setCurrentPage?: (p: "home" | "create-template") => void
}) {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [statusFilters, setStatusFilters] = useState(STATUS_OPTIONS)
  const [currentPage, setCurrentPageState] = useState(1)
  const [hoveredAction, setHoveredAction] = useState<{ id: string, action: string } | null>(null)
  
  const itemsPerPage = 10

  // Navigate to create template page
  const goToCreateTemplate = () => {
    dispatch(setCurrentView("create-template"))
  }

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = savedTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilters.find(f => f.value === template.status)?.checked !== false
      return matchesSearch && matchesStatus
    })

    const sorted = filtered.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

    return sorted
  }, [savedTemplates, searchTerm, sortBy, statusFilters])

  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedTemplates.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedTemplates, currentPage])

  const totalPages = Math.ceil(filteredAndSortedTemplates.length / itemsPerPage)

  const handleStatusFilterChange = (statusValue: string) => {
    setStatusFilters(prev => 
      prev.map(status => 
        status.value === statusValue 
          ? { ...status, checked: !status.checked }
          : status
      )
    )
  }

  const getStatusBadge = (status: string) => {
    const config = {
      APPROVED: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
      PENDING: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
      REJECTED: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
      DRAFT: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: FileText }
    }
    
    const { color, icon: Icon } = config[status as keyof typeof config] || config.DRAFT
    
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  const ActionButton = ({ 
    icon: Icon, 
    tooltip, 
    onClick, 
    templateId 
  }: { 
    icon: any, 
    tooltip: string, 
    onClick: () => void,
    templateId: string 
  }) => (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:bg-gray-100"
        onClick={onClick}
        onMouseEnter={() => setHoveredAction({ id: templateId, action: tooltip })}
        onMouseLeave={() => setHoveredAction(null)}
      >
        <Icon className="w-4 h-4 text-gray-600" />
      </Button>
      {hoveredAction?.id === templateId && hoveredAction?.action === tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Your Templates</h1>
                <p className="text-gray-600 mt-1">
                  Select or create your template and submit it for WhatsApp approval. All templates must adhere to{" "}
                  <a href="#" className="text-green-600 underline">WhatsApp's guidelines</a>.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Tutorial
                </Button>
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
                    placeholder="Search..."
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
                          onClick={() => { setSortBy("latest"); setShowSortDropdown(false) }}
                        >
                          Latest
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          onClick={() => { setSortBy("oldest"); setShowSortDropdown(false) }}
                        >
                          Oldest
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
                          onClick={() => { setSortBy("name"); setShowSortDropdown(false) }}
                        >
                          Name
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" className="flex items-center gap-2">
                  Export
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  Import
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Template Name</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Category</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700 flex items-center gap-2">
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
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Language</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Last Updated</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16">
                      <div className="flex flex-col items-center justify-center">
                        <img 
                          src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1754993129/no_data.14591486_tv48zw.svg" 
                          alt="No data" 
                          className="w-56 h-56 object-contain mb-4" 
                        />
                        <p className="text-gray-600 text-lg font-medium">No Templates Found</p>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new template.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTemplates.map((template, index) => (
                    <tr key={template.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-4 px-6">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                          {template.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(template.status)}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{template.language}</td>
                      <td className="py-4 px-6 text-gray-700">{template.lastUpdated}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <ActionButton
                            icon={Copy}
                            tooltip="Copy"
                            onClick={() => navigator.clipboard.writeText(template.body)}
                            templateId={template.id}
                          />
                          <ActionButton
                            icon={Eye}
                            tooltip="Preview"
                            onClick={() => alert(`Preview: ${template.body}`)}
                            templateId={template.id}
                          />
                          <ActionButton
                            icon={Edit}
                            tooltip="Edit"
                            onClick={() => {
                              setCurrentTemplate?.(template)
                              setCurrentPage?.("create-template")
                            }}
                            templateId={template.id}
                          />
                          <ActionButton
                            icon={Trash2}
                            tooltip="Delete"
                            onClick={() => alert("Delete functionality would go here")}
                            templateId={template.id}
                          />
                          <ActionButton
                            icon={MoreHorizontal}
                            tooltip="More"
                            onClick={() => alert("More options would go here")}
                            templateId={template.id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Always show */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedTemplates.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedTemplates.length)} of{" "}
              {filteredAndSortedTemplates.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPageState(Math.max(1, currentPage - 1))}
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
                    onClick={() => setCurrentPageState(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPageState(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Attributes</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFilterModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Choose attributes to filter</p>
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
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}