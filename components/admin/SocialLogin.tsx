"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Globe,
  MessageSquare,
  Camera,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  GoogleLoginSettings,
  MetaPlatformsSettings,
} from "@/utils/api/admin/types";
import { socialLoginApi } from "@/utils/api/admin/socialLogin";

export default function SocialLoginAdmin() {
  const [settings, setSettings] = useState<GoogleLoginSettings>({
    google_client_id: "",
    google_login_active: 0,
  });

  const [metaSettings, setMetaSettings] = useState<MetaPlatformsSettings>({
    // Meta platform fields
    fb_login_app_id: "",
    fb_login_app_sec: "",
    fb_login_active: 0,
    facebook_client_id: "",
    facebook_client_secret: "",
    facebook_graph_version: "",
    facebook_auth_scopes: "",
    meta_webhook_verification_key: "",
    instagram_client_id: "",
    instagram_client_secret: "",
    instagram_graph_version: "",
    instagram_auth_scopes: "",
    whatsapp_client_id: "",
    whatsapp_client_secret: "",
    whatsapp_graph_version: "",
    whatsapp_config_id: "",

    // App configuration fields
    id: 0,
    currency_code: "",
    logo: "",
    app_name: "",
    custom_home: "",
    is_custom_home: 0,
    meta_description: "",
    currency_symbol: "",
    chatbot_screen_tutorial: "",
    broadcast_screen_tutorial: "",
    home_page_tutorial: "",
    login_header_footer: 0,
    exchange_rate: "",
    rtl: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await socialLoginApi.getSocialLoginSettings();
      if (res.success) {
        const data = res.data as any;
        setSettings({
          google_client_id: data.google_client_id || "",
          google_login_active: data.google_login_active || 0,
        });

        setMetaSettings({
          // Meta platform fields
          fb_login_app_id: data.fb_login_app_id || "",
          fb_login_app_sec: data.fb_login_app_sec || "",
          fb_login_active: data.fb_login_active || 0,
          facebook_client_id: data.facebook_client_id || "",
          facebook_client_secret: data.facebook_client_secret || "",
          facebook_graph_version: data.facebook_graph_version || "",
          facebook_auth_scopes: data.facebook_auth_scopes || "",
          meta_webhook_verification_key:
            data.meta_webhook_verification_key || "",
          instagram_client_id: data.instagram_client_id || "",
          instagram_client_secret: data.instagram_client_secret || "",
          instagram_graph_version: data.instagram_graph_version || "",
          instagram_auth_scopes: data.instagram_auth_scopes || "",
          whatsapp_client_id: data.whatsapp_client_id || "",
          whatsapp_client_secret: data.whatsapp_client_secret || "",
          whatsapp_graph_version: data.whatsapp_graph_version || "",
          whatsapp_config_id: data.whatsapp_config_id || "",

          // App configuration fields
          id: data.id || 0,
          currency_code: data.currency_code || "",
          logo: data.logo || "",
          app_name: data.app_name || "",
          custom_home: data.custom_home || "",
          is_custom_home: data.is_custom_home || 0,
          meta_description: data.meta_description || "",
          currency_symbol: data.currency_symbol || "",
          chatbot_screen_tutorial: data.chatbot_screen_tutorial || "",
          broadcast_screen_tutorial: data.broadcast_screen_tutorial || "",
          home_page_tutorial: data.home_page_tutorial || "",
          login_header_footer: data.login_header_footer || 0,
          exchange_rate: data.exchange_rate || "",
          rtl: data.rtl || 0,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoogle = async () => {
    try {
      setSaving(true);
      const res = await socialLoginApi.updateGoogleLogin(settings);
      if (res.success) {
        toast({
          title: "Success",
          description: res.msg || "Google settings updated successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        throw new Error(res.msg || "Google update failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Google update failed",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMeta = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("fb_login_app_id", metaSettings.fb_login_app_id);
      formData.append("fb_login_app_sec", metaSettings.fb_login_app_sec);
      formData.append(
        "fb_login_active",
        metaSettings.fb_login_active.toString()
      );
      formData.append("facebook_client_id", metaSettings.facebook_client_id);
      formData.append(
        "facebook_client_secret",
        metaSettings.facebook_client_secret
      );
      formData.append(
        "facebook_graph_version",
        metaSettings.facebook_graph_version
      );
      formData.append(
        "facebook_auth_scopes",
        metaSettings.facebook_auth_scopes
      );
      formData.append(
        "meta_webhook_verification_key",
        metaSettings.meta_webhook_verification_key
      );
      formData.append("instagram_client_id", metaSettings.instagram_client_id);
      formData.append(
        "instagram_client_secret",
        metaSettings.instagram_client_secret
      );
      formData.append(
        "instagram_graph_version",
        metaSettings.instagram_graph_version
      );
      formData.append(
        "instagram_auth_scopes",
        metaSettings.instagram_auth_scopes
      );
      formData.append("whatsapp_client_id", metaSettings.whatsapp_client_id);
      formData.append(
        "whatsapp_client_secret",
        metaSettings.whatsapp_client_secret
      );
      formData.append(
        "whatsapp_graph_version",
        metaSettings.whatsapp_graph_version
      );
      formData.append("whatsapp_config_id", metaSettings.whatsapp_config_id);
      formData.append("id", metaSettings.id.toString());
      formData.append("currency_code", metaSettings.currency_code);
      formData.append("logo", metaSettings.logo);
      formData.append("app_name", metaSettings.app_name);
      formData.append("custom_home", metaSettings.custom_home);
      formData.append("is_custom_home", metaSettings.is_custom_home.toString());
      formData.append("meta_description", metaSettings.meta_description);
      formData.append("currency_symbol", metaSettings.currency_symbol);
      formData.append(
        "chatbot_screen_tutorial",
        metaSettings.chatbot_screen_tutorial
      );
      formData.append(
        "broadcast_screen_tutorial",
        metaSettings.broadcast_screen_tutorial
      );
      formData.append("home_page_tutorial", metaSettings.home_page_tutorial);
      formData.append(
        "login_header_footer",
        metaSettings.login_header_footer.toString()
      );
      formData.append("exchange_rate", metaSettings.exchange_rate);
      formData.append("rtl", metaSettings.rtl.toString());

      const res = await socialLoginApi.updateMetaPlatforms(formData);
      if (res.success) {
        toast({
          title: "Success",
          description:
            res.msg || "Meta platforms and app config updated successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        throw new Error(res.msg || "Meta platforms update failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Meta platforms update failed",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (
    key: keyof GoogleLoginSettings,
    value: string | number
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateMetaSetting = (
    key: keyof MetaPlatformsSettings,
    value: string | number
  ) => {
    setMetaSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getStatusBadge = (isActive: number) => {
    return isActive === 1 ? (
      <Badge
        variant="default"
        className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-slate-100 text-slate-600 border-slate-200 rounded-full"
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Social Login Configuration
          </h1>
          <p className="text-slate-600 mt-1">
            Configure social authentication providers for your application
          </p>
        </div>
      </div>

      <Tabs defaultValue="app-config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          <TabsTrigger
            value="app-config"
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
          >
            <Globe className="w-4 h-4" />
            App Config
          </TabsTrigger>
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
                    <CardTitle className="text-xl text-slate-900">
                      Google OAuth
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Configure Google Sign-In for your application
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(settings.google_login_active)}
                  <Switch
                    checked={settings.google_login_active === 1}
                    onCheckedChange={(checked) =>
                      updateSetting("google_login_active", checked ? 1 : 0)
                    }
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label
                  htmlFor="google-client-id"
                  className="text-sm font-semibold text-slate-700 mb-2 block"
                >
                  Client ID
                </Label>
                <Input
                  id="google-client-id"
                  value={settings.google_client_id}
                  onChange={(e) =>
                    updateSetting("google_client_id", e.target.value)
                  }
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

              {/* Google Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  onClick={handleUpdateGoogle}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Google...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Google
                    </>
                  )}
                </Button>
              </div>
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
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="#1877F2"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      Facebook Login
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Configure Facebook authentication and Meta services
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(metaSettings.fb_login_active)}
                  <Switch
                    checked={metaSettings.fb_login_active === 1}
                    onCheckedChange={(checked) =>
                      updateMetaSetting("fb_login_active", checked ? 1 : 0)
                    }
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="fb-app-id"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    App ID
                  </Label>
                  <Input
                    id="fb-app-id"
                    value={metaSettings.fb_login_app_id}
                    onChange={(e) =>
                      updateMetaSetting("fb_login_app_id", e.target.value)
                    }
                    placeholder="Facebook App ID"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="fb-app-secret"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    App Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="fb-app-secret"
                      type={showSecrets.fb_secret ? "text" : "password"}
                      value={metaSettings.fb_login_app_sec}
                      onChange={(e) =>
                        updateMetaSetting("fb_login_app_sec", e.target.value)
                      }
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
                      {showSecrets.fb_secret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-slate-900">
                  Advanced Facebook Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="fb-client-id"
                      className="text-sm font-semibold text-slate-700 mb-2 block"
                    >
                      Client ID (Alternative)
                    </Label>
                    <Input
                      id="fb-client-id"
                      value={metaSettings.facebook_client_id}
                      onChange={(e) =>
                        updateMetaSetting("facebook_client_id", e.target.value)
                      }
                      placeholder="Facebook Client ID"
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="fb-client-secret"
                      className="text-sm font-semibold text-slate-700 mb-2 block"
                    >
                      Client Secret (Alternative)
                    </Label>
                    <div className="relative">
                      <Input
                        id="fb-client-secret"
                        type={
                          showSecrets.fb_client_secret ? "text" : "password"
                        }
                        value={metaSettings.facebook_client_secret}
                        onChange={(e) =>
                          updateMetaSetting(
                            "facebook_client_secret",
                            e.target.value
                          )
                        }
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
                        {showSecrets.fb_client_secret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="fb-graph-version"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Graph API Version
                  </Label>
                  <Input
                    id="fb-graph-version"
                    value={metaSettings.facebook_graph_version}
                    onChange={(e) =>
                      updateMetaSetting(
                        "facebook_graph_version",
                        e.target.value
                      )
                    }
                    placeholder="v18.0"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="fb-auth-scopes"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Authentication Scopes
                  </Label>
                  <Textarea
                    id="fb-auth-scopes"
                    value={metaSettings.facebook_auth_scopes}
                    onChange={(e) =>
                      updateMetaSetting("facebook_auth_scopes", e.target.value)
                    }
                    placeholder="email,public_profile,pages_show_list,pages_read_engagement"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px]"
                    rows={3}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="meta-webhook-key"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Meta Webhook Verification Key
                  </Label>
                  <Input
                    id="meta-webhook-key"
                    value={metaSettings.meta_webhook_verification_key}
                    onChange={(e) =>
                      updateMetaSetting(
                        "meta_webhook_verification_key",
                        e.target.value
                      )
                    }
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

              {/* Facebook Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  onClick={handleUpdateMeta}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Facebook...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Facebook
                    </>
                  )}
                </Button>
              </div>
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
                        <radialGradient
                          id="instagram-gradient"
                          cx="0.5"
                          cy="1"
                          r="1"
                        >
                          <stop offset="0%" stopColor="#fdf497" />
                          <stop offset="5%" stopColor="#fdf497" />
                          <stop offset="45%" stopColor="#fd5949" />
                          <stop offset="60%" stopColor="#d6249f" />
                          <stop offset="90%" stopColor="#285AEB" />
                        </radialGradient>
                      </defs>
                      <rect
                        width="24"
                        height="24"
                        rx="5.5"
                        fill="url(#instagram-gradient)"
                      />
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="3.5"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="4"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      <circle cx="17.5" cy="6.5" r="1.25" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      Instagram Integration
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Configure Instagram Basic Display API
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(metaSettings.instagram_client_id ? 1 : 0)}
                  <Switch
                    checked={!!metaSettings.instagram_client_id}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        updateMetaSetting("instagram_client_id", "");
                        updateMetaSetting("instagram_client_secret", "");
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
                  <Label
                    htmlFor="ig-client-id"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Client ID
                  </Label>
                  <Input
                    id="ig-client-id"
                    value={metaSettings.instagram_client_id}
                    onChange={(e) =>
                      updateMetaSetting("instagram_client_id", e.target.value)
                    }
                    placeholder="Instagram Client ID"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="ig-client-secret"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Client Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="ig-client-secret"
                      type={showSecrets.ig_secret ? "text" : "password"}
                      value={metaSettings.instagram_client_secret}
                      onChange={(e) =>
                        updateMetaSetting(
                          "instagram_client_secret",
                          e.target.value
                        )
                      }
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
                      {showSecrets.ig_secret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="ig-graph-version"
                  className="text-sm font-semibold text-slate-700 mb-2 block"
                >
                  Graph API Version
                </Label>
                <Input
                  id="ig-graph-version"
                  value={metaSettings.instagram_graph_version}
                  onChange={(e) =>
                    updateMetaSetting("instagram_graph_version", e.target.value)
                  }
                  placeholder="v18.0"
                  className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                />
              </div>
              <div>
                <Label
                  htmlFor="ig-auth-scopes"
                  className="text-sm font-semibold text-slate-700 mb-2 block"
                >
                  Authentication Scopes
                </Label>
                <Textarea
                  id="ig-auth-scopes"
                  value={metaSettings.instagram_auth_scopes}
                  onChange={(e) =>
                    updateMetaSetting("instagram_auth_scopes", e.target.value)
                  }
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

              {/* Instagram Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  onClick={handleUpdateMeta}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Instagram...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Instagram
                    </>
                  )}
                </Button>
              </div>
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
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="#25D366"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      WhatsApp Business
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Configure WhatsApp Business API integration
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(metaSettings.whatsapp_client_id ? 1 : 0)}
                  <Switch
                    checked={!!metaSettings.whatsapp_client_id}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        updateMetaSetting("whatsapp_client_id", "");
                        updateMetaSetting("whatsapp_client_secret", "");
                        updateMetaSetting("whatsapp_config_id", "");
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
                  <Label
                    htmlFor="wa-client-id"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Client ID
                  </Label>
                  <Input
                    id="wa-client-id"
                    value={metaSettings.whatsapp_client_id}
                    onChange={(e) =>
                      updateMetaSetting("whatsapp_client_id", e.target.value)
                    }
                    placeholder="WhatsApp Client ID"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="wa-client-secret"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Client Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="wa-client-secret"
                      type={showSecrets.wa_secret ? "text" : "password"}
                      value={metaSettings.whatsapp_client_secret}
                      onChange={(e) =>
                        updateMetaSetting(
                          "whatsapp_client_secret",
                          e.target.value
                        )
                      }
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
                      {showSecrets.wa_secret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="wa-graph-version"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Graph API Version
                  </Label>
                  <Input
                    id="wa-graph-version"
                    value={metaSettings.whatsapp_graph_version}
                    onChange={(e) =>
                      updateMetaSetting(
                        "whatsapp_graph_version",
                        e.target.value
                      )
                    }
                    placeholder="v18.0"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="wa-config-id"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Configuration ID
                  </Label>
                  <Input
                    id="wa-config-id"
                    value={metaSettings.whatsapp_config_id}
                    onChange={(e) =>
                      updateMetaSetting("whatsapp_config_id", e.target.value)
                    }
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

              {/* WhatsApp Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  onClick={handleUpdateMeta}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving WhatsApp...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Configuration Tab */}
        <TabsContent value="app-config">
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Globe className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">
                      App Configuration
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      Configure app settings, currency, and general
                      configuration
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="app-name"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    App Name
                  </Label>
                  <Input
                    id="app-name"
                    value={metaSettings.app_name}
                    onChange={(e) =>
                      updateMetaSetting("app_name", e.target.value)
                    }
                    placeholder="Enter App Name"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="custom-home"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Custom Home URL
                  </Label>
                  <Input
                    id="custom-home"
                    value={metaSettings.custom_home}
                    onChange={(e) =>
                      updateMetaSetting("custom_home", e.target.value)
                    }
                    placeholder="Enter Custom Home URL"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="currency-code"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Currency Code
                  </Label>
                  <Input
                    id="currency-code"
                    value={metaSettings.currency_code}
                    onChange={(e) =>
                      updateMetaSetting("currency_code", e.target.value)
                    }
                    placeholder="PKR"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="currency-symbol"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Currency Symbol
                  </Label>
                  <Input
                    id="currency-symbol"
                    value={metaSettings.currency_symbol}
                    onChange={(e) =>
                      updateMetaSetting("currency_symbol", e.target.value)
                    }
                    placeholder="PKR"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="exchange-rate"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Exchange Rate
                  </Label>
                  <Input
                    id="exchange-rate"
                    value={metaSettings.exchange_rate}
                    onChange={(e) =>
                      updateMetaSetting("exchange_rate", e.target.value)
                    }
                    placeholder="280"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="meta-description"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Meta Description
                  </Label>
                  <Input
                    id="meta-description"
                    value={metaSettings.meta_description}
                    onChange={(e) =>
                      updateMetaSetting("meta_description", e.target.value)
                    }
                    placeholder="Enter Meta Description"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="chatbot-tutorial"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Chatbot Screen Tutorial
                  </Label>
                  <Textarea
                    id="chatbot-tutorial"
                    value={metaSettings.chatbot_screen_tutorial}
                    onChange={(e) =>
                      updateMetaSetting(
                        "chatbot_screen_tutorial",
                        e.target.value
                      )
                    }
                    placeholder="Enter chatbot tutorial text"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px]"
                    rows={3}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="broadcast-tutorial"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Broadcast Screen Tutorial
                  </Label>
                  <Textarea
                    id="broadcast-tutorial"
                    value={metaSettings.broadcast_screen_tutorial}
                    onChange={(e) =>
                      updateMetaSetting(
                        "broadcast_screen_tutorial",
                        e.target.value
                      )
                    }
                    placeholder="Enter broadcast tutorial text"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="home-tutorial"
                    className="text-sm font-semibold text-slate-700 mb-2 block"
                  >
                    Home Page Tutorial
                  </Label>
                  <Textarea
                    id="home-tutorial"
                    value={metaSettings.home_page_tutorial}
                    onChange={(e) =>
                      updateMetaSetting("home_page_tutorial", e.target.value)
                    }
                    placeholder="Enter home page tutorial text"
                    className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[80px]"
                    rows={3}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Label
                      htmlFor="is-custom-home"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Custom Home Active
                    </Label>
                    <Switch
                      id="is-custom-home"
                      checked={metaSettings.is_custom_home === 1}
                      onCheckedChange={(checked) =>
                        updateMetaSetting("is_custom_home", checked ? 1 : 0)
                      }
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Label
                      htmlFor="login-header-footer"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Login Header Footer
                    </Label>
                    <Switch
                      id="login-header-footer"
                      checked={metaSettings.login_header_footer === 1}
                      onCheckedChange={(checked) =>
                        updateMetaSetting(
                          "login_header_footer",
                          checked ? 1 : 0
                        )
                      }
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Label
                      htmlFor="rtl"
                      className="text-sm font-semibold text-slate-700"
                    >
                      RTL Support
                    </Label>
                    <Switch
                      id="rtl"
                      checked={metaSettings.rtl === 1}
                      onCheckedChange={(checked) =>
                        updateMetaSetting("rtl", checked ? 1 : 0)
                      }
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* App Config Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  onClick={handleUpdateMeta}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving App Config...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save App Config
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
