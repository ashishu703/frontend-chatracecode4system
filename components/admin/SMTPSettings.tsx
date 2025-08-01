"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Save, TestTube } from "lucide-react"
import serverHandler from "@/utils/serverHandler"

export default function SMTPSettings() {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  
  const [settings, setSettings] = useState({
    email: "info@omnichat.karobar.org",
    host: "omnichat.karobar.org",
    password: "Karobar42044$",
    port: "465",
  })

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const response = await serverHandler.post("/api/admin/update_smtp", settings)
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "SMTP settings updated successfully",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800"
        })
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to update SMTP settings",
          variant: "destructive",
          className: "bg-red-50 border-red-200 text-red-800"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update SMTP settings",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800"
      })
      return
    }

    setIsTesting(true)
    try {
      const testPayload = {
        ...settings,
        to: testEmail
      }
      
      const response = await serverHandler.post("/api/admin/send_test_email", testPayload)
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Test email sent successfully",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800"
        })
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to send test email",
          variant: "destructive",
          className: "bg-red-50 border-red-200 text-red-800"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800"
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-2xl mr-2">📧</span>
            SMTP Settings
          </CardTitle>
          <p className="text-gray-600">Configure email settings</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@omnichat.karobar.org"
              />
            </div>

            <div>
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={settings.host}
                onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                placeholder="omnichat.karobar.org"
              />
            </div>

            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={settings.port}
                onChange={(e) => setSettings({ ...settings, port: e.target.value })}
                placeholder="465"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={settings.password}
                onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                placeholder="Your email password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Test Email Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Test Email Configuration</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="abc123@abc.com"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleTestEmail}
                disabled={isTesting}
                variant="outline"
                className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                {isTesting ? "Testing..." : "Send Test Email"}
              </Button>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isUpdating ? "Updating..." : "Update SMTP Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">© All rights reserved</div>
    </div>
  )
}
