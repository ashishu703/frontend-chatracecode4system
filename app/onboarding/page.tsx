"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { connectPlatform } from "@/store/slices/authSlice"
import { Check, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import serverHandler from "@/utils/serverHandler"
import { initFacebookLogin } from "@/lib/facebook"

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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [waCode, setWaCode] = useState<string | null>(null)
  const [waAccountInfo, setWaAccountInfo] = useState<any | null>(null)

  // Check for URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const platformParam = urlParams.get('platform');
    
    if (errorParam) {
      setError(`Failed to connect ${platformParam || 'platform'}: ${errorParam}`);
    }
    
    const instagramConnected = urlParams.get('instagram_connected');
    const messengerConnected = urlParams.get('messenger_connected');
    const whatsappConnected = urlParams.get('whatsapp_connected');
    
    if (instagramConnected) {
      setSuccess('Instagram connected successfully!');
      setConnectedPlatforms(prev => [...prev, 'instagram']);
    }
    if (messengerConnected) {
      setSuccess('Facebook Messenger connected successfully!');
      setConnectedPlatforms(prev => [...prev, 'messenger']);
    }
    if (whatsappConnected) {
      setSuccess('WhatsApp Business connected successfully!');
      setConnectedPlatforms(prev => [...prev, 'whatsapp']);
    }
  }, []);

  // Listen for WhatsApp Embedded Signup FINISH message
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return;
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('[Onboarding][WA] postMessage received:', payload);
        const { type, event: eventState, data } = payload || {};
        if (type === 'WA_EMBEDDED_SIGNUP' && eventState === 'FINISH' && data) {
          console.log('[Onboarding][WA] Embedded signup FINISH payload:', data);
          setWaAccountInfo(data);
        }
      } catch (e) {
        console.log('[Onboarding][WA] postMessage parse error', e);
      }
    };
    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, []);

  // Finalize auth when both code and account info exist
  useEffect(() => {
    const finalize = async () => {
      if (!waCode || !waAccountInfo) return;
      try {
        console.log('[Onboarding][WA] Finalizing via /api/whatsapp/auth-init', {
          hasCode: !!waCode,
          business_id: waAccountInfo?.business_id,
          waba_id: waAccountInfo?.waba_id,
          phone_number_id: waAccountInfo?.phone_number_id
        });
        const resp: any = await serverHandler.post('/api/whatsapp/auth-init', {
          code: waCode,
          ...waAccountInfo
        });
        console.log('[Onboarding][WA] Backend result:', resp?.data);
        if (resp?.data?.success || resp?.data?.msg === 'success') {
          setSuccess('WhatsApp Business connected successfully!');
          setConnectedPlatforms(prev => prev.includes('whatsapp') ? prev : [...prev, 'whatsapp']);
          setIsConnecting(null);
          // Redirect to dashboard after successful connection
          setTimeout(() => {
            window.location.href = '/dashboard?whatsapp_connected=true';
          }, 800);
        } else {
          throw new Error(resp?.data?.message || 'Failed to connect WhatsApp');
        }
      } catch (e: any) {
        console.error('[Onboarding][WA] finalize error', e?.message, e?.response?.data);
        setError(e?.message || 'Failed to connect WhatsApp');
        setIsConnecting(null);
      }
    };
    finalize();
  }, [waCode, waAccountInfo]);

  const handlePlatformConnect = async (platformId: string) => {
    setIsConnecting(platformId);

    try {
      if (platformId === "instagram") {
        // Mirror chatrace-front: get auth params, then redirect to instagram.authURI
        try {
          const resp: any = await serverHandler.get('/api/user/get_auth_params')
          const data = resp?.data || {}
          const instagram = (data as any)?.instagram
          let authURI = instagram?.authURI as string | undefined
          if (authURI) {
            const token =
              (typeof window !== 'undefined' && window.localStorage.getItem('serviceToken')) ||
              (typeof window !== 'undefined' && window.localStorage.getItem('adminToken')) ||
              (typeof window !== 'undefined' && window.localStorage.getItem('agentToken')) ||
              null
            const url = new URL(authURI)
            const prevState = url.searchParams.get('state') || 'instagram'
            const dialogRedirect = url.searchParams.get('redirect_uri') || ''
            const encodedDialogRedirect = dialogRedirect ? encodeURIComponent(dialogRedirect) : ''
            const nextState = token ? `instagram|${token}|${Date.now()}|${encodedDialogRedirect}` : prevState
            url.searchParams.set('state', nextState)
            window.location.href = url.toString()
            return
          }
          throw new Error('Missing Instagram authURI')
        } catch (e) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          dispatch(connectPlatform(platformId));
          setConnectedPlatforms((prev) => [...prev, platformId]);
          setIsConnecting(null);
        }
      } else if (platformId === "messenger") {
        // Get Facebook OAuth URL from backend
        const response = await fetch('/api/auth/facebook');
        const data = await response.json();
        
        if (data.success) {
          // Inject JWT and dialog redirect into state like instagram flow
          const token =
            (typeof window !== 'undefined' && window.localStorage.getItem('serviceToken')) ||
            (typeof window !== 'undefined' && window.localStorage.getItem('adminToken')) ||
            (typeof window !== 'undefined' && window.localStorage.getItem('agentToken')) ||
            null
          const authUrl = new URL(data.data.authUrl as string)
          const prevState = authUrl.searchParams.get('state') || 'messenger'
          const dialogRedirect = authUrl.searchParams.get('redirect_uri') || ''
          const encodedDialogRedirect = dialogRedirect ? encodeURIComponent(dialogRedirect) : ''
          const nextState = token ? `messenger|${token}|${Date.now()}|${encodedDialogRedirect}` : prevState
          authUrl.searchParams.set('state', nextState)
          window.location.href = authUrl.toString();
          return;
        } else {
          // Fallback to simulated connect
          await new Promise((resolve) => setTimeout(resolve, 1500));
          dispatch(connectPlatform(platformId));
          setConnectedPlatforms((prev) => [...prev, platformId]);
          setIsConnecting(null);
        }
      } else if (platformId === "whatsapp") {
        const response = await fetch('/api/auth/whatsapp');
        const data = await response.json();
        if (data?.success && data?.data?.facebookAppId) {
          try {
            const { facebookAppId, configId, scopes } = data.data;
            console.log('[Onboarding][WA] Launching FB embedded signup', { appId: facebookAppId, configId });
            const { code } = await initFacebookLogin(facebookAppId, {
              configId,
              scope: scopes,
              responseType: 'code'
            });
            console.log('[Onboarding][WA] Authorization code captured:', code ? `${String(code).slice(0,6)}...` : null);
            setWaCode(code);
            // Wait for WA_EMBEDDED_SIGNUP FINISH message; finalize happens in effect
            return;
          } catch (e) {
            // fall through to simulated connect below
          }
        }
        // Fallback to simulated connect
        await new Promise((resolve) => setTimeout(resolve, 1500));
        dispatch(connectPlatform(platformId));
        setConnectedPlatforms((prev) => [...prev, platformId]);
        setIsConnecting(null);
      } else {
        // For Google or other platforms, fallback to simulated connect
        await new Promise((resolve) => setTimeout(resolve, 1500));
        dispatch(connectPlatform(platformId));
        setConnectedPlatforms((prev) => [...prev, platformId]);
        setIsConnecting(null);
      }

      if (connectedPlatforms.length === 0) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (error) {
      console.error('Platform connect error:', error);
      setIsConnecting(null);
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

        {/* Error and Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{success}</span>
            </div>
          </motion.div>
        )}

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
