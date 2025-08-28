"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, Info, Filter, X, CalendarDays } from "lucide-react"
import { useDispatch } from "react-redux"
import { setCurrentView } from "@/store/slices/dashboardSlice"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays } from "date-fns"
import { fetchBroadcasts } from "@/utils/api/broadcast"
import type { BroadcastItem, BroadcastPagination } from "@/types/broadcast/broadcast"

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
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    pending: false,
    processing: false,
    finished: false,
    failed: false,
    stopped: false,
  })

  const dispatch = useDispatch()

  const { data: broadcastData, isLoading, error, refetch } = useQuery({
    queryKey: ['broadcasts', currentPage, itemsPerPage, searchQuery, selectedFilters, dateRange],
    queryFn: () => fetchBroadcasts({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: Object.entries(selectedFilters)
        .filter(([_, checked]) => checked)
        .map(([key, _]) => key.toUpperCase()),
      dateRange: dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined
    }),
    staleTime: 2 * 60 * 1000,
  })

  useEffect(() => {
    refetch()
  }, [])

  const broadcasts: BroadcastItem[] = broadcastData?.data || []
  const pagination: BroadcastPagination = broadcastData?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10
  }

  const stats: BroadcastStats = {
    sent: broadcasts.filter(b => b.status === "FINISHED").length,
    delivered: broadcasts.filter(b => b.status === "FINISHED").length,
    replied: 0,
    sending: broadcasts.filter(b => b.status === "PROCESSING").length,
    failed: broadcasts.filter(b => b.status === "FAILED").length,
    processing: broadcasts.filter(b => b.status === "PROCESSING").length,
    queued: broadcasts.filter(b => b.status === "PENDING").length,
  }

  const setPresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    })
    setIsCalendarOpen(false)
    setTimeout(() => refetch(), 100)
  }

  const handleDateSelect = (range: any) => {
    setDateRange({
      from: range?.from || undefined,
      to: range?.to || undefined,
    })
  }

  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return "Select date range"
    if (!dateRange.from) return "Select start date"
    if (!dateRange.to) return "Select end date"
    return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
  }

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <Card className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 shadow-sm rounded-xl">
      <CardContent className="p-6 h-32 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-gray-900">{value}</div>
          <div className="text-3xl opacity-80">{icon}</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  )

  const getStatusColor = (status: string) => {
    const statusColors = {
      "FINISHED": "bg-green-100 text-green-800",
      "PROCESSING": "bg-blue-100 text-blue-800",
      "PENDING": "bg-yellow-100 text-yellow-800",
      "STOPPED": "bg-red-100 text-red-800",
      "FAILED": "bg-red-100 text-red-800"
    }
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
  }

  const getStatusDisplayName = (status: string) => {
    const statusNames = {
      "FINISHED": "Completed",
      "PROCESSING": "Processing",
      "PENDING": "Pending",
      "STOPPED": "Stopped",
      "FAILED": "Failed"
    }
    return statusNames[status as keyof typeof statusNames] || status
  }

  const filteredBroadcasts = broadcasts.filter((broadcast) => {
    const matchesSearch = broadcast.title.toLowerCase().includes(searchQuery.toLowerCase())
    const hasFiltersSelected = Object.values(selectedFilters).some((filter) => filter)

    if (!hasFiltersSelected) return matchesSearch

    const statusKey = broadcast.status.toLowerCase()
    const matchesFilter = selectedFilters[statusKey as keyof typeof selectedFilters]
    return matchesSearch && matchesFilter
  })

  const totalPages = pagination.totalPages || 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBroadcasts = filteredBroadcasts.slice(startIndex, endIndex)

  const goToNewTemplate = () => dispatch(setCurrentView("create-template"))

  const handleFilterChange = (filterType: keyof typeof selectedFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading broadcasts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-4">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-64 justify-start text-left font-normal bg-transparent rounded-lg"
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
                        Last {days} {days === 1 ? 'day' : 'days'}
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
                          setDateRange({ from: undefined, to: undefined });
                          setIsCalendarOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          setIsCalendarOpen(false);
                          refetch();
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
            <Button className="bg-green-600 hover:bg-green-700 text-white">New Broadcast</Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
          <p className="text-gray-600">Track your broadcast performance metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-4">
          <StatCard title="Sent" value={stats.sent} icon="📤" />
          <StatCard title="Delivered" value={stats.delivered} icon="📨" />
          <StatCard title="Replied" value={stats.replied} icon="💬" />
          <StatCard title="Sending" value={stats.sending} icon="⏳" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <StatCard title="Failed" value={stats.failed} icon="❌" />
          <StatCard title="Processing" value={stats.processing} icon="⚙️" />
          <StatCard title="Queued" value={stats.queued} icon="📋" />
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Broadcast list ({pagination.totalItems} total)
            </h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search broadcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-white border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilterModal(true)}
                  className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 px-5 py-2.5 rounded-xl font-semibold text-gray-700 shadow-sm"
                >
                  <Filter className="w-4 h-4 mr-2 text-green-600" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Broadcast name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Template</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Phonebook</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Scheduled</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBroadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16">
                      <div className="flex flex-col items-center justify-center">
                        <img
                          src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1754993129/no_data.14591486_tv48zw.svg"
                          alt="No data"
                          className="w-56 h-56 object-contain mb-4"
                        />
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={goToNewTemplate}>
                          New Template
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentBroadcasts.map((broadcast) => (
                    <tr key={broadcast.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{broadcast.title}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>
                          <div className="font-medium">{broadcast.templet.name}</div>
                          <div className="text-sm text-gray-500">{broadcast.templet.category}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{broadcast.phonebook.name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(broadcast.schedule), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(broadcast.status)} capitalize`}>
                          {getStatusDisplayName(broadcast.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(broadcast.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          ⋯
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-16">
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
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {startIndex + 1}–{Math.min(endIndex, pagination.totalItems)} of {pagination.totalItems}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                className="bg-green-600 hover:bg-green-700 text-white px-8"
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
