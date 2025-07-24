"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import serverHandler from "@/utils/serverHandler"
import { useToast } from "@/hooks/use-toast"

interface Testimonial {
  id: number
  title: string
  description: string
  reviewer_name: string
  reviewer_position: string
  createdAt?: string
  updatedAt?: string
}

interface TestimonialResponse {
  success: boolean
  data: Testimonial[]
  pagination: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export default function TestimonialsManagement() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [newTestimonial, setNewTestimonial] = useState({
    title: "",
    description: "",
    reviewer_name: "",
    reviewer_position: "",
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 })
  const { toast } = useToast()

  const fetchTestimonials = async (pageNum = page, pageSize = limit) => {
    try {
      setFetching(true)
      const res = await serverHandler.get(`/api/admin/get_testi?page=${pageNum}&limit=${pageSize}`)
      const data = (res as any).data
      if (data.success) {
        setTestimonials(data.data)
        setPagination(data.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: pageSize })
      } else {
        throw new Error("Failed to fetch testimonials")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch testimonials",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchTestimonials(page, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  const handleAddTestimonial = async () => {
    if (!newTestimonial.title.trim() || !newTestimonial.description.trim() || !newTestimonial.reviewer_name.trim() || !newTestimonial.reviewer_position.trim()) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
      return
    }
    try {
      setLoading(true)
      const res = await serverHandler.post("/api/admin/add_testimonial", newTestimonial)
      const data = (res as any).data
      if (data.success) {
        toast({
          title: "Success",
          description: data.msg || "Testimonial was added.",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setNewTestimonial({ title: "", description: "", reviewer_name: "", reviewer_position: "" })
        setShowAddForm(false)
        fetchTestimonials(1, limit)
        setPage(1)
      } else {
        throw new Error(data.msg || "Failed to add testimonial")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add testimonial",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTestimonial = async (id: number) => {
    try {
      setLoading(true)
      const res = await serverHandler.post("/api/admin/del_testi", { id })
      const data = (res as any).data
      if (data.success) {
        toast({
          title: "Success",
          description: data.msg || "Testimonial was deleted.",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        fetchTestimonials(page, limit)
      } else {
        throw new Error(data.msg || "Failed to delete testimonial")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete testimonial",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">⭐</span>
              Testimonials Management
            </CardTitle>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="fas fa-plus mr-2"></i>
              Add Testimonial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fetching ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No testimonials found.</div>
            ) : testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{testimonial.title}</h3>
                    <p className="text-gray-600 mb-2">{testimonial.description}</p>
                    <div className="text-sm text-gray-700 font-medium">
                      {testimonial.reviewer_name} <span className="text-gray-400">|</span> {testimonial.reviewer_position}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      disabled={loading}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              {pagination.totalItems > 0
                ? `Showing ${(pagination.currentPage - 1) * pagination.pageSize + 1} to ${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of ${pagination.totalItems} entries`
                : 'No entries'}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant="outline"
                  size="sm"
                  className={pagination.currentPage === i + 1 ? "bg-blue-600 text-white" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Add New Testimonial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newTestimonial.title}
                  onChange={e => setNewTestimonial({ ...newTestimonial, title: e.target.value })}
                  placeholder="Enter testimonial title"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newTestimonial.description}
                  onChange={e => setNewTestimonial({ ...newTestimonial, description: e.target.value })}
                  placeholder="Enter testimonial description"
                  rows={4}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="reviewer_name">Reviewer Name *</Label>
                <Input
                  id="reviewer_name"
                  value={newTestimonial.reviewer_name}
                  onChange={e => setNewTestimonial({ ...newTestimonial, reviewer_name: e.target.value })}
                  placeholder="Enter reviewer name"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="reviewer_position">Reviewer Position *</Label>
                <Input
                  id="reviewer_position"
                  value={newTestimonial.reviewer_position}
                  onChange={e => setNewTestimonial({ ...newTestimonial, reviewer_position: e.target.value })}
                  placeholder="Enter reviewer position"
                  disabled={loading}
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleAddTestimonial} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                  Save Testimonial
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-300" disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
