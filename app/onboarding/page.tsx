"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { connectPlatform } from "@/store/slices/authSlice"
import { Check, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"
import { initFacebookLogin } from "@/lib/facebook"

const platforms = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: "💬",
    description: "Your customers love WhatsApp! Let's connect your business account so you can chat with them easily.",
    buttonText: "Connect WhatsApp",
    buttonIcon: "🚀",
    footerText: "Takes about 2 minutes",
    color: "bg-green-50 border-green-200"
  },
  {
    id: "messenger",
    name: "Facebook Messenger",
    icon: "💙",
    description: "Reach your Facebook followers directly! Perfect for customer support and building relationships.",
    buttonText: "Connect Facebook",
    buttonIcon: "✨",
    footerText: "Super quick setup",
    color: "bg-blue-50 border-blue-200"
  },
  {
    id: "instagram",
    name: "Instagram Business",
    icon: "📷",
    description: "Turn your Instagram DMs into a powerful business tool. Your visual content deserves great conversations!",
    buttonText: "Connect Instagram",
    buttonIcon: "🌸",
    footerText: "Just a few clicks away",
    color: "bg-pink-50 border-pink-200"
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
  const [isLoading, setIsLoading] = useState(true)
  const [hasExistingConnections, setHasExistingConnections] = useState(false)
  const [isForcedOnboarding, setIsForcedOnboarding] = useState(false)

  useEffect(() => {
    const checkExistingConnections = async () => {
      try {
        // Check if force parameter is present to skip existing connection check
        const urlParams = new URLSearchParams(window.location.search);
        const forceParam = urlParams.get('force');
        
        if (forceParam === 'true') {
          console.log('Force parameter detected, skipping existing connection check')
          setIsForcedOnboarding(true)
          setIsLoading(false)
          return
        }
        
        const token = 
          (typeof window !== 'undefined' && window.localStorage.getItem('serviceToken')) ||
          (typeof window !== 'undefined' && window.localStorage.getItem('adminToken')) ||
          (typeof window !== 'undefined' && window.localStorage.getItem('agentToken')) ||
          null

        if (!token) {
          console.log('No token found, proceeding with onboarding')
          setIsLoading(false)
          return
        }

        let userId = null
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          userId = payload.id || payload.userId || payload.sub
        } catch (e) {
          console.log('Could not decode token, using fallback')
        }

        if (userId) {
          const response = await fetch(`/api/user/get_connected_accounts?user_id=${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data && data.data.length > 0) {
              console.log('User already has connected platforms:', data.data)
              setHasExistingConnections(true)
              // Redirect to dashboard immediately
              router.replace('/dashboard')
              return
            }
          }
        }
      } catch (error) {
        console.log('Error checking existing connections:', error)
        // Continue with onboarding if there's an error
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingConnections()
  }, [router])

  // Check for URL parameters on mount
  useEffect(() => {
    if (isLoading || (hasExistingConnections && !isForcedOnboarding)) return

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const platformParam = urlParams.get('platform');
    const forceParam = urlParams.get('force');
    
    if (errorParam) {
      setError(`Failed to connect ${platformParam || 'platform'}: ${errorParam}`);
    }
    
    const instagramConnected = urlParams.get('instagram_connected');
    const messengerConnected = urlParams.get('messenger_connected');
    const whatsappConnected = urlParams.get('whatsapp_connected');
    
    // If coming from Channels page with a specific platform, highlight it
    if (platformParam && forceParam === 'true') {
      // Don't auto-connect, just show the platform is selected
      console.log(`Platform ${platformParam} selected for connection`);
    }
    
    if (instagramConnected) {
      setSuccess('Instagram connected successfully!');
      setConnectedPlatforms(prev => [...prev, 'instagram']);
      // Redirect to channels page after successful connection
      setTimeout(() => {
        window.location.href = '/dashboard/settings/channels?instagram_connected=true';
      }, 800);
    }
    if (messengerConnected) {
      setSuccess('Facebook Messenger connected successfully!');
      setConnectedPlatforms(prev => [...prev, 'messenger']);
      // Redirect to channels page after successful connection
      setTimeout(() => {
        window.location.href = '/dashboard/settings/channels?messenger_connected=true';
      }, 800);
    }
    if (whatsappConnected) {
      setSuccess('WhatsApp Business connected successfully!');
      setConnectedPlatforms(prev => [...prev, 'whatsapp']);
      // Redirect to channels page after successful connection
      setTimeout(() => {
        window.location.href = '/dashboard/settings/channels?whatsapp_connected=true';
      }, 800);
    }
  }, [isLoading, hasExistingConnections]);

  // Redirect to channels page after successful connections
  useEffect(() => {
    if (isLoading || (hasExistingConnections && !isForcedOnboarding)) return

    const urlParams = new URLSearchParams(window.location.search);
    const instagramConnected = urlParams.get('instagram_connected');
    const messengerConnected = urlParams.get('messenger_connected');
    const whatsappConnected = urlParams.get('whatsapp_connected');
    
    // If any platform was successfully connected, redirect to channels page
    if (instagramConnected || messengerConnected || whatsappConnected) {
      const platform = instagramConnected ? 'instagram' : messengerConnected ? 'messenger' : 'whatsapp';
      setTimeout(() => {
        window.location.href = `/dashboard/settings/channels?${platform}_connected=true`;
      }, 800);
    }
  }, [isLoading, hasExistingConnections, isForcedOnboarding]);

  // Listen for WhatsApp Embedded Signup FINISH message
  useEffect(() => {
    if (isLoading || (hasExistingConnections && !isForcedOnboarding)) return

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
  }, [isLoading, hasExistingConnections]);

  // Finalize auth when both code and account info exist
  useEffect(() => {
    if (isLoading || (hasExistingConnections && !isForcedOnboarding)) return

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
          // Redirect to channels page after successful connection
          setTimeout(() => {
            window.location.href = '/dashboard/settings/channels?whatsapp_connected=true';
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
  }, [waCode, waAccountInfo, isLoading, hasExistingConnections]);

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
          router.push("/dashboard/settings/channels");
        }, 800);
      }
    } catch (error) {
      console.error('Platform connect error:', error);
      setIsConnecting(null);
    }
  };

  const canProceed = connectedPlatforms.length > 0

  // Show loading state while checking existing connections
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your account...</p>
        </div>
      </div>
    )
  }

  // Don't render onboarding if user already has connections (unless forced)
  if (hasExistingConnections && !isForcedOnboarding) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Tracker */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center justify-center mb-16"
        >
          <div className="flex items-center space-x-8">
            {/* Step 1: Start */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-2">
                <Check className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Start</span>
            </div>
            
            {/* Connector Line */}
            <div className="w-16 h-0.5 bg-teal-600"></div>
            
            {/* Step 2: Connect */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-semibold text-lg">2</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Connect</span>
            </div>
            
            {/* Connector Line */}
            <div className="w-16 h-0.5 bg-gray-300"></div>
            
            {/* Step 3: Done */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-600 font-semibold text-lg">3</span>
              </div>
              <span className="text-sm font-medium text-gray-500">Done!</span>
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {platforms.map((platform, index) => {
            const isConnected = connectedPlatforms.includes(platform.id)
            const isLoading = isConnecting === platform.id
            const urlParams = new URLSearchParams(window.location.search);
            const platformParam = urlParams.get('platform');
            const forceParam = urlParams.get('force');
            const isSelectedFromChannels = platformParam === platform.id && forceParam === 'true';

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden border-2 rounded-xl ${platform.color} hover:shadow-lg transition-all duration-300 ${
                  isSelectedFromChannels ? 'ring-4 ring-teal-500 ring-opacity-50' : ''
                }`}>
                  <CardContent className="p-6">
                    {/* Platform Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-2xl">{platform.icon}</span>
                      </div>
                    </div>

                    {/* Platform Title */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                      {platform.name}
                      {isSelectedFromChannels && (
                        <span className="block text-sm font-normal text-teal-600 mt-1">
                          Selected for connection
                        </span>
                      )}
                    </h3>

                    {/* Platform Description */}
                    <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
                      {platform.description}
                    </p>

                    {/* Connect Button */}
                    <Button
                      onClick={() => handlePlatformConnect(platform.id)}
                      disabled={isConnected || isLoading}
                      className={`w-full h-12 font-medium text-white bg-teal-600 hover:bg-teal-700 transition-all duration-200 rounded-lg ${
                        isConnected
                          ? "bg-green-600 hover:bg-green-700 cursor-default"
                          : isLoading
                            ? "bg-teal-600 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700"
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
                          {platform.buttonText}
                          <span className="text-sm">{platform.buttonIcon}</span>
                        </div>
                      )}
                    </Button>

                    {/* Footer Text */}
                    <p className="text-gray-500 text-xs text-center mt-3">
                      {platform.footerText}
                    </p>
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
          <p className="text-gray-400 text-sm">
            {canProceed
              ? "You can add more platforms later from your dashboard settings."
              : "Connect at least one platform to access your dashboard."}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
