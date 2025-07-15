"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import serverHandler from "@/utils/serverHandler";
import { useToast } from "@/hooks/use-toast";

export default function AppConfiguration() {
  const [settings, setSettings] = useState({
    general: {
      logo: "",
      allowCustomHome: false,
      enableHeaderFooter: true,
      name: "MBG",
      currencyCode: "PKR",
      currencySymbol: "₨",
      exchangeRate: "1.0",
      seoDescription: "Business Automation Platform",
      frontPageVideo: "",
      chatboxScreenVideo: "",
      broadcastScreenVideo: "",
    },
    webhook: {
      verificationToken: "",
    },
    whatsapp: {
      webhookUri: "http://localhost:3002/api/whatsapp/webhook",
      clientId: "",
      clientSecret: "",
      graphVersion: "v18.0",
      configurationId: "",
    },
    messenger: {
      webhookUri: "http://localhost:3002/api/messanger/webhook",
      clientId: "",
      clientSecret: "",
      graphVersion: "v18.0",
      scopes: "pages_messaging",
    },
    instagram: {
      webhookUri: "http://localhost:3002/api/instagram/webhook",
      redirectAddress: "",
      clientId: "",
      clientSecret: "",
      graphVersion: "v18.0",
      scopes: "instagram_basic,instagram_manage_messages",
    },
  });
  const { toast } = useToast();

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await serverHandler.get("/api/admin/get_web_public");
        if (res.data && res.data.data) {
          const d = res.data.data;
          setSettings({
            general: {
              logo: d.logo || "",
              allowCustomHome: d.allow_custom_home === 1,
              enableHeaderFooter: d.enable_header_footer === 1,
              name: d.app_name || "",
              currencyCode: d.currency_code || "",
              currencySymbol: d.currency_symbol || "",
              exchangeRate: d.exchange_rate || "",
              seoDescription: d.seo_description || "",
              frontPageVideo: d.front_page_video || "",
              chatboxScreenVideo: d.chatbox_screen_video || "",
              broadcastScreenVideo: d.broadcast_screen_video || "",
            },
            webhook: {
              verificationToken: d.webhook_verification_token || "",
            },
            whatsapp: {
              webhookUri: d.whatsapp_webhook_uri || "http://localhost:3002/api/whatsapp/webhook",
              clientId: d.whatsapp_client_id || "",
              clientSecret: d.whatsapp_client_secret || "",
              graphVersion: d.whatsapp_graph_version || "v18.0",
              configurationId: d.whatsapp_configuration_id || "",
            },
            messenger: {
              webhookUri: d.messenger_webhook_uri || "http://localhost:3002/api/messanger/webhook",
              clientId: d.messenger_client_id || "",
              clientSecret: d.messenger_client_secret || "",
              graphVersion: d.messenger_graph_version || "v18.0",
              scopes: d.messenger_scopes || "pages_messaging",
            },
            instagram: {
              webhookUri: d.instagram_webhook_uri || "http://localhost:3002/api/instagram/webhook",
              redirectAddress: d.instagram_redirect_address || "",
              clientId: d.instagram_client_id || "",
              clientSecret: d.instagram_client_secret || "",
              graphVersion: d.instagram_graph_version || "v18.0",
              scopes: d.instagram_scopes || "instagram_basic,instagram_manage_messages",
            },
          });
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
      // General
      formData.append("logo", settings.general.logo);
      formData.append("app_name", settings.general.name);
      formData.append("currency_code", settings.general.currencyCode);
      formData.append("currency_symbol", settings.general.currencySymbol);
      formData.append("exchange_rate", settings.general.exchangeRate);
      formData.append("seo_description", settings.general.seoDescription);
      formData.append("front_page_video", settings.general.frontPageVideo);
      formData.append("chatbox_screen_video", settings.general.chatboxScreenVideo);
      formData.append("broadcast_screen_video", settings.general.broadcastScreenVideo);
      formData.append("allow_custom_home", settings.general.allowCustomHome ? "1" : "0");
      formData.append("enable_header_footer", settings.general.enableHeaderFooter ? "1" : "0");
      // Webhook
      formData.append("webhook_verification_token", settings.webhook.verificationToken);
      // WhatsApp
      formData.append("whatsapp_webhook_uri", settings.whatsapp.webhookUri);
      formData.append("whatsapp_client_id", settings.whatsapp.clientId);
      formData.append("whatsapp_client_secret", settings.whatsapp.clientSecret);
      formData.append("whatsapp_graph_version", settings.whatsapp.graphVersion);
      formData.append("whatsapp_configuration_id", settings.whatsapp.configurationId);
      // Messenger
      formData.append("messenger_webhook_uri", settings.messenger.webhookUri);
      formData.append("messenger_client_id", settings.messenger.clientId);
      formData.append("messenger_client_secret", settings.messenger.clientSecret);
      formData.append("messenger_graph_version", settings.messenger.graphVersion);
      formData.append("messenger_scopes", settings.messenger.scopes);
      // Instagram
      formData.append("instagram_webhook_uri", settings.instagram.webhookUri);
      formData.append("instagram_redirect_address", settings.instagram.redirectAddress);
      formData.append("instagram_client_id", settings.instagram.clientId);
      formData.append("instagram_client_secret", settings.instagram.clientSecret);
      formData.append("instagram_graph_version", settings.instagram.graphVersion);
      formData.append("instagram_scopes", settings.instagram.scopes);
      // Send to backend
      const res = await serverHandler.post("/api/web/update_web_config", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data?.success) {
        toast({ title: "Success", description: res?.data?.msg || "Settings updated", variant: "success" });
      } else {
        toast({ title: "Error", description: res?.data?.msg || "Update failed", variant: "destructive" });
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
                  value={settings.general.logo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, logo: e.target.value },
                    })
                  }
                  placeholder="Logo URL"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.general.allowCustomHome}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, allowCustomHome: checked },
                    })
                  }
                />
                <Label>Allow custom home</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.general.enableHeaderFooter}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, enableHeaderFooter: checked },
                    })
                  }
                />
                <Label>Enable header footer on login</Label>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={settings.general.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, name: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="currencyCode">Currency code</Label>
                <Input
                  id="currencyCode"
                  value={settings.general.currencyCode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, currencyCode: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="currencySymbol">Currency symbol</Label>
                <Input
                  id="currencySymbol"
                  value={settings.general.currencySymbol}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, currencySymbol: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="exchangeRate">Exchange rate</Label>
                <Input
                  id="exchangeRate"
                  value={settings.general.exchangeRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, exchangeRate: e.target.value },
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={settings.general.seoDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, seoDescription: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="frontPageVideo">Front page video</Label>
                <Input
                  id="frontPageVideo"
                  value={settings.general.frontPageVideo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, frontPageVideo: e.target.value },
                    })
                  }
                  placeholder="Video URL"
                />
              </div>

              <div>
                <Label htmlFor="chatboxScreenVideo">Chatbox screen video</Label>
                <Input
                  id="chatboxScreenVideo"
                  value={settings.general.chatboxScreenVideo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, chatboxScreenVideo: e.target.value },
                    })
                  }
                  placeholder="Video URL"
                />
              </div>

              <div>
                <Label htmlFor="broadcastScreenVideo">Broadcast screen video</Label>
                <Input
                  id="broadcastScreenVideo"
                  value={settings.general.broadcastScreenVideo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, broadcastScreenVideo: e.target.value },
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
                value={settings.webhook.verificationToken}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    webhook: { ...settings.webhook, verificationToken: e.target.value },
                  })
                }
                placeholder="Verification token"
              />
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
                  value={settings.whatsapp.webhookUri}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp: { ...settings.whatsapp, webhookUri: e.target.value },
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
                  value={settings.whatsapp.clientId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp: { ...settings.whatsapp, clientId: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="whatsappClientSecret">Client Secret</Label>
                <Input
                  id="whatsappClientSecret"
                  type="password"
                  value={settings.whatsapp.clientSecret}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp: { ...settings.whatsapp, clientSecret: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="whatsappGraphVersion">Graph version</Label>
                <Input
                  id="whatsappGraphVersion"
                  value={settings.whatsapp.graphVersion}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp: { ...settings.whatsapp, graphVersion: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="whatsappConfigId">Configuration ID</Label>
                <Input
                  id="whatsappConfigId"
                  value={settings.whatsapp.configurationId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp: { ...settings.whatsapp, configurationId: e.target.value },
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
                  value={settings.messenger.webhookUri}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger: { ...settings.messenger, webhookUri: e.target.value },
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
                  value={settings.messenger.clientId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger: { ...settings.messenger, clientId: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="messengerClientSecret">Client Secret</Label>
                <Input
                  id="messengerClientSecret"
                  type="password"
                  value={settings.messenger.clientSecret}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger: { ...settings.messenger, clientSecret: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="messengerGraphVersion">Graph version</Label>
                <Input
                  id="messengerGraphVersion"
                  value={settings.messenger.graphVersion}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger: { ...settings.messenger, graphVersion: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="messengerScopes">Scopes</Label>
                <Input
                  id="messengerScopes"
                  value={settings.messenger.scopes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      messenger: { ...settings.messenger, scopes: e.target.value },
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
                  value={settings.instagram.webhookUri}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, webhookUri: e.target.value },
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
                  value={settings.instagram.redirectAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, redirectAddress: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramClientId">Client ID</Label>
                <Input
                  id="instagramClientId"
                  value={settings.instagram.clientId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, clientId: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramClientSecret">Client Secret</Label>
                <Input
                  id="instagramClientSecret"
                  type="password"
                  value={settings.instagram.clientSecret}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, clientSecret: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramGraphVersion">Graph version</Label>
                <Input
                  id="instagramGraphVersion"
                  value={settings.instagram.graphVersion}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, graphVersion: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instagramScopes">Scopes</Label>
                <Input
                  id="instagramScopes"
                  value={settings.instagram.scopes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagram: { ...settings.instagram, scopes: e.target.value },
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
