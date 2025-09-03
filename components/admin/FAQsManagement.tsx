"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"
import { useToast } from "@/hooks/use-toast"

interface FAQ {
  id: number
  question: string
  answer: string
  createdAt?: string
  updatedAt?: string
}

interface FAQResponse {
  success: boolean
  data: FAQ[]
  pagination: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export default function FAQsManagement() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 })
  const { toast } = useToast()

  const fetchFaqs = async (pageNum = page, pageSize = limit) => {
    try {
      setFetching(true)
      const res = await serverHandler.get(`/api/admin/get_faq?page=${pageNum}&limit=${pageSize}`)
      const data = (res as any).data
      if (data.success) {
        setFaqs(data.data)
        setPagination(data.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: pageSize })
      } else {
        throw new Error("Failed to fetch FAQs")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to fetch FAQs",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchFaqs(page, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast({
        title: "Error",
        description: "Question and answer are required.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
      return
    }
    try {
      setLoading(true)
      const res = await serverHandler.post("/api/admin/add_faq", newFaq)
      const data = (res as any).data
      if (data.success) {
        toast({
          title: "Success",
          description: data.msg || "FAQ was added.",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        setNewFaq({ question: "", answer: "" })
        setShowAddForm(false)
        fetchFaqs(1, limit)
        setPage(1)
      } else {
        throw new Error(data.msg || "Failed to add FAQ")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add FAQ",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFaq = async (id: number) => {
    try {
      setLoading(true)
      const res = await serverHandler.post("/api/admin/del_faq", { id })
      const data = (res as any).data
      if (data.success) {
        toast({
          title: "Success",
          description: data.msg || "FAQ was deleted.",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        fetchFaqs(page, limit)
      } else {
        throw new Error(data.msg || "Failed to delete FAQ")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete FAQ",
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
              <span className="text-2xl mr-2">❓</span>
              FAQs Management
            </CardTitle>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="fas fa-plus mr-2"></i>
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fetching ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No FAQs found.</div>
            ) : faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDeleteFaq(faq.id)}
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
            <CardTitle>Add New FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="Enter the question"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Enter the answer"
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleAddFaq} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                  Save FAQ
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
