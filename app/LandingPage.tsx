"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import PhoneMockup from "@/components/auth/PhoneMockup"
import LoginModal from "@/components/auth/LoginModal"
import RegisterModal from "@/components/auth/RegisterModal"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"
import { useToast } from "@/hooks/use-toast"

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function LandingPage() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [socialConfig, setSocialConfig] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    serverHandler
      .get("/api/admin/get_social_login")
      .then((res) => {
        const data = (res.data as { data: any }).data
        setSocialConfig(data)
      })
      .catch((err) => {
        console.error("Failed to load social login configuration:", err)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      localStorage.removeItem("adminToken")
      router.push("/onboarding")
    } catch (err) {
      // error is handled by the hook
    }
  }

  const handleOAuthLogin = (provider: "google" | "facebook") => {
    if (!socialConfig) return

    if (provider === "facebook") {
      const version = socialConfig.facebook_graph_version || "v20.0"
      const clientId = (socialConfig.facebook_client_id || socialConfig.fb_login_app_id || "").trim()
      const scopes =
        socialConfig.facebook_auth_scopes ||
        "email,public_profile,pages_show_list,pages_read_engagement"
      const redirectUri =
        process.env.NEXT_PUBLIC_META_REDIRECT_URI ||
        `https://79a53a3720a9.ngrok-free.app/api/user/auth/meta/callback`
      const state = `state_${Math.random().toString(36).substring(2, 15)}`
      const loggerId = uuidv4()
      const timestamp = Date.now()
      const authUrl = new URL(`https://www.facebook.com/${version}/dialog/oauth`)
      const params = new URLSearchParams()
      params.append("client_id", clientId)
      params.append("redirect_uri", redirectUri)
      params.append("response_type", "code")
      params.append("scope", scopes)
      params.append("state", state)
      params.append("ret", "login")
      params.append("fbapp_pres", "0")
      params.append("logger_id", loggerId)
      params.append("tp", "unspecified")
      params.append("cbt", timestamp.toString())
      params.append("ext", (timestamp + 3600000).toString())
      params.append("hash", Math.random().toString(36).substring(2, 15))
      authUrl.search = params.toString()
      localStorage.setItem("fb_oauth_state", state)
      window.location.href = authUrl.toString()
      return
    }

    if (provider === "google") {
      if (!socialConfig.google_client_id) {
        toast({
          title: "Configuration Error",
          description: "Google OAuth is not properly configured. Please contact support.",
          variant: "destructive",
        })
        return
      }

      const redirectUri =
        socialConfig.google_redirect_uri || `${window.location.origin}/auth/callback?provider=google`

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
      const params = new URLSearchParams({
        client_id: socialConfig.google_client_id,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: `google_${Date.now()}`,
      })

      authUrl.search = params.toString()
      window.location.href = authUrl.toString()
      return
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col lg:flex-row">
      {/* Animated Wave Background Shapes - Dark Blue */}
      {/* Top Right Corner Wave - Animated */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] overflow-hidden z-0 wave-container">
        <svg viewBox="0 0 600 600" className="w-full h-full">
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 0.6 }} />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1E40AF', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: '#2563EB', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
          <g className="wave-top-right-1">
            <path
              d="M0,200 Q150,100 300,200 T600,200 L600,0 L0,0 Z"
              fill="url(#waveGradient1)"
              transform="rotate(-15 300 300)"
            />
          </g>
          <g className="wave-top-right-2">
            <path
              d="M0,300 Q200,150 400,300 T800,300 L800,0 L0,0 Z"
              fill="url(#waveGradient2)"
              transform="rotate(-25 300 300)"
            />
          </g>
        </svg>
      </div>

      {/* Bottom Left Corner Wave - Animated */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] overflow-hidden z-0 wave-container">
        <svg viewBox="0 0 600 600" className="w-full h-full">
          <defs>
            <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 0.6 }} />
            </linearGradient>
            <linearGradient id="waveGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1E40AF', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: '#2563EB', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
          <g className="wave-bottom-left-1">
            <path
              d="M0,200 Q150,100 300,200 T600,200 L600,600 L0,600 Z"
              fill="url(#waveGradient3)"
              transform="rotate(15 300 300)"
            />
          </g>
          <g className="wave-bottom-left-2">
            <path
              d="M0,300 Q200,150 400,300 T800,300 L800,600 L0,600 Z"
              fill="url(#waveGradient4)"
              transform="rotate(25 300 300)"
            />
          </g>
        </svg>
      </div>

      {/* Mobile Header - Logo */}
      <div className="lg:hidden flex items-center justify-center pt-8 pb-4 px-6 relative z-10">
        <motion.div
          className="flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Image
            src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
            alt="Code4U Logo"
            width={60}
            height={60}
            className="rounded-lg"
          />
        </motion.div>
      </div>

      {/* Left Section - Promotional Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          {/* Logo - Left Side */}
          <motion.div
            className="flex items-center mb-8"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Image
              src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
              alt="Code4U Logo"
              width={80}
              height={80}
              className="rounded-lg mr-4"
            />
            <span className="text-gray-600 font-bold text-xl">code 4 system</span>
          </motion.div>

          {/* Promotional Text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-800 mb-4 leading-tight"
          >
            Automate Your Business Communication
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mb-8"
          >
            Connect with customers across WhatsApp, Facebook & Instagram
          </motion.p>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PhoneMockup />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Section - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="text-center pb-6 pt-6">
              {/* Logo in Middle Top */}
              <motion.div
                className="flex items-center justify-center mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
                  alt="Code4U Logo"
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
              </motion.div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign in to your account</h2>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="username"
                      className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300 ${
                        focusedField === "email" ? "ring-2 ring-blue-400/50 scale-105" : ""
                      }`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300 ${
                        focusedField === "password" ? "ring-2 ring-blue-400/50 scale-105" : ""
                      }`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <i className="fas fa-eye-slash" />
                      ) : (
                        <i className="fas fa-eye" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" className="text-blue-600 hover:underline text-sm">
                    Forgot password?
                  </button>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      "Signing In..."
                    ) : (
                      <>
                        Sign In <i className="fas fa-arrow-right" />
                      </>
                    )}
                  </Button>
                </motion.div>
                {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white/50 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={!socialConfig || socialConfig.google_login_active !== 1}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
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
                    Google
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white/50 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handleOAuthLogin("facebook")}
                    disabled={!socialConfig || socialConfig.fb_login_active !== 1}
                  >
                    <i className="fab fa-facebook mr-2 text-blue-600" />
                    Facebook
                  </Button>
                </motion.div>
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setRegisterOpen(true)}
                    className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToRegister={() => setRegisterOpen(true)}
      />
      <RegisterModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
    </div>
  )
}


