"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Facebook,
  Instagram,
  CalendarDays,
  Mails,
  CalendarPlus,
  Rocket,
} from "lucide-react"

// Define the structure for each tool
interface AutomationTool {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

// Array of automation tools to be displayed
const automationTools: AutomationTool[] = [
  {
    id: "triggers",
    title: "Triggers",
    description: "Start flows based on specific keywords or actions.",
    icon: Zap,
  },
  {
    id: "facebook",
    title: "Facebook Automation",
    description: "Automate responses to comments on your Facebook posts.",
    icon: Facebook,
  },
  {
    id: "instagram",
    title: "Instagram Automation",
    description: "Automatically reply to comments and mentions on Instagram.",
    icon: Instagram,
  },
  {
    id: "scheduling",
    title: "Appointment Scheduling",
    description: "Let your contacts easily book an appointment with you.",
    icon: CalendarDays,
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

  const handleCardClick = (tool: AutomationTool) => {
    setSelectedTool(tool)
  }

  const handleCloseModal = () => {
    setSelectedTool(null)
  }

  const renderModalContent = () => {
    if (!selectedTool) return null

    // Specific UI for Appointment Scheduling
    if (selectedTool.id === "scheduling") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Configure Appointment Scheduling</DialogTitle>
            <DialogDescription>
              Link this service to an existing automation flow or connect a new
              calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="flow-select" className="text-sm font-medium">
                Select an Existing Flow
              </label>
              <Select>
                <SelectTrigger id="flow-select">
                  <SelectValue placeholder="Choose a flow..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flow-1">New Client Onboarding Flow</SelectItem>
                  <SelectItem value="flow-2">Follow-up Reminder Flow</SelectItem>
                  <SelectItem value="flow-3">Post-Appointment Survey Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Calendar Integration
              </label>
              <Button variant="outline" className="w-full justify-start">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add a Calendar
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button>Save Configuration</Button>
          </DialogFooter>
        </>
      )
    }

    // Default UI for other tools
    return (
      <>
        <DialogHeader>
          <DialogTitle>Configure {selectedTool.title}</DialogTitle>
          <DialogDescription>
            You are setting up the {selectedTool.title} tool. Further
            configuration will be available here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center">
            <p>Placeholder content for {selectedTool.title}.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseModal}>
            Close
          </Button>
          <Button>
            <Rocket className="mr-2 h-4 w-4" />
            Proceed
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