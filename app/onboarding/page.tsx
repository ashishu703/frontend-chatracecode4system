"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { connectPlatform } from "@/store/slices/authSlice"
import { Check, ArrowRight } from "lucide-react"

const platforms = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    description: "Connect your WhatsApp Business account for messaging automation",
  },
  {
    id: "messenger",
    name: "Facebook Messenger",
    icon: "https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg",
    description: "Integrate Facebook Messenger for customer support",
  },
  {
    id: "google",
    name: "Google Workspace",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    description: "Connect Google services for enhanced productivity",
  },
  {
    id: "instagram",
    name: "Instagram Business",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    description: "Link your Instagram Business account for social management",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handlePlatformConnect = async (platformId: string) => {
    setIsConnecting(platformId);

    // Real OAuth flow for supported platforms
    const redirectUri = `${window.location.origin}/auth/callback?provider=${platformId}`;
    if (platformId === "instagram") {
      const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || "";
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=instagram_${Date.now()}`;
      window.location.href = authUrl;
      return;
    } else if (platformId === "messenger") {
      const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_messaging,pages_show_list,pages_manage_metadata&response_type=code&state=messenger_${Date.now()}`;
      window.location.href = authUrl;
      return;
    } else if (platformId === "whatsapp") {
      // WhatsApp Business API OAuth (example, may need adjustment)
      const clientId = process.env.NEXT_PUBLIC_WHATSAPP_CLIENT_ID || "";
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=whatsapp_business_management,whatsapp_business_messaging&response_type=code&state=whatsapp_${Date.now()}`;
      window.location.href = authUrl;
      return;
    }

    // For Google, Facebook, or others, fallback to simulated connect (as before)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    dispatch(connectPlatform(platformId));
    setConnectedPlatforms((prev) => [...prev, platformId]);
    setIsConnecting(null);

    if (connectedPlatforms.length === 0) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }
  };

  const canProceed = connectedPlatforms.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Image
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1752042604/mbg_logo_l7xfr2.png"
                alt="MBG Logo"
                width={56}
                height={56}
                className="rounded-xl shadow-sm"
              />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              MBG
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Connect Your Platforms</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Choose the platforms you'd like to integrate.
          </p>
        </motion.div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {platforms.map((platform, index) => {
            const isConnected = connectedPlatforms.includes(platform.id)
            const isLoading = isConnecting === platform.id

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group relative overflow-hidden bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                          <Image
                            src={platform.icon || "/placeholder.svg"}
                            alt={platform.name}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                        {isConnected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{platform.name}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{platform.description}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePlatformConnect(platform.id)}
                      disabled={isConnected || isLoading}
                      className={`w-full h-11 font-medium transition-all duration-200 ${
                        isConnected
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-md text-white cursor-default"
                          : isLoading
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-md"
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Connecting...
                        </div>
                      ) : isConnected ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Connected
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Connect {platform.name.split(" ")[0]}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4"
        >
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Ready to proceed to dashboard
            </motion.div>
          )}
          <p className="text-slate-400 text-sm">
            {canProceed
              ? "You can add more platforms later from your dashboard settings."
              : "Connect at least one platform to access your dashboard."}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
