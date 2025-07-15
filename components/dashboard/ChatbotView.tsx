"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ChatbotView() {
  const [activeTab, setActiveTab] = useState("auto")

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-robot mr-2 text-blue-600"></i>
            Chatbot Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === "auto" ? "default" : "outline"}
              onClick={() => setActiveTab("auto")}
              className={`${
                activeTab === "auto" ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <i className="fas fa-robot mr-2"></i>
              Auto Chatbot
            </Button>
            <Button
              variant={activeTab === "canned" ? "default" : "outline"}
              onClick={() => setActiveTab("canned")}
              className={`${
                activeTab === "canned" ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <i className="fas fa-comments mr-2"></i>
              Canned Responses
            </Button>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "auto" ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Auto Chatbot Configuration</h3>
                  <p className="text-gray-600 mb-4">
                    Set up automated responses and conversation flows for your chatbot.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <i className="fas fa-plus mr-2"></i>
                    Create New Bot
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((bot) => (
                    <Card key={bot} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Bot {bot}</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Automated customer service bot</p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-gray-300 bg-transparent">
                            <i className="fas fa-edit mr-1"></i>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-300 bg-transparent">
                            <i className="fas fa-chart-bar mr-1"></i>
                            Stats
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Canned Responses</h3>
                  <p className="text-gray-600 mb-4">
                    Create and manage pre-written responses for common customer inquiries.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <i className="fas fa-plus mr-2"></i>
                    Add Response
                  </Button>
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Welcome Message", content: "Hello! Welcome to our service. How can I help you today?" },
                    { title: "Business Hours", content: "Our business hours are Monday to Friday, 9 AM to 6 PM." },
                    { title: "Thank You", content: "Thank you for contacting us. We appreciate your business!" },
                  ].map((response, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{response.title}</h4>
                            <p className="text-sm text-gray-600">{response.content}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button size="sm" variant="outline" className="border-gray-300 bg-transparent">
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600 bg-transparent">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
