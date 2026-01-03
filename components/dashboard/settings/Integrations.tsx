"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Key, 
  ArrowLeftRight, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Eye, 
  EyeOff,
  Loader2,
  Info
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { integrationsApi, apiKeyApi, type Integration } from "@/utils/api/integrations/integrationsApi"

// Separate dialog component to prevent parent re-renders
const ConnectDialog = React.memo(({ 
  type, 
  title, 
  instructions, 
  isOpen, 
  onClose,
  onConnect,
  connecting,
  credentials,
  onCredentialsChange
}: {
  type: string
  title: string
  instructions: React.ReactNode
  isOpen: boolean
  onClose: () => void
  onConnect: (type: string) => void
  connecting: boolean
  credentials: any
  onCredentialsChange: (field: string, value: string) => void
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect {title}</DialogTitle>
          <DialogDescription>
            Follow the instructions below to connect {title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Instructions</AlertTitle>
            <AlertDescription className="mt-2">
              {instructions}
            </AlertDescription>
          </Alert>

          {type === "google_sheets" && (
            <div className="space-y-2">
              <Label htmlFor="serviceAccountKey">Service Account JSON Key</Label>
              <Textarea
                id="serviceAccountKey"
                placeholder='Paste your Google Service Account JSON key here ({"type": "service_account", ...})'
                value={credentials.serviceAccountKey || ""}
                onChange={(e) => onCredentialsChange("serviceAccountKey", e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          )}

          {type === "facebook_lead_ads" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageId">Facebook Page ID</Label>
                <Input
                  id="pageId"
                  placeholder="Enter your Facebook Page ID"
                  value={credentials.pageId || ""}
                  onChange={(e) => onCredentialsChange("pageId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageAccessToken">Page Access Token</Label>
                <Input
                  id="pageAccessToken"
                  type="password"
                  placeholder="Enter your Facebook Page Access Token"
                  value={credentials.pageAccessToken || ""}
                  onChange={(e) => onCredentialsChange("pageAccessToken", e.target.value)}
                />
              </div>
            </div>
          )}

          {type === "indiamart" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-domain.com/api/webhook/indiamart"
                  value={credentials.webhookUrl || ""}
                  onChange={(e) => onCredentialsChange("webhookUrl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  placeholder="Enter webhook secret for verification"
                  value={credentials.webhookSecret || ""}
                  onChange={(e) => onCredentialsChange("webhookSecret", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={connecting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onConnect(type)}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

ConnectDialog.displayName = "ConnectDialog"

export default function IntegrationsSettings() {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loadingApiKey, setLoadingApiKey] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  
  // Form states - using separate state per dialog to prevent re-renders
  const [googleSheetsCredentials, setGoogleSheetsCredentials] = useState({ serviceAccountKey: "" })
  const [facebookLeadAdsCredentials, setFacebookLeadAdsCredentials] = useState({ pageId: "", pageAccessToken: "" })
  const [indiamartCredentials, setIndiamartCredentials] = useState({ webhookUrl: "", webhookSecret: "" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [apiKeyData, integrationsData] = await Promise.all([
        apiKeyApi.get().catch(() => ({ api_key: null })),
        integrationsApi.getAll().catch(() => ({ integrations: [], count: 0 }))
      ])
      setApiKey(apiKeyData.api_key)
      setIntegrations(integrationsData.integrations || [])
    } catch (error: any) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load integrations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateApiKey = async () => {
    try {
      setLoadingApiKey(true)
      const result = await apiKeyApi.generate()
      setApiKey(result.api_key)
      toast({
        title: "Success",
        description: "API key generated successfully. Make sure to copy it now!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate API key",
        variant: "destructive",
      })
    } finally {
      setLoadingApiKey(false)
    }
  }

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      })
    }
  }

  const getIntegrationStatus = useCallback((type: string) => {
    return integrations.find((i) => i.type === type)
  }, [integrations])

  const handleConnect = async (type: string) => {
    try {
      setConnecting(true)
      let credentials: any = {}
      let settings: any = {}

      if (type === "google_sheets") {
        if (!googleSheetsCredentials.serviceAccountKey) {
          toast({
            title: "Error",
            description: "Please provide Google Sheets service account key",
            variant: "destructive",
          })
          setConnecting(false)
          return
        }
        credentials = { serviceAccountKey: googleSheetsCredentials.serviceAccountKey }
      } else if (type === "facebook_lead_ads") {
        if (!facebookLeadAdsCredentials.pageId || !facebookLeadAdsCredentials.pageAccessToken) {
          toast({
            title: "Error",
            description: "Please provide Facebook Page ID and Access Token",
            variant: "destructive",
          })
          setConnecting(false)
          return
        }
        credentials = {
          pageId: facebookLeadAdsCredentials.pageId,
          pageAccessToken: facebookLeadAdsCredentials.pageAccessToken,
        }
      } else if (type === "indiamart") {
        if (!indiamartCredentials.webhookUrl) {
          toast({
            title: "Error",
            description: "Please provide IndiaMART webhook URL",
            variant: "destructive",
          })
          setConnecting(false)
          return
        }
        credentials = {
          webhookUrl: indiamartCredentials.webhookUrl,
          webhookSecret: indiamartCredentials.webhookSecret || "",
        }
      }

      await integrationsApi.connect({
        type: type as any,
        credentials,
        settings,
      })

      toast({
        title: "Success",
        description: `${getIntegrationName(type)} connected successfully!`,
      })
      
      setOpenDialog(null)
      // Reset form states
      setGoogleSheetsCredentials({ serviceAccountKey: "" })
      setFacebookLeadAdsCredentials({ pageId: "", pageAccessToken: "" })
      setIndiamartCredentials({ webhookUrl: "", webhookSecret: "" })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to connect ${getIntegrationName(type)}`,
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async (type: string) => {
    try {
      await integrationsApi.disconnect(type)
      toast({
        title: "Success",
        description: `${getIntegrationName(type)} disconnected successfully`,
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to disconnect ${getIntegrationName(type)}`,
        variant: "destructive",
      })
    }
  }

  const getIntegrationName = (type: string) => {
    const names: Record<string, string> = {
      google_sheets: "Google Sheets",
      facebook_lead_ads: "Facebook Lead Ads",
      indiamart: "IndiaMART Leads",
    }
    return names[type] || type
  }

  // Memoized credential change handlers
  const handleCredentialsChange = useCallback((type: string, field: string, value: string) => {
    if (type === "google_sheets") {
      setGoogleSheetsCredentials(prev => ({ ...prev, [field]: value }))
    } else if (type === "facebook_lead_ads") {
      setFacebookLeadAdsCredentials(prev => ({ ...prev, [field]: value }))
    } else if (type === "indiamart") {
      setIndiamartCredentials(prev => ({ ...prev, [field]: value }))
    }
  }, [])

  const handleDialogClose = useCallback((type: string) => {
    setOpenDialog(null)
    // Reset form when closing
    if (type === "google_sheets") setGoogleSheetsCredentials({ serviceAccountKey: "" })
    if (type === "facebook_lead_ads") setFacebookLeadAdsCredentials({ pageId: "", pageAccessToken: "" })
    if (type === "indiamart") setIndiamartCredentials({ webhookUrl: "", webhookSecret: "" })
  }, [])

  const handleDialogOpen = useCallback((type: string) => {
    setOpenDialog(type)
  }, [])

  // Get current credentials for dialog
  const getCurrentCredentials = useCallback((type: string) => {
    if (type === "google_sheets") return googleSheetsCredentials
    if (type === "facebook_lead_ads") return facebookLeadAdsCredentials
    if (type === "indiamart") return indiamartCredentials
    return {}
  }, [googleSheetsCredentials, facebookLeadAdsCredentials, indiamartCredentials])

  const IntegrationCard = React.memo(({ type, icon, title, description, instructions }: {
    type: string
    icon: React.ReactNode
    title: string
    description: string
    instructions: React.ReactNode
  }) => {
    const integration = getIntegrationStatus(type)
    const isConnected = integration?.isConnected || false
    const isDialogOpen = openDialog === type

    return (
      <>
        <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
              {isConnected ? (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Button variant="default" size="sm" onClick={() => handleDialogOpen(type)}>
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {!isConnected && (
          <ConnectDialog
            type={type}
            title={title}
            instructions={instructions}
            isOpen={isDialogOpen}
            onClose={() => handleDialogClose(type)}
            onConnect={handleConnect}
            connecting={connecting}
            credentials={getCurrentCredentials(type)}
            onCredentialsChange={(field, value) => handleCredentialsChange(type, field, value)}
          />
        )}
      </>
    )
  }, (prevProps, nextProps) => {
    // Only re-render if props actually change
    return (
      prevProps.type === nextProps.type &&
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description
    )
  })

  IntegrationCard.displayName = "IntegrationCard"

  return (
    <motion.div
      key="integrations"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeftRight className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
        </div>

        {/* API Key Section */}
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Key className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">API Key for External Automations</CardTitle>
                </div>
              </div>
            </div>
            <CardDescription className="mt-2">
              Generate a reusable key to authenticate Google Sheets or other trusted services. Creating a new key invalidates any previous key, so remember to update existing integrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {apiKey ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Your API Key</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          readOnly
                          className="font-mono text-sm pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" onClick={handleCopyApiKey}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    Generate a key to display and copy it here.
                  </p>
                )}
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleGenerateApiKey}
                disabled={loadingApiKey}
              >
                {loadingApiKey ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Generate API Key
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integration Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <IntegrationCard
                type="google_sheets"
                icon={
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 8H9v2h4v-2zm0-4H9v2h4V7zm4 8h-4v-2h4v2zm0-4h-4V7h4v4z"/>
                  </svg>
                }
                title="Google Sheets"
                description="Exchange data between chatbot and Google Sheets"
                instructions={
                  <div className="space-y-2 text-sm">
                    <p>To connect Google Sheets:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                      <li>Create a new project or select an existing one</li>
                      <li>Enable the Google Sheets API</li>
                      <li>Create a Service Account and download the JSON key</li>
                      <li>Paste the JSON key below</li>
                    </ol>
                  </div>
                }
              />

              <IntegrationCard
                type="facebook_lead_ads"
                icon={
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                }
                title="Facebook Lead Ads"
                description="Capture and manage leads from your Facebook instant forms"
                instructions={
                  <div className="space-y-2 text-sm">
                    <p>To connect Facebook Lead Ads:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Developers</a></li>
                      <li>Create or select your Facebook App</li>
                      <li>Add the "Lead Ads" product to your app</li>
                      <li>Get your Page ID from your Facebook Page settings</li>
                      <li>Generate a Page Access Token with <code className="bg-gray-100 px-1 rounded">leadgen</code> permission</li>
                      <li>Enter your Page ID and Access Token below</li>
                    </ol>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: The system will automatically subscribe to Lead Ads webhooks using Facebook Graph API.
                    </p>
                  </div>
                }
              />

              <IntegrationCard
                type="indiamart"
                icon={
                  <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                }
                title="IndiaMART Leads"
                description="Real-time lead delivery via webhook Push API"
                instructions={
                  <div className="space-y-2 text-sm">
                    <p>To connect IndiaMART Leads:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Log in to your IndiaMART seller account</li>
                      <li>Go to Settings → API Integration</li>
                      <li>Enable Webhook Push API</li>
                      <li>Enter the webhook URL provided below</li>
                      <li>Copy the webhook secret (if provided by IndiaMART)</li>
                      <li>Enter the details below</li>
                    </ol>
                    <Alert className="mt-2">
                      <AlertDescription className="text-xs">
                        <strong>Webhook URL:</strong> <code className="bg-gray-100 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/indiamart` : 'Your webhook URL'}</code>
                      </AlertDescription>
                    </Alert>
                  </div>
                }
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
