"use client"

import type React from "react"
import { useState } from "react"
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

interface BroadcastStats {
  sent: number
  delivered: number
  read: number
  replied: number
  sending: number
  failed: number
  processing: number
  queued: number
}

interface BroadcastData {
  id: string
  name: string
  scheduled: string
  successful: number
  read: number
  replied: number
  recipients: number
  failed: number
  status: "completed" | "failed" | "pending" | "processing" | "stopped"
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export default function BroadcastAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("Latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    pending: false,
    processing: false,
    completed: false,
    stopped: false,
  })

  // Zero state
  const [stats] = useState<BroadcastStats>({
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    sending: 0,
    failed: 0,
    processing: 0,
    queued: 0,
  })

  // Start with no broadcasts
  const [broadcasts] = useState<BroadcastData[]>([])
  const [loading] = useState(false)

  const setPresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    })
    setIsCalendarOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange.from) return "Select date range"
    if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy")
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
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "stopped":
        return "bg-red-100 text-red-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBroadcasts = broadcasts.filter((broadcast) => {
    const matchesSearch = broadcast.name.toLowerCase().includes(searchQuery.toLowerCase())
    const hasFiltersSelected = Object.values(selectedFilters).some((filter) => filter)

    if (!hasFiltersSelected) return matchesSearch

    const matchesFilter = selectedFilters[broadcast.status as keyof typeof selectedFilters]
    return matchesSearch && matchesFilter
  })

  const handleFilterChange = (filterType: keyof typeof selectedFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }))
  }

  const totalPages = Math.ceil(filteredBroadcasts.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBroadcasts = filteredBroadcasts.slice(startIndex, endIndex)
  const dispatch = useDispatch()
  const goToNewTemplate = () => dispatch(setCurrentView("create-template"))

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  {/* Preset options */}
                  <div className="border-r p-3 space-y-1">
                    <div className="text-sm font-medium text-gray-700 mb-2">Quick Select</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => setPresetRange(7)}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => setPresetRange(30)}
                    >
                      Last 30 days
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => setPresetRange(90)}
                    >
                      Last 90 days
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => setPresetRange(365)}
                    >
                      Last year
                    </Button>
                  </div>
                  {/* Calendar */}
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range) {
                        setDateRange({
                          from: range.from || undefined,
                          to: range.to || undefined,
                        })
                      } else {
                        setDateRange({ from: undefined, to: undefined })
                      }
                    }}
                    numberOfMonths={2}
                  />
                </div>
                <div className="border-t p-3 flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCalendarOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setIsCalendarOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button className="bg-green-600 hover:bg-green-700 text-white">New Broadcast</Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="px-6 py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overview</h2>
          <p className="text-gray-600">Track your broadcast performance metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <StatCard title="Sent" value={stats.sent} icon="📤" />
          <StatCard title="Delivered" value={stats.delivered} icon="📨" />
          <StatCard title="Read" value={stats.read} icon="👁️" />
          <StatCard title="Replied" value={stats.replied} icon="💬" />
          <StatCard title="Sending" value={stats.sending} icon="⏳" />
          <StatCard title="Failed" value={stats.failed} icon="❌" />
          <StatCard title="Processing" value={stats.processing} icon="⚙️" />
          <StatCard title="Queued" value={stats.queued} icon="📋" />
        </div>
      </div>

      {/* Broadcast List */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Broadcast list</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sorted by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Latest">Latest</SelectItem>
                  <SelectItem value="Oldest">Oldest</SelectItem>
                  <SelectItem value="Name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilterModal(true)}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">Updated: Just now</Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Broadcast name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Scheduled</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Successful</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Read</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Replied</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Recipients</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Failed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBroadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16">
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
                      <td className="py-3 px-4 font-medium">{broadcast.name}</td>
                      <td className="py-3 px-4 text-gray-600">{broadcast.scheduled}</td>
                      <td className="py-3 px-4">{broadcast.successful}</td>
                      <td className="py-3 px-4">{broadcast.read}</td>
                      <td className="py-3 px-4">{broadcast.replied}</td>
                      <td className="py-3 px-4">{broadcast.recipients}</td>
                      <td className="py-3 px-4 text-red-600">{broadcast.failed}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(broadcast.status)} capitalize`}>{broadcast.status}</Badge>
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

            {currentBroadcasts.length > 0 && (
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
                    {startIndex + 1}–{Math.min(endIndex, filteredBroadcasts.length)} of {filteredBroadcasts.length}
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
                      disabled={currentPage === totalPages || filteredBroadcasts.length === 0}
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilterModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Choose attributes to filter</p>
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
                      {key === "completed" && "COMPLETED"}
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
