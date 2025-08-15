 "use client"
 import React from "react"
 import { Card, CardContent } from "@/components/ui/card"
 import { MessageCircle, Plus, Save, Radio, Star, FileText } from "lucide-react"

 export default function HomePage({
   setCurrentPage,
 }: {
   setCurrentPage: (p: "home" | "prebuilt-templates" | "create-template" | "saved-templates" | "broadcast" | "broadcast-analytics") => void
 }) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
       <div className="max-w-7xl mx-auto p-8">
         <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl mb-6 shadow-xl">
             <MessageCircle className="w-10 h-10 text-white" />
           </div>
           <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
             WhatsApp Template Manager
           </h1>
           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
             Create, manage, and broadcast professional WhatsApp templates for your business communication
           </p>
         </div>

         <div className="grid md:grid-cols-3 gap-8 mb-12">
           <Card
             className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white cursor-pointer transform hover:scale-105"
             onClick={() => setCurrentPage("prebuilt-templates")}
           >
             <CardContent className="p-8 text-center">
               <FileText className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold mb-3">Prebuilt Templates</h3>
               <p className="text-purple-100">Choose from our collection of ready-to-use templates</p>
             </CardContent>
           </Card>

           <Card
             className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white cursor-pointer transform hover:scale-105"
             onClick={() => setCurrentPage("create-template")}
           >
             <CardContent className="p-8 text-center">
               <Plus className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold mb-3">Create Template</h3>
               <p className="text-blue-100">Build custom templates from scratch with our editor</p>
             </CardContent>
           </Card>

           <Card
             className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-500 to-emerald-500 text-white cursor-pointer transform hover:scale-105"
             onClick={() => setCurrentPage("saved-templates")}
           >
             <CardContent className="p-8 text-center">
               <Save className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold mb-3">Saved Templates</h3>
               <p className="text-green-100">Manage and edit your saved templates</p>
             </CardContent>
           </Card>
         </div>

         <div className="grid md:grid-cols-2 gap-8">
           <Card
             className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white cursor-pointer transform hover:scale-105"
             onClick={() => setCurrentPage("broadcast")}
           >
             <CardContent className="p-8 text-center">
               <Radio className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold mb-3">Broadcast Messages</h3>
               <p className="text-orange-100">Send approved templates to your audience</p>
             </CardContent>
           </Card>

           <Card 
             className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur cursor-pointer transform hover:scale-105"
             onClick={() => setCurrentPage("broadcast-analytics")}
           >
             <CardContent className="p-8 text-center">
               <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold mb-3 text-gray-800">Analytics</h3>
               <p className="text-gray-600">Track template performance and engagement</p>
             </CardContent>
           </Card>
         </div>
       </div>
     </div>
   )
 }


