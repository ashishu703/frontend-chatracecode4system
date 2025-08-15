"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { login } from "@/store/slices/authSlice"
import { useAuth } from '@/hooks/useAuth';
import serverHandler from "@/utils/serverHandler";
import { useToast } from '@/hooks/use-toast';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [socialConfig, setSocialConfig] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    serverHandler.get('/api/admin/get_social_login').then(res => {
      const data = (res.data as { data: any }).data;
      console.log('Social login configuration loaded:', data);
      setSocialConfig(data);
    }).catch(err => {
      console.error('Failed to load social login configuration:', err);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      localStorage.removeItem('adminToken');
      router.push('/onboarding')
    } catch (err) {
      // error is handled by the hook
    }
  }

  const handleOAuthLogin = (provider: "google" | "facebook") => {
    if (!socialConfig) return;

    if (provider === "facebook") {
      // Get all dynamic values from socialConfig with fallbacks
      const version = socialConfig.facebook_graph_version || "v20.0";
      const clientId = (socialConfig.facebook_client_id || socialConfig.fb_login_app_id || '').trim();
      // Default scopes if not provided
      const scopes = socialConfig.facebook_auth_scopes || 
        "email,public_profile,pages_show_list,pages_read_engagement";
      // Hardcoded backend URL for redirect_uri
      const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || `https://79a53a3720a9.ngrok-free.app/api/user/auth/meta/callback`;
      // Generate a unique state and other required parameters
      const state = `state_${Math.random().toString(36).substring(2, 15)}`;
      const loggerId = uuidv4();
      const timestamp = Date.now();
      // Construct the exact URL with all parameters
      const authUrl = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
      // Add all required parameters
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('redirect_uri', redirectUri);
      params.append('response_type', 'code');
      params.append('scope', scopes);
      params.append('state', state);
      params.append('ret', 'login');
      params.append('fbapp_pres', '0');
      params.append('logger_id', loggerId);
      params.append('tp', 'unspecified');
      params.append('cbt', timestamp.toString());
      params.append('ext', (timestamp + 3600000).toString()); // 1 hour later
      params.append('hash', Math.random().toString(36).substring(2, 15));
      authUrl.search = params.toString();
      // Save state to localStorage for verification in callback
      localStorage.setItem('fb_oauth_state', state);
      // Redirect to Facebook OAuth
      window.location.href = authUrl.toString();
      return;
    }
    
    // Keep existing Google OAuth flow
    if (provider === "google") {
      // Check if Google OAuth is properly configured
      if (!socialConfig.google_client_id) {
        console.error('Google OAuth not configured: missing client_id');
        toast({ 
          title: 'Configuration Error', 
          description: 'Google OAuth is not properly configured. Please contact support.', 
          variant: 'destructive' 
        });
        return;
      }
      
      const redirectUri = socialConfig.google_redirect_uri || 
        `${window.location.origin}/auth/callback?provider=google`;
      
      console.log('Google OAuth configuration:', {
        clientId: socialConfig.google_client_id,
        redirectUri,
        origin: window.location.origin
      });
        
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      const params = new URLSearchParams({
        client_id: socialConfig.google_client_id,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state: `google_${Date.now()}`
      });
      
      authUrl.search = params.toString();
      console.log('Google OAuth URL:', authUrl.toString());
      window.location.href = authUrl.toString();
      return;
    }
    // If provider is not handled, do nothing
    return;
  }

  // Password recovery handler
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    try {
      const res = await fetch('/api/user/send_recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Recovery email sent. Please check your inbox.', variant: 'default' });
        setShowRecovery(false);
        setRecoveryEmail('');
      } else {
        toast({ title: 'Error', description: data.msg || 'Failed to send recovery email', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send recovery email', variant: 'destructive' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/80 border-gray-200 backdrop-blur-md shadow-xl">
          <CardHeader className="text-center">
            <motion.div className="flex items-center justify-center space-x-3 mb-4" whileHover={{ scale: 1.05 }}>
              <Image
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1752042604/mbg_logo_l7xfr2.png"
                alt="MBG Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-gray-800">MBG</span>
            </motion.div>
            <CardTitle className="text-2xl text-gray-800">Welcome Back</CardTitle>
            <p className="text-gray-600">Sign in to your MBG account</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
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
                  <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
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
                      <i className="fas fa-eye-slash"></i>
                    ) : (
                      <i className="fas fa-eye"></i>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-blue-600 hover:underline text-sm" onClick={() => setShowRecovery(true)}>
                  Forgot password?
                </button>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
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
                  <i className="fab fa-facebook mr-2 text-blue-600"></i>
                  Facebook
                </Button>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </Link>
            </motion.div>
          </CardContent>
        </Card>
        {showRecovery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form onSubmit={handleRecovery} className="bg-white p-6 rounded shadow w-96">
              <h2 className="text-lg font-bold mb-4">Password Recovery</h2>
              <Input
                name="recoveryEmail"
                type="email"
                placeholder="Enter your email"
                required
                className="mb-4"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowRecovery(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 text-white" disabled={recoveryLoading}>Send Recovery Email</Button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}
