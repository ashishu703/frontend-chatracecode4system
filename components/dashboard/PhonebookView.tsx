"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PhonebookView() {
  const [searchTerm, setSearchTerm] = useState("")

  const contacts = [
    {
      id: 1,
      name: "John Doe",
      phone: "+1234567890",
      var1: "Value1",
      var2: "Value2",
      var3: "Value3",
      var4: "Value4",
      var5: "Value5",
      date: "2024-01-15",
    },
    // Add more sample contacts as needed
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <i className="fas fa-address-book mr-2 text-blue-600"></i>
              Phonebook
            </CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="fas fa-plus mr-2"></i>
              Add Phonebook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" className="border-gray-300 bg-transparent">
                <i className="fas fa-filter mr-2"></i>
                Filter
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-gray-300 bg-transparent">
                <i className="fas fa-download mr-2"></i>
                CSV
              </Button>
              <Button variant="outline" className="border-gray-300 bg-transparent">
                <i className="fas fa-print mr-2"></i>
                Print
              </Button>
              <Button variant="outline" className="border-gray-300 bg-transparent">
                <i className="fas fa-columns mr-2"></i>
                Columns
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Phone No</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable1</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable2</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable3</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable4</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Variable5</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-200 px-4 py-2">{contact.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.phone}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var1}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var2}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var3}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var4}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.var5}</td>
                    <td className="border border-gray-200 px-4 py-2">{contact.date}</td>
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
    </div>
  )
}
