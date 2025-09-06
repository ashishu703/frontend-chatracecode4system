"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import CommentManager from "./FacebookCommentReply"
import InstagramCommentManager from "./InstagramCommentReply"
import AllDripCampaign from "./AllDripCampaign"
import DripCampaign from "./DripCampaign"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Facebook,
  Instagram,
  Mails,
  QrCode,
} from "lucide-react"

interface AutomationTool {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

const automationTools: AutomationTool[] = [
  {
    id: "triggers",
    title: "Triggers",
    description: "Start flows based on specific keywords or actions.",
    icon: Zap,
  },
  {
    id: "facebook",
    title: "Facebook comments Automation",
    description: "Automate responses to comments on your Facebook posts.",
    icon: Facebook,
  },
  {
    id: "instagram",
    title: "Instagram comments Automation",
    description: "Automatically reply to comments and mentions on Instagram.",
    icon: Instagram,
  },
  {
    id: "qr_generator",
    title: "QR Generator",
    description: "Generate QR codes for your business and marketing needs.",
    icon: QrCode,
  },
  {
    id: "drip_campaigns",
    title: "Drip Campaigns",
    description: "Nurture leads and customers with automated message sequences.",
    icon: Mails,
  },
]

// Main component
export default function AutomationGrid() {
  const [selectedTool, setSelectedTool] = useState<AutomationTool | null>(null)
  const [showToolContent, setShowToolContent] = useState(false)
  const [currentTool, setCurrentTool] = useState<'facebook' | 'instagram' | 'drip_campaigns' | null>(null)
  const [dripCampaignView, setDripCampaignView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const [campaignTitle, setCampaignTitle] = useState<string>('')

  const handleCardClick = (tool: AutomationTool) => {
    if (tool.id === "facebook") {
      setShowToolContent(true)
      setCurrentTool('facebook')
    } else if (tool.id === "instagram") {
      setShowToolContent(true)
      setCurrentTool('instagram')
    } else if (tool.id === "drip_campaigns") {
      setShowToolContent(true)
      setCurrentTool('drip_campaigns')
      setDripCampaignView('list')
    } else {
      setSelectedTool(tool)
    }
  }

  const handleCloseModal = () => {
    setSelectedTool(null)
  }

  const handleBackToTools = () => {
    setShowToolContent(false)
    setCurrentTool(null)
    setDripCampaignView('list')
    setEditingCampaign(null)
  }

  const handleCreateCampaign = (title: string) => {
    setCampaignTitle(title)
    setDripCampaignView('create')
    setEditingCampaign(null)
  }

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign)
    setDripCampaignView('edit')
  }

  const handleBackToList = () => {
    setDripCampaignView('list')
    setEditingCampaign(null)
    setCampaignTitle('')
  }

  // If showing tool content, render the appropriate component
  if (showToolContent) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {currentTool === 'facebook' && (
            <CommentManager onBack={handleBackToTools} />
          )}
          {currentTool === 'instagram' && (
            <InstagramCommentManager onBack={handleBackToTools} />
          )}
          {currentTool === 'drip_campaigns' && (
            <>
              {dripCampaignView === 'list' && (
                <AllDripCampaign 
                  onCreateCampaign={handleCreateCampaign}
                  onEditCampaign={handleEditCampaign}
                  onBack={handleBackToTools}
                />
              )}
              {(dripCampaignView === 'create' || dripCampaignView === 'edit') && (
                <DripCampaign 
                  onBack={handleBackToList}
                  editingCampaign={editingCampaign}
                  campaignTitle={campaignTitle}
                />
              )}
            </>
          )}
        </div>
      </div>
    )
  }

    const renderModalContent = () => {
    if (!selectedTool) return null

    // Coming Soon messages for specific tools
    if (selectedTool.id === "triggers" || selectedTool.id === "qr_generator") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>{selectedTool.title}</DialogTitle>
            <DialogDescription>
              This feature is coming soon! Stay tuned for updates.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon!</h3>
            <p className="text-gray-600">We're working hard to bring you this amazing feature. Stay tuned! 😊</p>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseModal}>
              Got it!
            </Button>
          </DialogFooter>
        </>
      )
    }

    // Default UI for other tools
    return (
      <>
        <DialogHeader>
          <DialogTitle>{selectedTool.title}</DialogTitle>
          <DialogDescription>
            This feature is coming soon! Stay tuned for updates.
          </DialogDescription>
        </DialogHeader>
        <div className="py-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon!</h3>
          <p className="text-gray-600">We're working hard to bring you this amazing feature. Stay tuned! 😊</p>
        </div>
        <DialogFooter>
          <Button onClick={handleCloseModal}>
            Got it!
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Automation Tools</h1>
        <p className="text-gray-500 mb-8">
          Select a tool to create or configure an automation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {automationTools.map((tool) => (
            <motion.div
              key={tool.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handleCardClick(tool)}
              className="cursor-pointer"
            >
              <Card className="h-full text-center hover:shadow-xl transition-shadow duration-300 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="flex items-center justify-center h-16 w-16 bg-blue-500 rounded-full text-white">
                    <tool.icon className="h-8 w-8" />
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardDescription className="text-sm text-gray-600">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedTool} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
        <DialogContent className="sm:max-w-[425px]">
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  )
}