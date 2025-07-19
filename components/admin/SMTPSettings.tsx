"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SMTPSettings() {
  const [settings, setSettings] = useState({
    emailAddress: "",
    emailServer: "",
    port: "587",
    password: "",
  })

  const handleUpdate = () => {
    console.log("SMTP settings updated:", settings)
    // Implement update logic
  }

  const handleTestEmail = () => {
    console.log("Testing email settings...")
    // Implement test email logic
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
              <Label htmlFor="emailAddress">Email address</Label>
              <Input
                id="emailAddress"
                type="email"
                value={settings.emailAddress}
                onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
                placeholder="your-email@domain.com"
              />
            </div>

            <div>
              <Label htmlFor="emailServer">Email server</Label>
              <Input
                id="emailServer"
                value={settings.emailServer}
                onChange={(e) => setSettings({ ...settings, emailServer: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={settings.port}
                onChange={(e) => setSettings({ ...settings, port: e.target.value })}
                placeholder="587"
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

          <div className="flex space-x-4">
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="fas fa-save mr-2"></i>
              Update
            </Button>
            <Button
              onClick={handleTestEmail}
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
            >
              <i className="fas fa-envelope mr-2"></i>
              Check Email Setting
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">© All rights reserved</div>
    </div>
  )
}
