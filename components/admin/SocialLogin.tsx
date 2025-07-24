"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Eye, EyeOff, CheckCircle, AlertCircle, Globe, MessageSquare, Camera, Phone } from "lucide-react"
import serverHandler from "@/utils/serverHandler"
import { useToast } from "@/hooks/use-toast"

interface SocialLoginSettings {
  google_client_id: string
  google_login_active: number
  fb_login_app_id: string
  fb_login_app_sec: string
  fb_login_active: number
  facebook_client_id: string
  facebook_client_secret: string
  facebook_graph_version: string
  facebook_auth_scopes: string
  meta_webhook_verifcation_key: string
  instagram_client_id: string
  instagram_client_secret: string
  instagram_graph_version: string
  instagram_auth_scopes: string
  whatsapp_client_id: string
  whatsapp_client_secret: string
  whatsapp_graph_version: string
  whatsapp_config_id: string
}

export default function SocialLoginAdmin() {
  const [settings, setSettings] = useState<SocialLoginSettings>({
    google_client_id: "",
    google_login_active: 0,
    fb_login_app_id: "",
    fb_login_app_sec: "",
    fb_login_active: 0,
    facebook_client_id: "",
    facebook_client_secret: "",
    facebook_graph_version: "",
    facebook_auth_scopes: "",
    meta_webhook_verifcation_key: "",
    instagram_client_id: "",
    instagram_client_secret: "",
    instagram_graph_version: "",
    instagram_auth_scopes: "",
    whatsapp_client_id: "",
    whatsapp_client_secret: "",
    whatsapp_graph_version: "",
    whatsapp_config_id: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await serverHandler.get("/api/admin/get_social_login")
      if (res.data.success) {
        const data = res.data.data
        setSettings({
          google_client_id: data.google_client_id || "",
          google_login_active: data.google_login_active || 0,
          fb_login_app_id: data.fb_login_app_id || "",
          fb_login_app_sec: data.fb_login_app_sec || "",
          fb_login_active: data.fb_login_active || 0,
          facebook_client_id: data.facebook_client_id || "",
          facebook_client_secret: data.facebook_client_secret || "",
          facebook_graph_version: data.facebook_graph_version || "",
          facebook_auth_scopes: data.facebook_auth_scopes || "",
          meta_webhook_verifcation_key: data.meta_webhook_verifcation_key || "",
          instagram_client_id: data.instagram_client_id || "",
          instagram_client_secret: data.instagram_client_secret || "",
          instagram_graph_version: data.instagram_graph_version || "",
          instagram_auth_scopes: data.instagram_auth_scopes || "",
          whatsapp_client_id: data.whatsapp_client_id || "",
          whatsapp_client_secret: data.whatsapp_client_secret || "",
          whatsapp_graph_version: data.whatsapp_graph_version || "",
          whatsapp_config_id: data.whatsapp_config_id || "",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      setSaving(true)
      const res = await serverHandler.post("/api/admin/update_social_login", settings)
      if (res.data.success) {
        toast({
          title: "Success",
          description: res.data.msg || "Settings updated successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        throw new Error(res.data.msg || "Update failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.msg || error.message || "Update failed",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SocialLoginSettings, value: string | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const getStatusBadge = (isActive: number) => {
    return isActive === 1 ? (
      <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 rounded-full">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Social Login Configuration</h1>
          <p className="text-slate-600 mt-1">Configure social authentication providers for your application</p>
        </div>
        <Button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="google" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          <TabsTrigger
            value="google"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
          >
            <Globe className="w-4 h-4" />
            Google
          </TabsTrigger>
          <TabsTrigger
            value="facebook"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
          >
            <MessageSquare className="w-4 h-4" />
            Facebook
          </TabsTrigger>
          <TabsTrigger
            value="instagram"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
          >
            <Camera className="w-4 h-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger
            value="whatsapp"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
          >
            <Phone className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Google Configuration */}
        <TabsContent value="google">
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <svg width="28" height="28" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Google OAuth</CardTitle>
                    <p className="text-sm text-slate-600">Configure Google Sign-In for your application</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(settings.google_login_active)}
                  <Switch
                    checked={settings.google_login_active === 1}
                    onCheckedChange={(checked) => updateSetting("google_login_active", checked ? 1 : 0)}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="google-client-id" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Client ID
                </Label>
                <Input
                  id="google-client-id"
                  value={settings.google_client_id}
                  onChange={(e) => updateSetting("google_client_id", e.target.value)}
                  placeholder="Enter Google Client ID"
                  className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                />
              </div>
              <Alert className="rounded-xl border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Get your Google Client ID from the{" "}
                  <a
                    href="https://console.developers.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Google Cloud Console
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facebook Configuration */}
        <TabsContent value="facebook">
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Facebook Login</CardTitle>
                    <p className="text-sm text-slate-600">Configure Facebook authentication and Meta services</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(settings.fb_login_active)}
                  <Switch
                    checked={settings.fb_login_active === 1}
                    onCheckedChange={(checked) => updateSetting("fb_login_active", checked ? 1 : 0)}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fb-app-id" className="text-sm font-semibold text-slate-700 mb-2 block">
                    App ID
                  </Label>
                  <Input
                    id="fb-app-id"
                    value={settings.fb_login_app_id}
                    onChange={(e) => updateSetting("fb_login_app_id", e.target.value)}
                    placeholder="Facebook App ID"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="fb-app-secret" className="text-sm font-semibold text-slate-700 mb-2 block">
                    App Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="fb-app-secret"
                      type={showSecrets.fb_secret ? "text" : "password"}
                      value={settings.fb_login_app_sec}
                      onChange={(e) => updateSetting("fb_login_app_sec", e.target.value)}
                      placeholder="Facebook App Secret"
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                      onClick={() => toggleSecret("fb_secret")}
                    >
                      {showSecrets.fb_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-slate-900">Advanced Facebook Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fb-client-id" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Client ID (Alternative)
                    </Label>
                    <Input
                      id="fb-client-id"
                      value={settings.facebook_client_id}
                      onChange={(e) => updateSetting("facebook_client_id", e.target.value)}
                      placeholder="Facebook Client ID"
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fb-client-secret" className="text-sm font-semibold text-slate-700 mb-2 block">
                      Client Secret (Alternative)
                    </Label>
                    <div className="relative">
                      <Input
                        id="fb-client-secret"
                        type={showSecrets.fb_client_secret ? "text" : "password"}
                        value={settings.facebook_client_secret}
                        onChange={(e) => updateSetting("facebook_client_secret", e.target.value)}
                        placeholder="Facebook Client Secret"
                        className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                        onClick={() => toggleSecret("fb_client_secret")}
                      >
                        {showSecrets.fb_client_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fb-graph-version" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Graph API Version
                  </Label>
                  <Input
                    id="fb-graph-version"
                    value={settings.facebook_graph_version}
                    onChange={(e) => updateSetting("facebook_graph_version", e.target.value)}
                    placeholder="v18.0"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="fb-auth-scopes" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Authentication Scopes
                  </Label>
                  <Textarea
                    id="fb-auth-scopes"
                    value={settings.facebook_auth_scopes}
                    onChange={(e) => updateSetting("facebook_auth_scopes", e.target.value)}
                    placeholder="email,public_profile,pages_show_list,pages_read_engagement"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px]"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="meta-webhook-key" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Meta Webhook Verification Key
                  </Label>
                  <Input
                    id="meta-webhook-key"
                    value={settings.meta_webhook_verifcation_key}
                    onChange={(e) => updateSetting("meta_webhook_verifcation_key", e.target.value)}
                    placeholder="Webhook verification key"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
              </div>

              <Alert className="rounded-xl border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Configure your Facebook app at{" "}
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Facebook for Developers
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Configuration */}
        <TabsContent value="instagram">
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <defs>
                        <radialGradient id="instagram-gradient" cx="0.5" cy="1" r="1">
                          <stop offset="0%" stopColor="#fdf497" />
                          <stop offset="5%" stopColor="#fdf497" />
                          <stop offset="45%" stopColor="#fd5949" />
                          <stop offset="60%" stopColor="#d6249f" />
                          <stop offset="90%" stopColor="#285AEB" />
                        </radialGradient>
                      </defs>
                      <rect width="24" height="24" rx="5.5" fill="url(#instagram-gradient)" />
                      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="none" stroke="white" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5" />
                      <circle cx="17.5" cy="6.5" r="1.25" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Instagram Integration</CardTitle>
                    <p className="text-sm text-slate-600">Configure Instagram Basic Display API</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(settings.instagram_client_id ? 1 : 0)}
                  <Switch
                    checked={!!settings.instagram_client_id}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        updateSetting("instagram_client_id", "")
                        updateSetting("instagram_client_secret", "")
                      }
                    }}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ig-client-id" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Client ID
                  </Label>
                  <Input
                    id="ig-client-id"
                    value={settings.instagram_client_id}
                    onChange={(e) => updateSetting("instagram_client_id", e.target.value)}
                    placeholder="Instagram Client ID"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="ig-client-secret" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Client Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="ig-client-secret"
                      type={showSecrets.ig_secret ? "text" : "password"}
                      value={settings.instagram_client_secret}
                      onChange={(e) => updateSetting("instagram_client_secret", e.target.value)}
                      placeholder="Instagram Client Secret"
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                      onClick={() => toggleSecret("ig_secret")}
                    >
                      {showSecrets.ig_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="ig-graph-version" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Graph API Version
                </Label>
                <Input
                  id="ig-graph-version"
                  value={settings.instagram_graph_version}
                  onChange={(e) => updateSetting("instagram_graph_version", e.target.value)}
                  placeholder="v18.0"
                  className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                />
              </div>
              <div>
                <Label htmlFor="ig-auth-scopes" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Authentication Scopes
                </Label>
                <Textarea
                  id="ig-auth-scopes"
                  value={settings.instagram_auth_scopes}
                  onChange={(e) => updateSetting("instagram_auth_scopes", e.target.value)}
                  placeholder="user_profile,user_media"
                  className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px]"
                  rows={3}
                />
              </div>
              <Alert className="rounded-xl border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Set up Instagram Basic Display at{" "}
                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Facebook for Developers
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Configuration */}
        <TabsContent value="whatsapp">
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">WhatsApp Business</CardTitle>
                    <p className="text-sm text-slate-600">Configure WhatsApp Business API integration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(settings.whatsapp_client_id ? 1 : 0)}
                  <Switch
                    checked={!!settings.whatsapp_client_id}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        updateSetting("whatsapp_client_id", "")
                        updateSetting("whatsapp_client_secret", "")
                        updateSetting("whatsapp_config_id", "")
                      }
                    }}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="wa-client-id" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Client ID
                  </Label>
                  <Input
                    id="wa-client-id"
                    value={settings.whatsapp_client_id}
                    onChange={(e) => updateSetting("whatsapp_client_id", e.target.value)}
                    placeholder="WhatsApp Client ID"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="wa-client-secret" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Client Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="wa-client-secret"
                      type={showSecrets.wa_secret ? "text" : "password"}
                      value={settings.whatsapp_client_secret}
                      onChange={(e) => updateSetting("whatsapp_client_secret", e.target.value)}
                      placeholder="WhatsApp Client Secret"
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                      onClick={() => toggleSecret("wa_secret")}
                    >
                      {showSecrets.wa_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="wa-graph-version" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Graph API Version
                  </Label>
                  <Input
                    id="wa-graph-version"
                    value={settings.whatsapp_graph_version}
                    onChange={(e) => updateSetting("whatsapp_graph_version", e.target.value)}
                    placeholder="v18.0"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="wa-config-id" className="text-sm font-semibold text-slate-700 mb-2 block">
                    Configuration ID
                  </Label>
                  <Input
                    id="wa-config-id"
                    value={settings.whatsapp_config_id}
                    onChange={(e) => updateSetting("whatsapp_config_id", e.target.value)}
                    placeholder="WhatsApp Configuration ID"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
              </div>
              <Alert className="rounded-xl border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Configure WhatsApp Business API at{" "}
                  <a
                    href="https://business.whatsapp.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    WhatsApp Business
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
