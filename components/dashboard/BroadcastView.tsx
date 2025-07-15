"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BroadcastView() {
  const [showTemplateForm, setShowTemplateForm] = useState(false)

  const broadcasts = [
    {
      id: 1,
      name: "Welcome Message",
      language: "English",
      category: "Marketing",
      status: "Active",
    },
    // Add more sample broadcasts
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <i className="fas fa-broadcast-tower mr-2 text-blue-600"></i>
              Broadcast
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" className="border-gray-300 bg-transparent">
                <i className="fas fa-cog mr-2"></i>
                Manage Meta Template
              </Button>
              <Button onClick={() => setShowTemplateForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <i className="fas fa-plus mr-2"></i>
                Add New Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Language</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((broadcast) => (
                  <motion.tr
                    key={broadcast.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-200 px-4 py-2">{broadcast.id}</td>
                    <td className="border border-gray-200 px-4 py-2">{broadcast.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{broadcast.language}</td>
                    <td className="border border-gray-200 px-4 py-2">{broadcast.category}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {broadcast.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <i className="fas fa-paper-plane mr-1"></i>
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">Showing 1 to 1 of 1 entries</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showTemplateForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Add New Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Marketing</option>
                      <option>Utility</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>English</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Broadcast Title (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter broadcast title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Use dynamic variables like {{1}} {{2}} and so on"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer (Optional)</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Footers are great to add any disclaimers or to add a thoughtful PS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buttons (Optional)</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="buttonType" value="none" className="mr-2" defaultChecked />
                      None
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="buttonType" value="cta" className="mr-2" />
                      Call to Action
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="buttonType" value="quick" className="mr-2" />
                      Quick Reply
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Template</Button>
                  <Button variant="outline" onClick={() => setShowTemplateForm(false)} className="border-gray-300">
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                <div className="bg-white rounded-lg p-4 shadow-sm border max-w-sm">
                  <div className="bg-green-500 text-white p-3 rounded-lg">
                    <p className="text-sm">Your message preview will appear here...</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
