"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Download, Search, ChevronLeft, ChevronRight, Info, Play, Filter, X } from "lucide-react"
import { useDispatch } from "react-redux"
import { setCurrentView } from "@/store/slices/dashboardSlice"

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

export default function BroadcastAnalyticsPage() {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [period, setPeriod] = useState("Last 7 days")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("Latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    pending: false,
    processing: false,
    completed: false,
    stopped: false
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

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <Card className="bg-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="flex items-center mt-2 text-gray-600">
              <span className="text-sm">{title}</span>
              <Info className="w-4 h-4 ml-1 text-gray-400" />
            </div>
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "stopped": return "bg-red-100 text-red-800"
      case "failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredBroadcasts = broadcasts.filter(broadcast => {
    const matchesSearch = broadcast.name.toLowerCase().includes(searchQuery.toLowerCase())
    const hasFiltersSelected = Object.values(selectedFilters).some(filter => filter)
    
    if (!hasFiltersSelected) return matchesSearch
    
    const matchesFilter = selectedFilters[broadcast.status as keyof typeof selectedFilters]
    return matchesSearch && matchesFilter
  })

  const handleFilterChange = (filterType: keyof typeof selectedFilters) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Date range filter</h1>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
              <Play className="w-4 h-4 mr-1" />
              Watch Tutorial
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              New Broadcast
            </Button>
          </div>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="px-6 py-6 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date picker from</label>
            <div className="relative">
              <Input type="text" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="pr-10" />
              <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date picker to</label>
            <div className="relative">
              <Input type="text" value={toDate} onChange={(e) => setToDate(e.target.value)} className="pr-10" />
              <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last 90 days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white">Apply now</Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <div className="flex items-center text-sm text-gray-600">
              <span>Messaging-Limit: -</span>
              <Info className="w-4 h-4 ml-1 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="px-6 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <StatCard title="Sent" value={stats.sent} icon="✓" />
          <StatCard title="Delivered" value={stats.delivered} icon="📨" />
          <StatCard title="Read" value={stats.read} icon="👁" />
          <StatCard title="Replied" value={stats.replied} icon="↩" />
          <StatCard title="Sending" value={stats.sending} icon="▶" />
          <StatCard title="Failed" value={stats.failed} icon="✕" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <StatCard title="Processing" value={stats.processing} icon="🔄" />
          <StatCard title="Queued" value={stats.queued} icon="📋" />
          <div className="md:col-span-4"></div>
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
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Latest">Latest</SelectItem>
                  <SelectItem value="Oldest">Oldest</SelectItem>
                  <SelectItem value="Name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
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
                        <img src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1754993129/no_data.14591486_tv48zw.svg" alt="No data" className="w-56 h-56 object-contain mb-4" />
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={goToNewTemplate}>New Template</Button>
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
                      <td className="py-3 px-4"><Badge className={`${getStatusColor(broadcast.status)} capitalize`}>{broadcast.status}</Badge></td>
                      <td className="py-3 px-4"><Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">⋯</Button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {currentBroadcasts.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                    <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{startIndex + 1}–{Math.min(endIndex, filteredBroadcasts.length)} of {filteredBroadcasts.length}</span>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || filteredBroadcasts.length === 0}>
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
                    <input type="checkbox" id={key} checked={checked} onChange={() => handleFilterChange(key as keyof typeof selectedFilters)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                    <label htmlFor={key} className="text-sm text-gray-700 uppercase">
                      {key === 'pending' && 'PENDING'}
                      {key === 'processing' && 'PROCESSING'}
                      {key === 'completed' && 'COMPLETED'}
                      {key === 'stopped' && 'STOPPED'}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8" onClick={() => setShowFilterModal(false)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}