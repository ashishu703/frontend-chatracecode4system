"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Testimonial {
  id: number
  name: string
  company: string
  message: string
  rating: number
}

export default function TestimonialsManagement() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: "John Doe",
      company: "Tech Corp",
      message: "MBG has transformed our business automation. Highly recommended!",
      rating: 5,
    },
    {
      id: 2,
      name: "Jane Smith",
      company: "Digital Agency",
      message: "Excellent platform with great customer support.",
      rating: 5,
    },
  ])

  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    company: "",
    message: "",
    rating: 5,
  })

  const handleAddTestimonial = () => {
    const testimonial: Testimonial = {
      ...newTestimonial,
      id: Date.now(),
    }
    setTestimonials([...testimonials, testimonial])
    setNewTestimonial({ name: "", company: "", message: "", rating: 5 })
    setShowAddForm(false)
  }

  const handleDeleteTestimonial = (id: number) => {
    setTestimonials(testimonials.filter((testimonial) => testimonial.id !== id))
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400"></i>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{testimonial.message}</p>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDeleteTestimonial(testimonial.id)}
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Add New Testimonial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={newTestimonial.company}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating *</Label>
                  <select
                    id="rating"
                    value={newTestimonial.rating}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={newTestimonial.message}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, message: e.target.value })}
                    placeholder="Testimonial message"
                    rows={6}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleAddTestimonial} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Testimonial
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-300">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
