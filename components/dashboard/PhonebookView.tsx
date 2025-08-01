"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Filter, ChevronLeft, ChevronRight, UserPlus, Upload, Trash2, Search } from "lucide-react"
import serverHandler from "@/utils/serverHandler"

export default function PhonebookView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [addContactModal, setAddContactModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string }>({ type: "", value: "" })
  const [assignedTo, setAssignedTo] = useState<{ [key: string]: string }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch all contacts
  const {
    data: contacts,
    isLoading: contactsLoading,
    error: contactsError,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await serverHandler.get("/api/phonebook/get_uid_contacts")
      if (!res.data.success) throw new Error(res.data.msg || "Failed to fetch contacts")
      return res.data.data
    },
    gcTime: 5 * 60 * 1000,
  })

  // Filter contacts based on active filter and search
  const filteredContacts = (contacts || []).filter((c: any) => {
    // Apply search term
    if (searchTerm) {
      const matchesSearch =
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.first_name && c.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.last_name && c.last_name.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false
    }

    // Apply active filter
    if (activeFilter.type && activeFilter.value) {
      switch (activeFilter.type) {
        case "gender":
          return c.gender === activeFilter.value
        case "source":
          return c.source === activeFilter.value
        case "name":
          const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.name || '';
          return fullName.toLowerCase().includes(activeFilter.value.toLowerCase())
        default:
          return true
      }
    }

    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, searchTerm])

  // Get current user's phonebook info
  const {
    data: userInfo,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const res = await serverHandler.get("/api/user/get_me")
      if (!res.data.success) throw new Error(res.data.msg || "Failed to fetch user info")
      return res.data.data
    },
    gcTime: 5 * 60 * 1000,
  })

  // Add Contact
  const addContactMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await serverHandler.post("/api/phonebook/add_single_contact", payload)
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Success", description: "Contact added", variant: "default" })
        queryClient.invalidateQueries({ queryKey: ["contacts"] })
        setAddContactModal(false)
      } else {
        toast({ title: "Error", description: data.msg, variant: "destructive" })
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  // Import Contacts
  const importContactsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await serverHandler.post("/api/phonebook/import_contacts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Success", description: "Contacts imported", variant: "default" })
        queryClient.invalidateQueries({ queryKey: ["contacts"] })
        setImportModal(false)
      } else {
        toast({ title: "Error", description: data.msg, variant: "destructive" })
      }
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: "Failed to import contacts. Please check the CSV format.",
        variant: "destructive",
      })
    },
  })

  // Delete Contacts
  const deleteContactsMutation = useMutation({
    mutationFn: async (selected: string[]) => {
      const res = await serverHandler.post("/api/phonebook/del_contacts", { selected })
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Success", description: "Contacts deleted", variant: "default" })
        queryClient.invalidateQueries({ queryKey: ["contacts"] })
        setSelectedContacts([])
      } else {
        toast({ title: "Error", description: data.msg, variant: "destructive" })
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  // Handlers for forms
  function handleAddContact(e: any) {
    e.preventDefault()
    const form = e.target
    
    // Get phonebook_id from user info or create a default one
    const phonebook_id = userInfo?.phonebook_id || userInfo?.id || 1
    
    const payload = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim() || null,
      gender: form.gender.value,
      source: "Manual",
      phonebook_id: phonebook_id,
    }
    addContactMutation.mutate(payload)
  }

  function handleImportContacts(e: any) {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    importContactsMutation.mutate(formData)
  }

  function downloadCSVTemplate() {
    const headers = ["first_name", "last_name", "phone", "email", "gender", "source"]
    const csvContent = headers.join(",") + "\n"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contacts_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  function handleAssignedToChange(contactId: string, value: string) {
    setAssignedTo((prev) => ({
      ...prev,
      [contactId]: value,
    }))
    toast({ title: "Success", description: `Contact assigned to ${value}`, variant: "default" })
  }

  function handleFilterChange(type: string, value: string) {
    if (value === "all" || value === "") {
      setActiveFilter({ type: "", value: "" })
    } else {
      setActiveFilter({ type, value })
    }
    setShowFilters(false)
  }

  function clearFilters() {
    setActiveFilter({ type: "", value: "" })
    setSearchTerm("")
  }

  // Get unique sources from contacts
  const uniqueSources = [...new Set((contacts || []).map((c: any) => c.source).filter(Boolean))]

  // UI
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
              <i className="fas fa-address-book mr-3 text-gray-600"></i>
              Phonebook
            </CardTitle>
            <div className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
              {filteredContacts.length} contacts
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Action Buttons */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              {/* Compact Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Active filter indicator */}
              {(activeFilter.type || searchTerm) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {activeFilter.type ? `${activeFilter.type}: ${activeFilter.value}` : 'Search active'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-700 h-6 px-2">
                    ✕
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Button with Dropdown */}
              <div className="relative">
                <div className="group relative">
                  <Button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-600 hover:bg-gray-700 text-white h-9 px-3"
                    size="sm"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Filter
                  </div>
                </div>

                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-2">
                        Gender
                      </div>
                      <button
                        onClick={() => handleFilterChange("gender", "male")}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                      >
                        Male
                      </button>
                      <button
                        onClick={() => handleFilterChange("gender", "female")}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                      >
                        Female
                      </button>
                      <button
                        onClick={() => handleFilterChange("gender", "unknown")}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                      >
                        Unknown
                      </button>
                      
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 mt-2 mb-2 border-t border-gray-100 pt-2">
                        Source
                      </div>
                      {uniqueSources.map((source: string) => (
                        <button
                          key={source}
                          onClick={() => handleFilterChange("source", source)}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                        >
                          {source}
                        </button>
                      ))}
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => handleFilterChange("", "")}
                          className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Contact Button */}
              <div className="group relative">
                <Button 
                  onClick={() => setAddContactModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white h-9 px-3"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Add Contact
                </div>
              </div>

              {/* Import Contacts Button */}
              <div className="group relative">
                <Button 
                  onClick={() => setImportModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3"
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Import Contacts
                </div>
              </div>

              {/* Delete Selected Button */}
              <div className="group relative">
                <Button
                  variant="destructive"
                  onClick={() => deleteContactsMutation.mutate(selectedContacts)}
                  disabled={selectedContacts.length === 0}
                  className="h-9 px-3"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Delete Selected ({selectedContacts.length})
                </div>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredContacts.length)}</span> of <span className="font-semibold">{filteredContacts.length}</span> contacts
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={paginatedContacts.length > 0 && selectedContacts.length === paginatedContacts.length}
                      onChange={(e) =>
                        setSelectedContacts(e.target.checked ? paginatedContacts.map((c: any) => c.id) : [])
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Source</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Assigned To</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Last Seen Date</th>
                </tr>
              </thead>
              <tbody>
                {contactsLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading contacts...</span>
                      </div>
                    </td>
                  </tr>
                ) : contactsError ? (
                  <tr>
                    <td colSpan={5} className="text-center text-red-500 py-12">
                      <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                      <div>{contactsError.message}</div>
                    </td>
                  </tr>
                ) : paginatedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <i className="fas fa-search text-gray-400 text-2xl mb-2"></i>
                      <div className="text-gray-600">No contacts found.</div>
                    </td>
                  </tr>
                ) : (
                  paginatedContacts.map((contact: any, index: number) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-blue-50 border-b border-gray-100 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) =>
                            setSelectedContacts(
                              e.target.checked
                                ? [...selectedContacts, contact.id]
                                : selectedContacts.filter((id) => id !== contact.id),
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {contact.first_name && contact.last_name
                            ? `${contact.first_name} ${contact.last_name}`
                            : contact.name || "N/A"}
                        </div>
                        {(contact.phone || contact.email) && (
                          <div className="text-sm text-gray-500">
                            {contact.phone} {contact.email && `• ${contact.email}`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {contact.source || "Manual"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={assignedTo[contact.id] || "unassigned"}
                          onValueChange={(value) => handleAssignedToChange(contact.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            <SelectItem value="ashish">Ashish</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {contact.last_seen ? new Date(contact.last_seen).toLocaleDateString() : "Never"}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Contact Modal */}
      {addContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.form 
            onSubmit={handleAddContact} 
            className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Contact</h2>
            <Input name="first_name" placeholder="First Name" required className="mb-3" />
            <Input name="last_name" placeholder="Last Name" required className="mb-3" />
            <Input name="phone" placeholder="Phone Number" required className="mb-3" />
            <Input name="email" placeholder="Email (Optional)" type="email" className="mb-3" />
            <Select name="gender" required>
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setAddContactModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={userLoading || addContactMutation.isPending}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {addContactMutation.isPending ? "Adding..." : "Add Contact"}
              </Button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Import Contacts Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.form 
            onSubmit={handleImportContacts} 
            className="bg-white p-6 rounded-lg shadow-xl w-96"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Import Contacts</h2>
            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={downloadCSVTemplate}
                className="w-full mb-3"
              >
                <i className="fas fa-download mr-2"></i>
                Download CSV Template
              </Button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".csv" 
                required 
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setImportModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Click outside to close filter dropdown */}
      {showFilters && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}