"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FAQ {
  id: number
  question: string
  answer: string
}

export default function FAQsManagement() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question: "How do I get started with MBG?",
      answer: "Simply sign up for an account and follow our onboarding process to connect your platforms.",
    },
    {
      id: 2,
      question: "What platforms do you support?",
      answer: "We support WhatsApp, Facebook Messenger, Instagram, and Google services.",
    },
  ])

  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
  })

  const handleAddFaq = () => {
    const faq: FAQ = {
      ...newFaq,
      id: Date.now(),
    }
    setFaqs([...faqs, faq])
    setNewFaq({ question: "", answer: "" })
    setShowAddForm(false)
  }

  const handleDeleteFaq = (id: number) => {
    setFaqs(faqs.filter((faq) => faq.id !== id))
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
            {faqs.map((faq, index) => (
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
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
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
                />
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleAddFaq} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save FAQ
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-300">
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
