import React, { useState } from "react"
import { Search, Info } from "lucide-react"

export default function ScheduledBroadcast() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  
  // Empty data array - add your data here when available
  const broadcasts: Array<{ id: string; name: string; scheduled: string }> = []
  
  const filteredBroadcasts = broadcasts.filter(broadcast =>
    broadcast?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const totalItems = filteredBroadcasts.length
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems)
  const paginatedBroadcasts = filteredBroadcasts.slice(startIndex, endIndex)
  
  const totalPages = Math.ceil(totalItems / rowsPerPage)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Scheduled Broadcast</h1>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Messaging Limit */}
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-sm">Messaging-Limit: -</span>
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Info className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* New Broadcast Button */}
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                New Broadcast
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-700 font-medium">Broadcast name</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-medium">Scheduled</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBroadcasts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16">
                      <div className="flex flex-col items-center justify-center">
                        <img 
                          src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1754993129/no_data.14591486_tv48zw.svg" 
                          alt="No data" 
                          className="w-64 h-64 object-contain mb-4" 
                        />
                        <p className="text-gray-500 text-lg">No scheduled broadcasts found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBroadcasts.map((broadcast, index) => (
                    <tr key={broadcast.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-800">{broadcast.name}</td>
                      <td className="py-4 px-6 text-gray-600">{broadcast.scheduled}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {/* Add action buttons here */}
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer/Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {totalItems === 0 ? "0–0 of 0" : `${startIndex + 1}–${endIndex} of ${totalItems}`}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || totalItems === 0}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalItems === 0}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}