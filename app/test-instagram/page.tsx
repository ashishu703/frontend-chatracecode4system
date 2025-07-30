"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Instagram, CheckCircle, AlertCircle } from "lucide-react"

export default function TestInstagramPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testInstagramOAuth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/auth/instagram')
      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        console.log('Instagram OAuth URL generated:', data.data.authUrl)
      } else {
        setError(data.message || 'Failed to generate Instagram OAuth URL')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const redirectToInstagram = () => {
    if (result?.authUrl) {
      window.location.href = result.authUrl
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-5 h-5" />
              Instagram OAuth Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testInstagramOAuth} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing Instagram OAuth...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Test Instagram OAuth
                </div>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Instagram OAuth URL generated successfully!
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h3 className="font-semibold">Generated Data:</h3>
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    <div><strong>Client ID:</strong> {result.clientId}</div>
                    <div><strong>State:</strong> {result.state}</div>
                    <div><strong>Redirect URI:</strong> {result.redirectUri}</div>
                  </div>
                </div>

                <Button 
                  onClick={redirectToInstagram}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Connect Instagram Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 