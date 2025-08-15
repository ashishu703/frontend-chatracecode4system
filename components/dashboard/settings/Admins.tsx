"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Users, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminsSettings() {
  return (
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
  )
} 