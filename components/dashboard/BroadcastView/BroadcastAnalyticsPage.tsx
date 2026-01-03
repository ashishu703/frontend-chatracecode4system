"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Info, Filter, X, CalendarDays, FileText, Send, CheckCircle2, Loader2, AlertCircle, MoreVertical, Plus, GitBranch } from "lucide-react"
import { useDispatch } from "react-redux"
import { setCurrentView } from "@/store/slices/dashboardSlice"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays } from "date-fns"
import { Broadcast } from "@/utils/api/broadcast/broadcast"
import type { TempleteItem } from "@/types/broadcast/broadCastResponse"
import { whatsappTemplatesAPI } from "@/utils/api/broadcast/whatsapp-templates"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"
import type { Flow } from "@/types/chatbot/chatBotModel"

interface BroadcastStats {
  sent: number
  delivered: number
  replied: number
  sending: number
  failed: number
  processing: number
  queued: number
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export default function BroadcastAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showNewBroadcastModal, setShowNewBroadcastModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    pending: false,
    processing: false,
    finished: false,
    failed: false,
    stopped: false,
  })
  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    broadcastType: "template" as "template" | "flow",
    templateId: "",
    flowId: "",
    phonebookId: "",
    isScheduled: false,
    scheduledDate: undefined as Date | undefined,
  })
  const broadcastTitleRef = useRef<HTMLInputElement>(null)
  const [phonebooks, setPhonebooks] = useState<any[]>([])
  const [isLoadingPhonebooks, setIsLoadingPhonebooks] = useState(false)
  const [templates, setTemplates] = useState<TempleteItem[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [flows, setFlows] = useState<Flow[]>([])
  const [isLoadingFlows, setIsLoadingFlows] = useState(false)
  const [messagingLimit] = useState(2000) // Hardcoded for now, can be fetched from API later

  const dispatch = useDispatch()
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const filteredStatuses = useMemo(() => 
    Object.entries(selectedFilters)
      .filter(([_, checked]) => checked)
      .map(([key]) => key.toUpperCase()),
    [selectedFilters]
  )

  const {
    data: broadcastData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["broadcasts", debouncedSearchQuery, filteredStatuses, appliedDateRange],
    queryFn: ({ pageParam = 1 }) =>
      Broadcast.fetchBroadcasts({
        page: pageParam,
        limit: 10,
        search: debouncedSearchQuery,
        status: filteredStatuses,
        dateRange:
          appliedDateRange.from && appliedDateRange.to
            ? { from: appliedDateRange.from, to: appliedDateRange.to }
            : undefined,
      }),
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.pagination?.currentPage < lastPage?.pagination?.totalPages) {
        return lastPage.pagination.currentPage + 1
      }
      return undefined
    },
    staleTime: 2 * 60 * 1000,
    initialPageParam: 1,
  })

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!tableRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Add scroll listener
  useEffect(() => {
    const tableElement = tableRef.current
    if (tableElement) {
      tableElement.addEventListener('scroll', handleScroll)
      return () => tableElement.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    if (showNewBroadcastModal) {
      fetchPhonebooks()
      fetchTemplates()
      fetchFlows()
      // Auto-focus on broadcast title input
      setTimeout(() => {
        broadcastTitleRef.current?.focus()
      }, 100)
    }
  }, [showNewBroadcastModal])

  const broadcasts = broadcastData?.pages?.flatMap((page: any) => page.data || []) || []
  const pagination = broadcastData?.pages?.[0]?.pagination ?? { totalItems: 0, totalPages: 1 }

  const stats = useMemo((): BroadcastStats => {
    const statusCounts = broadcasts.reduce((acc, broadcast) => {
      const status = broadcast.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      sent: statusCounts.FINISHED || 0,
      delivered: statusCounts.FINISHED || 0,
      replied: 0,
      sending: statusCounts.PROCESSING || 0,
      failed: statusCounts.FAILED || 0,
      processing: statusCounts.PROCESSING || 0,
      queued: statusCounts.PENDING || 0,
    }
  }, [broadcasts])

  const setPresetRange = useCallback((days: number) => {
    const newRange = {
      from: subDays(new Date(), days),
      to: new Date(),
    }
    setDateRange(newRange)
    setAppliedDateRange(newRange)
    setIsCalendarOpen(false)
    setTimeout(() => refetch(), 100)
  }, [refetch])

  const handleDateSelect = (range: any) => {
    setDateRange({
      from: range?.from || undefined,
      to: range?.to || undefined,
    })
  }

  const formatDateRange = useCallback(() => {
    if (!dateRange.from && !dateRange.to) return "Select date range"
    if (!dateRange.from) return "Select start date"
    if (!dateRange.to) return "Select end date"
    return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
  }, [dateRange.from, dateRange.to])

  const getStatusColor = useCallback((status: string) => {
    const statusColors: Record<string, string> = {
      FINISHED: "bg-green-100 text-green-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      STOPPED: "bg-red-100 text-red-800",
      FAILED: "bg-red-100 text-red-800",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }, [])

  const getStatusDisplayName = useCallback((status: string) => {
    const statusNames: Record<string, string> = {
      FINISHED: "Completed",
      PROCESSING: "Processing",
      PENDING: "Pending",
      STOPPED: "Stopped",
      FAILED: "Failed",
    }
    return statusNames[status] || status
  }, [])

  const goToNewTemplate = () => dispatch(setCurrentView("create-template"))

  const handleFilterChange = (filterType: keyof typeof selectedFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }))
  }

  const fetchPhonebooks = useCallback(async () => {
    try {
      setIsLoadingPhonebooks(true)
      const response = await Broadcast.fetchPhonebooksByUid()
      setPhonebooks(response.data || [])
    } catch (error) {
      console.error("Error fetching phonebooks:", error)
      setPhonebooks([])
    } finally {
      setIsLoadingPhonebooks(false)
    }
  }, [])

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true)
      const response = await whatsappTemplatesAPI.getMyMetaTemplates()
      setTemplates(response.data || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
      setTemplates([])
    } finally {
      setIsLoadingTemplates(false)
    }
  }, [])

  const fetchFlows = useCallback(async () => {
    try {
      setIsLoadingFlows(true)
      const response = await serverHandler.get("/api/chat_flow/get_all")
      const data = response.data as { success: boolean; data: Flow[] }
      if (data.success && data.data) {
        setFlows(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching flows:", error)
      setFlows([])
    } finally {
      setIsLoadingFlows(false)
    }
  }, [])

  const handleCreateBroadcast = useCallback(async () => {
    try {
      const selectedPhonebook = phonebooks.find((p) => p.id.toString() === newBroadcast.phonebookId)

      if (!selectedPhonebook) {
        console.error("Phonebook not found")
        return
      }

      // Handle template-based broadcast
      if (newBroadcast.broadcastType === "template") {
        const selectedTemplate = templates.find((t) => t.id === newBroadcast.templateId)
        if (!selectedTemplate) {
          console.error("Template not found")
          return
        }

        const requestPayload = {
          title: newBroadcast.title,
          templet: {
            name: selectedTemplate.name,
            parameter_format: selectedTemplate.parameter_format || "POSITIONAL",
            components: selectedTemplate.components || [],
            language: selectedTemplate.language || "en",
            status: selectedTemplate.status || "APPROVED",
            category: selectedTemplate.category || "MARKETING",
            id: selectedTemplate.id,
          },
          phonebook: {
            id: selectedPhonebook.id,
            name: selectedPhonebook.name,
            uid: selectedPhonebook.uid,
            createdAt: selectedPhonebook.createdAt,
            updatedAt: selectedPhonebook.updatedAt,
          },
          scheduleTimestamp:
            newBroadcast.isScheduled && newBroadcast.scheduledDate ? newBroadcast.scheduledDate.getTime() : Date.now(),
          example: [],
        }

        const response = await Broadcast.addNewBroadcast(requestPayload)
        
        if (response.success) {
          setShowNewBroadcastModal(false)
          setNewBroadcast({
            title: "",
            broadcastType: "template",
            templateId: "",
            flowId: "",
            phonebookId: "",
            isScheduled: false,
            scheduledDate: undefined,
          })
          refetch()
        }
      } else if (newBroadcast.broadcastType === "flow") {
        // Handle flow-based broadcast
        const selectedFlow = flows.find((f) => f.flow_id === newBroadcast.flowId)
        if (!selectedFlow) {
          console.error("Flow not found")
          return
        }

        // TODO: Implement flow-based broadcast API call
        // For now, we'll use the same API structure but with flow information
        // This might need backend support for flow-based broadcasts
        console.log("Flow-based broadcast:", {
          title: newBroadcast.title,
          flowId: newBroadcast.flowId,
          flow: selectedFlow,
          phonebook: selectedPhonebook,
        })
        
        // Placeholder: You may need to create a separate API endpoint for flow-based broadcasts
        alert("Flow-based broadcasts are not yet fully implemented. Please use Template-based broadcasts for now.")
      }
    } catch (error) {
      console.error("Error creating broadcast:", error)
    }
  }, [newBroadcast, templates, phonebooks, flows, refetch])

  const resetForm = () => {
    setNewBroadcast({
      title: "",
      broadcastType: "template",
      templateId: "",
      flowId: "",
      phonebookId: "",
      isScheduled: false,
      scheduledDate: undefined,
    })
    setShowNewBroadcastModal(false)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">Failed to load broadcast data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-white border-b px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Broadcast Analytics</h1>
            <p className="text-sm text-gray-500">Track and manage your broadcast campaigns.</p>
          </div>
          <div className="flex items-center gap-3">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-300 bg-white hover:bg-gray-50"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 rounded-xl" align="end" sideOffset={5}>
                <div className="flex">
                  <div className="border-r p-2 space-y-1 w-44">
                    <div className="text-sm font-medium text-gray-700 mb-2">Quick Select</div>
                    {[7, 30, 90, 365].map((days) => (
                      <Button
                        key={days}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm"
                        onClick={() => setPresetRange(days)}
                      >
                        Last {days} {days === 1 ? "day" : "days"}
                      </Button>
                    ))}
                  </div>
                  <div className="p-2">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                    />
                    <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDateRange({ from: undefined, to: undefined })
                          setIsCalendarOpen(false)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          setAppliedDateRange(dateRange)
                          setIsCalendarOpen(false)
                          setTimeout(() => refetch(), 100)
                        }}
                        disabled={!dateRange.from || !dateRange.to}
                      >
                        Apply Filter
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowNewBroadcastModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Broadcast
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Messaging Limit Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <Info className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Your current messaging limit is <span className="font-bold">{messagingLimit.toLocaleString()} messages</span> per day
              </p>
              <p className="text-xs text-gray-600 mt-1">
                This is the maximum number of unique WhatsApp users you can send messages to outside of customer service windows within a 24-hour period.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-white border-gray-300 hover:bg-gray-50 ml-4"
          >
            {messagingLimit.toLocaleString()} Messages
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sent Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Sent</h3>
                <Send className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.sent}</p>
            </CardContent>
          </Card>

          {/* Delivered Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
            </CardContent>
          </Card>

          {/* Processing Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Processing</h3>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.processing}</p>
            </CardContent>
          </Card>

          {/* Failed Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Failed</h3>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Broadcasts Table Section */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Broadcasts</h2>
              <p className="text-sm text-gray-500">{pagination.totalItems} total broadcasts</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search broadcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(true)}
                className="border-gray-300 bg-white hover:bg-gray-50"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Table */}
            <div 
              ref={tableRef}
              className="overflow-x-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Broadcast Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Template</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phonebook</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Scheduled</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && broadcasts.length === 0 ? (
                    <>
                      {[...Array(5)].map((_, rowIndex) => (
                        <tr key={`sk-${rowIndex}`} className="border-b border-gray-100">
                          <td colSpan={7} className="py-3 px-4">
                            <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : broadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16">
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                            alt="No data"
                            className="w-56 h-56 object-contain mb-4"
                          />
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={goToNewTemplate}>
                            New Template
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {broadcasts.map((broadcast) => (
                        <tr key={broadcast.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{broadcast.title}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div>
                              <div className="font-medium">{broadcast.templet.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{broadcast.templet.category}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{broadcast.phonebook.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {format(new Date(broadcast.schedule), "MMM dd, yyyy HH:mm")}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(broadcast.status)} rounded-full px-3 py-0.5 text-xs font-medium`}>
                              {getStatusDisplayName(broadcast.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {format(new Date(broadcast.createdAt), "MMM dd, yyyy")}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Showing {broadcasts.length} of {pagination.totalItems} broadcasts
              </p>
              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilterModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Choose status filters</p>
              <div className="space-y-3">
                {Object.entries(selectedFilters).map(([key, checked]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={checked}
                      onChange={() => handleFilterChange(key as keyof typeof selectedFilters)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={key} className="text-sm text-gray-700 uppercase">
                      {key === "pending" && "PENDING"}
                      {key === "processing" && "PROCESSING"}
                      {key === "finished" && "FINISHED"}
                      {key === "failed" && "FAILED"}
                      {key === "stopped" && "STOPPED"}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                onClick={() => setShowFilterModal(false)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Broadcast Modal */}
      {showNewBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create New Broadcast</h3>
              <Button variant="ghost" size="sm" onClick={resetForm} className="hover:bg-gray-100">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="broadcastTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Broadcast Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="broadcastTitle"
                  ref={broadcastTitleRef}
                  placeholder="Enter broadcast title..."
                  value={newBroadcast.title}
                  onChange={(e) =>
                    setNewBroadcast((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Broadcast Type <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="broadcastType"
                      value="template"
                      checked={newBroadcast.broadcastType === "template"}
                      onChange={(e) =>
                        setNewBroadcast((prev) => ({
                          ...prev,
                          broadcastType: e.target.value as "template" | "flow",
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Template</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="broadcastType"
                      value="flow"
                      checked={newBroadcast.broadcastType === "flow"}
                      onChange={(e) =>
                        setNewBroadcast((prev) => ({
                          ...prev,
                          broadcastType: e.target.value as "template" | "flow",
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <GitBranch className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Flow</span>
                  </label>
                </div>
              </div>

              {newBroadcast.broadcastType === "template" && (
              <div>
                <label htmlFor="templateSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newBroadcast.templateId}
                  onValueChange={(value) => setNewBroadcast((prev) => ({ ...prev, templateId: value }))}
                  required
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Choose a template..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTemplates ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : templates.length > 0 ? (
                      templates.map((template, index) => {
                        const actualTemplate = Array.isArray(template) ? template[0] : template
                        return (
                          <SelectItem
                            key={actualTemplate?.id || `template-${index}`}
                            value={actualTemplate?.id || `template-${index}`}
                          >
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-blue-600 mr-1" />
                              <span>{actualTemplate?.name || `Template ${index + 1}`}</span>
                            </div>
                          </SelectItem>
                        )
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No templates available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              )}

              {newBroadcast.broadcastType === "flow" && (
              <div>
                <label htmlFor="flowSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Flow <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newBroadcast.flowId}
                  onValueChange={(value) => setNewBroadcast((prev) => ({ ...prev, flowId: value }))}
                  required
                >
                  <SelectTrigger className="w-full border-green-500 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder={isLoadingFlows ? "Loading flows..." : "Choose a flow..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingFlows ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : flows.length > 0 ? (
                      flows.map((flow) => (
                        <SelectItem key={flow.flow_id} value={flow.flow_id}>
                          <div className="flex items-center">
                            <GitBranch className="w-4 h-4 text-green-600 mr-1" />
                            <span>{flow.title}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No flows available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              )}

              <div>
                <label htmlFor="phonebookSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Phonebook <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newBroadcast.phonebookId}
                  onValueChange={(value) => setNewBroadcast((prev) => ({ ...prev, phonebookId: value }))}
                  required
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue
                      placeholder={isLoadingPhonebooks ? "Loading phonebooks..." : "Choose a phonebook..."}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPhonebooks ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : phonebooks.length > 0 ? (
                      phonebooks.map((phonebook) => (
                        <SelectItem key={phonebook.id} value={phonebook.id.toString()}>
                          {phonebook.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No phonebooks available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Schedule</label>
                  <input
                    type="checkbox"
                    id="scheduleToggle"
                    checked={newBroadcast.isScheduled}
                    onChange={(e) =>
                      setNewBroadcast((prev) => ({
                        ...prev,
                        isScheduled: e.target.checked,
                        scheduledDate: e.target.checked ? new Date() : undefined,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:outline-none focus:ring-0"
                  />
                </div>

                {newBroadcast.isScheduled && (
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {newBroadcast.scheduledDate
                            ? format(newBroadcast.scheduledDate, "PPP 'at' HH:mm")
                            : "Select Date and Time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4 rounded-xl" align="start">
                        <div className="space-y-4">
                          <CalendarComponent
                            mode="single"
                            selected={newBroadcast.scheduledDate}
                            onSelect={(date) =>
                              setNewBroadcast((prev) => ({
                                ...prev,
                                scheduledDate: date || undefined,
                              }))
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Time:</label>
                            <input
                              type="time"
                              value={newBroadcast.scheduledDate ? format(newBroadcast.scheduledDate, "HH:mm") : ""}
                              onChange={(e) => {
                                if (newBroadcast.scheduledDate) {
                                  const [hours, minutes] = e.target.value.split(":")
                                  const newDate = new Date(newBroadcast.scheduledDate)
                                  newDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                                  setNewBroadcast((prev) => ({
                                    ...prev,
                                    scheduledDate: newDate,
                                  }))
                                }
                              }}
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-6"
                onClick={handleCreateBroadcast}
                disabled={
                  !newBroadcast.title ||
                  (newBroadcast.broadcastType === "template" && !newBroadcast.templateId) ||
                  (newBroadcast.broadcastType === "flow" && !newBroadcast.flowId) ||
                  !newBroadcast.phonebookId ||
                  (newBroadcast.isScheduled && !newBroadcast.scheduledDate)
                }
              >
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
