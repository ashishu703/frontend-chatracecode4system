"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Globe, User, Upload, Trash2, Users, Inbox, AlertTriangle, Check, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Data and SVG Icons (unchanged from your original code)
const countries = [
  { value: "us", label: "United States", flag: "🇺🇸" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { value: "ca", label: "Canada", flag: "🇨🇦" },
  { value: "au", label: "Australia", flag: "🇦🇺" },
  { value: "de", label: "Germany", flag: "🇩🇪" },
  { value: "fr", label: "France", flag: "🇫🇷" },
  { value: "es", label: "Spain", flag: "🇪🇸" },
  { value: "it", label: "Italy", flag: "🇮🇹" },
  { value: "jp", label: "Japan", flag: "🇯🇵" },
  { value: "br", label: "Brazil", flag: "🇧🇷" },
]

const fallbackFlows = [
  { value: "default", label: "Default Support Flow" },
  { value: "escalation", label: "Human Escalation Flow" },
  { value: "feedback", label: "Feedback Collection Flow" },
  { value: "custom", label: "Custom Response Flow" },
]

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookMessengerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
  </svg>
)

export default function ChatbotAdminSettings() {
  // State for different form inputs
  const [developmentMode, setDevelopmentMode] = useState(false)
  const [accountName, setAccountName] = useState("My Chatbot")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedFallback, setSelectedFallback] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [channelConnections, setChannelConnections] = useState({
    instagram: false,
    messenger: false,
    whatsapp: false,
  })
  
  // New state to manage the active tab/section
  const [activeTab, setActiveTab] = useState("general")

  // Handlers (unchanged from your original code)
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChannelConnect = (channel: keyof typeof channelConnections) => {
    setChannelConnections((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }))
  }

  const handleSaveSettings = () => {
    console.log("Saving settings:", {
      developmentMode,
      accountName,
      selectedCountry,
      selectedFallback,
      logoFile,
      channelConnections,
    })
    // Here you would typically make an API call to save the settings
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Chatbot Settings</h1>
            <p className="text-gray-600">Configure your chatbot's behavior and integrations</p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center border-b border-gray-200">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "general"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("channels")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "channels"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "admins"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-indigo-600"
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-3 font-semibold transition-colors duration-200 ${
                activeTab === "account"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Account Management
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* General Integration Section */}
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Settings className="h-6 w-6 text-blue-600" />🔧 General Integration
                    </CardTitle>
                    <CardDescription>Configure basic chatbot behavior and settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Fallback Flow */}
                      <div className="space-y-2">
                        <Label htmlFor="fallback-flow" className="text-sm font-medium">
                          Fallback Flow
                        </Label>
                        <Select value={selectedFallback} onValueChange={setSelectedFallback}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fallback flow" />
                          </SelectTrigger>
                          <SelectContent>
                            {fallbackFlows.map((flow) => (
                              <SelectItem key={flow.value} value={flow.value}>
                                {flow.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          If the user message doesn't match any keyword and the AI fails, this flow will be sent.
                        </p>
                      </div>

                      {/* Default Country */}
                      <div className="space-y-2">
                        <Label htmlFor="default-country" className="text-sm font-medium">
                          Default Country
                        </Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select default country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                <div className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Select the main country your business serves. This sets the default contact language and time
                          when the contact's country isn't known.
                        </p>
                      </div>
                    </div>

                    {/* Development Mode */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="dev-mode" className="text-sm font-medium">
                            Development Mode
                          </Label>
                          <p className="text-xs text-gray-500">
                            Your bot will work only for bot admins. Enable this option if you are building your bot and
                            don't want non-admins to use the bot.
                          </p>
                        </div>
                        <Switch id="dev-mode" checked={developmentMode} onCheckedChange={setDevelopmentMode} />
                      </div>
                      {!developmentMode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <p className="text-xs text-amber-700">Bot functionality is enabled for all users.</p>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
                        Save General Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Channels Integration Section */}
            {activeTab === "channels" && (
              <motion.div
                key="channels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Globe className="h-6 w-6 text-purple-600" />🔗 Channels Integration
                    </CardTitle>
                    <CardDescription>Connect your chatbot to various messaging platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Instagram */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Card className="relative overflow-hidden border-2 hover:border-pink-300 transition-all duration-200">
                          <CardContent className="p-6 text-center space-y-4">
                            <div className="text-pink-500">
                              <InstagramIcon />
                            </div>
                            <div>
                              <h3 className="font-semibold">Instagram</h3>
                              <p className="text-xs text-gray-500">Direct Messages</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              {channelConnections.instagram ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <Check className="h-3 w-3 mr-1" />
                                  Connected
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Connected</Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => handleChannelConnect("instagram")}
                              variant={channelConnections.instagram ? "outline" : "default"}
                              className={
                                channelConnections.instagram
                                  ? "text-red-600 hover:bg-red-50"
                                  : "bg-pink-500 hover:bg-pink-600"
                              }
                              size="sm"
                            >
                              {channelConnections.instagram ? "Disconnect" : "Connect"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Facebook Messenger */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-200">
                          <CardContent className="p-6 text-center space-y-4">
                            <div className="text-blue-500">
                              <FacebookMessengerIcon />
                            </div>
                            <div>
                              <h3 className="font-semibold">Facebook Messenger</h3>
                              <p className="text-xs text-gray-500">Page Messages</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              {channelConnections.messenger ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <Check className="h-3 w-3 mr-1" />
                                  Connected
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Connected</Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => handleChannelConnect("messenger")}
                              variant={channelConnections.messenger ? "outline" : "default"}
                              className={
                                channelConnections.messenger
                                  ? "text-red-600 hover:bg-red-50"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }
                              size="sm"
                            >
                              {channelConnections.messenger ? "Disconnect" : "Connect"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* WhatsApp */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card className="relative overflow-hidden border-2 hover:border-green-300 transition-all duration-200">
                          <CardContent className="p-6 text-center space-y-4">
                            <div className="text-green-500">
                              <WhatsAppIcon />
                            </div>
                            <div>
                              <h3 className="font-semibold">WhatsApp</h3>
                              <p className="text-xs text-gray-500">Business API</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              {channelConnections.whatsapp ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <Check className="h-3 w-3 mr-1" />
                                  Connected
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Connected</Badge>
                              )}
                            </div>
                            <Button
                              onClick={() => handleChannelConnect("whatsapp")}
                              variant={channelConnections.whatsapp ? "outline" : "default"}
                              className={
                                channelConnections.whatsapp
                                  ? "text-red-600 hover:bg-red-50"
                                  : "bg-green-500 hover:bg-green-600"
                              }
                              size="sm"
                            >
                              {channelConnections.whatsapp ? "Disconnect" : "Connect"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Admins Section */}
            {activeTab === "admins" && (
              <motion.div
                key="admins"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Admins Section */}
                <Card className="shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="h-6 w-6 text-indigo-600" />
                      🛠️ Admins
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Collaborate seamlessly with your team, assign roles, and streamline account management for enhanced
                      productivity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Current Admins</p>
                            <p className="text-xs text-gray-500">3 active administrators</p>
                          </div>
                        </div>
                        <Badge>Owner</Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Manage Admins</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Admin Management</DialogTitle>
                            <DialogDescription>
                              Add, remove, or modify admin permissions for your chatbot.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input placeholder="Enter email to invite admin" />
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button>Send Invitation</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                {/* Inbox Teams Section */}
                <Card className="shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Inbox className="h-6 w-6 text-orange-600" />📥 Inbox Teams
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Enhance inbox conversation management by grouping team members based on skills, departments, and
                      support levels for streamlined collaboration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Active Teams</p>
                            <p className="text-xs text-gray-500">2 teams configured</p>
                          </div>
                        </div>
                        <Badge variant="outline">2 Teams</Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700">Manage Teams</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Team Management</DialogTitle>
                            <DialogDescription>Create and manage teams for better inbox organization.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input placeholder="Team name" />
                            <Input placeholder="Team description" />
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="support">Customer Support</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button>Create Team</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Account Management Section */}
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="h-6 w-6 text-green-600" />
                      🧑‍💼 Account Settings
                    </CardTitle>
                    <CardDescription>Manage your account information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Rename Account */}
                      <div className="space-y-2">
                        <Label htmlFor="account-name" className="text-sm font-medium">
                          Account Name
                        </Label>
                        <Input
                          id="account-name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Enter account name"
                        />
                      </div>

                      {/* Change Logo */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Account Logo</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={logoPreview || "/placeholder.svg?height=64&width=64"} />
                            <AvatarFallback>
                              <Camera className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <input
                              type="file"
                              id="logo-upload"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("logo-upload")?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Upload New Logo
                            </Button>
                            {logoFile && <p className="text-xs text-green-600">✓ {logoFile.name} selected</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="space-y-2 p-4 bg-red-50 rounded-lg border border-red-200">
                      <Label className="text-sm font-medium text-red-600">⚠️ Danger Zone</Label>
                      <p className="text-xs text-red-500 mb-3">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. It will erase all your data. All your data associated with
                              this chatbot will be deleted in 24 hours.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Yes, Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-green-600 hover:bg-green-700">Save Account Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  )
}