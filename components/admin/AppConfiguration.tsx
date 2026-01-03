"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { useToast } from "@/hooks/use-toast";

export default function AppConfiguration() {
  // Remove hardcoded defaults, initialize as empty object
  const [settings, setSettings] = useState<any>({})
  const { toast } = useToast();

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await serverHandler.get("/api/admin/get_web_public");
        const data = (res as any).data;
        if (data && data.data) {
          setSettings(data.data);
        }
      } catch (err) {
        toast({ title: "Error", description: "Error fetching settings", variant: "destructive" });
      }
    };
    fetchConfig();
    // eslint-disable-next-line
  }, []);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      // File upload for logo
      if (settings.logo instanceof File) {
        formData.append("file", settings.logo);
      } else if (typeof settings.logo === "string" && settings.logo) {
        formData.append("logo", settings.logo);
      }
      // Add all other fields from API response
      const fields = [
        "app_name", "custom_home", "is_custom_home", "meta_description", "currency_code", "currency_symbol", "chatbot_screen_tutorial", "broadcast_screen_tutorial", "home_page_tutorial", "login_header_footer", "exchange_rate", "google_client_id", "google_client_secret", "google_redirect_uri", "google_login_active", "rtl", "fb_login_app_id", "fb_login_app_sec", "fb_login_active", "facebook_client_id", "facebook_client_secret", "facebook_graph_version", "facebook_auth_scopes", "meta_webhook_verification_key", "instagram_client_id", "instagram_client_secret", "instagram_graph_version", "instagram_auth_scopes", "whatsapp_client_id", "whatsapp_client_secret", "whatsapp_graph_version", "whatsapp_config_id"
      ];
      fields.forEach((key) => {
        let val = settings[key];
        if (typeof val === "boolean") val = val ? 1 : 0;
        if (val !== undefined && val !== null) formData.append(key, val);
      });
      const res = await serverHandler.post("/api/web/update_web_config", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = (res as any).data;
      if (data && data.success) {
        toast({ title: "Success", description: data.msg || "Settings updated", variant: "default" });
      } else {
        toast({ title: "Error", description: data?.msg || "Update failed", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.msg || "Error updating settings", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-2xl mr-2">⚙️</span>
            App Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo">Logo</Label>
                <Input
                  id="logo"
                  value={settings.logo || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      logo: e.target.value,
                    })
                  }
                  placeholder="Logo URL"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.custom_home || false}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      custom_home: checked,
                    })
                  }
                />
                <Label>Allow custom home</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.login_header_footer || false}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      login_header_footer: checked,
                    })
                  }
                />
                <Label>Enable header footer on login</Label>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={settings.app_name || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      app_name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="currencyCode">Currency code</Label>
                <Input
                  id="currencyCode"
                  value={settings.currency_code || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      currency_code: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="currencySymbol">Currency symbol</Label>
                <Input
                  id="currencySymbol"
                  value={settings.currency_symbol || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      currency_symbol: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="exchangeRate">Exchange rate</Label>
                <Input
                  id="exchangeRate"
                  value={settings.exchange_rate || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      exchange_rate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={settings.meta_description || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      meta_description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="frontPageVideo">Front page video</Label>
                <Input
                  id="frontPageVideo"
                  value={settings.home_page_tutorial || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      home_page_tutorial: e.target.value,
                    })
                  }
                  placeholder="Video URL"
                />
              </div>

              <div>
                <Label htmlFor="chatboxScreenVideo">Chatbox screen video</Label>
                <Input
                  id="chatboxScreenVideo"
                  value={settings.chatbot_screen_tutorial || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatbot_screen_tutorial: e.target.value,
                    })
                  }
                  placeholder="Video URL"
                />
              </div>

              <div>
                <Label htmlFor="broadcastScreenVideo">Broadcast screen video</Label>
                <Input
                  id="broadcastScreenVideo"
                  value={settings.broadcast_screen_tutorial || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      broadcast_screen_tutorial: e.target.value,
                    })
                  }
                  placeholder="Video URL"
                />
              </div>
            </div>
          </div>

          {/* Webhook Configurations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Webhook configurations</h3>
            <div>
              <Label htmlFor="webhookToken">Webhook verification token</Label>
              <Input
                id="webhookToken"
                value={settings.meta_webhook_verification_key || settings.meta_webhook_verifcation_key || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    meta_webhook_verification_key: e.target.value,
                  })
                }
                placeholder="Verification token"
              />
            </div>
          </div>

          {/* Google Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Google settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="googleClientId">Client ID</Label>
                <Input
                  id="googleClientId"
                  value={settings.google_client_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      google_client_id: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="googleClientSecret">Client Secret</Label>
                <Input
                  id="googleClientSecret"
                  type="password"
                  value={settings.google_client_secret || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      google_client_secret: e.target.value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="googleRedirectUri">Redirect URI</Label>
                <Input
                  id="googleRedirectUri"
                  value={settings.google_redirect_uri || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      google_redirect_uri: e.target.value,
                    })
                  }
                  placeholder="e.g. http://localhost:5020/api/google/callback"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must match: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5020'}/api/google/callback
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.google_login_active === 1}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      google_login_active: checked ? 1 : 0,
                    })
                  }
                />
                <Label>Enable Google Login/Business</Label>
              </div>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">WhatsApp settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="whatsappWebhook">Webhook URI</Label>
                <Input
                  id="whatsappWebhook"
                  value={settings.whatsapp_webhook_uri || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_webhook_uri: e.target.value,
                    })
                  }
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="whatsappClientId">Client ID</Label>
                <Input
                  id="whatsappClientId"
                  value={settings.whatsapp_client_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_client_id: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="whatsappClientSecret">Client Secret</Label>
                <Input
                  id="whatsappClientSecret"
                  type="password"
                  value={settings.whatsapp_client_secret || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_client_secret: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="whatsappGraphVersion">Graph version</Label>
                <Input
                  id="whatsappGraphVersion"
                  value={settings.whatsapp_graph_version || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_graph_version: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="whatsappConfigId">Configuration ID</Label>
                <Input
                  id="whatsappConfigId"
                  value={settings.whatsapp_config_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_config_id: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Messenger Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Messenger settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="messengerWebhook">Webhook URI</Label>
                <Input
                  id="messengerWebhook"
                  value={settings.messenger_webhook_uri || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger_webhook_uri: e.target.value,
                    })
                  }
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="messengerClientId">Client ID</Label>
                <Input
                  id="messengerClientId"
                  value={settings.messenger_client_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger_client_id: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="messengerClientSecret">Client Secret</Label>
                <Input
                  id="messengerClientSecret"
                  type="password"
                  value={settings.messenger_client_secret || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger_client_secret: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="messengerGraphVersion">Graph version</Label>
                <Input
                  id="messengerGraphVersion"
                  value={settings.messenger_graph_version || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger_graph_version: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="messengerScopes">Scopes</Label>
                <Input
                  id="messengerScopes"
                  value={settings.messenger_scopes || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger_scopes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Instagram Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Instagram settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="instagramWebhook">Webhook URI</Label>
                <Input
                  id="instagramWebhook"
                  value={settings.instagram_webhook_uri || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram_webhook_uri: e.target.value,
                    })
                  }
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="instagramRedirect">Redirect address</Label>
                <Input
                  id="instagramRedirect"
                  value={settings.instagram_redirect_address || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram_redirect_address: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramClientId">Client ID</Label>
                <Input
                  id="instagramClientId"
                  value={settings.instagram_client_id || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram_client_id: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramClientSecret">Client Secret</Label>
                <Input
                  id="instagramClientSecret"
                  type="password"
                  value={settings.instagram_client_secret || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram_client_secret: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramGraphVersion">Graph version</Label>
                <Input
                  id="instagramGraphVersion"
                  value={settings.instagram_graph_version || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram_graph_version: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramScopes">Scopes</Label>
                <Input
                  id="instagramScopes"
                  value={settings.instagram_scopes || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram_scopes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="fas fa-save mr-2"></i>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">© All rights reserved</div>
    </div>
  )
}
