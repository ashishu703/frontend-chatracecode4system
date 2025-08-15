"use client"
import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Search } from "lucide-react"

const TEMPLATE_CATEGORIES = [
  { value: "all", label: "All", count: 0 },
  { value: "travel", label: "Travel", count: 0 },
  { value: "healthcare", label: "Healthcare", count: 0 },
  { value: "ecommerce", label: "E-Commerce", count: 0 },
  { value: "education", label: "Education", count: 0 },
  { value: "festival", label: "Festival", count: 0 },
  { value: "others", label: "Others", count: 0 },
]

export default function PrebuiltTemplatesPage({
  selectedCategory = "all",
  setSelectedCategory,
  useTemplate,
  templates = [], 
  onWatchTutorial,
  onNewTemplate,
}: {
  selectedCategory?: string
  setSelectedCategory: (s: string) => void
  useTemplate: (t: any) => void
  templates?: any[]
  onWatchTutorial?: () => void
  onNewTemplate?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter templates based on selected category and search
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "all" || 
      template.category?.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Update category counts based on templates
  const categoriesWithCounts = TEMPLATE_CATEGORIES.map(category => ({
    ...category,
    count: category.value === "all" 
      ? templates.length 
      : templates.filter(t => t.category?.toLowerCase() === category.value.toLowerCase()).length
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Template Library
            </h1>
            <p className="text-sm text-gray-600">
              Select or create your template and submit it for WhatsApp approval. All templates must adhere to{" "}
              <a href="#" className="text-green-600 hover:underline">
                WhatsApp's guidelines
              </a>
              .
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={onWatchTutorial}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Tutorial
            </Button>
            <Button 
              onClick={onNewTemplate}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              New Template Message
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
          {categoriesWithCounts.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                selectedCategory === category.value
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {category.label}
              <span className="ml-1 text-gray-400">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Language */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
            />
          </div>
          <select className="ml-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>English</option>
            <option>Hindi</option>
            <option>Spanish</option>
          </select>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Template Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 truncate">
                      {template.name}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-800 text-xs"
                    >
                      {template.status || "Active"}
                    </Badge>
                  </div>

                  {/* Template Preview */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 min-h-[100px]">
                    <div className="text-xs text-gray-600 mb-2">
                      Hi {template.variables?.[0] ? `{{${template.variables[0]}}}` : '{name}'},
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      {template.body ? 
                        template.body.substring(0, 120) + (template.body.length > 120 ? "..." : "")
                        : "Template content will appear here..."
                      }
                    </div>
                    
                    {/* Variables and Buttons indicators */}
                    <div className="flex items-center gap-2 mt-3">
                      {template.variables?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          <span className="text-xs text-gray-600">
                            **Your Code**: [Verification Code]
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {template.buttons?.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-xs text-gray-600">
                            **Your OTP**: [OTP Code]
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Use Sample Button */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => useTemplate(template)}
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Use sample
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* No Templates Message */
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Templates not available
            </h3>
            <p className="text-gray-500">
              {selectedCategory === "all" 
                ? "No templates found matching your search criteria."
                : `No templates available in the ${selectedCategory} category.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}