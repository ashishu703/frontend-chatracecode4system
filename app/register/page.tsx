"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    mobile_with_country_code: '',
    acceptPolicy: false,
    plan: '', // keep for UI, not sent to backend
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(
        formData.email,
        formData.name,
        formData.password,
        formData.mobile_with_country_code,
        formData.acceptPolicy
      );
      localStorage.removeItem('adminToken');
      router.push('/login');
    } catch (err) {
      // error is handled by the hook
    }
  };

  const handleOAuthLogin = (provider: string) => {
    // For now, only handle Facebook and Google
    if (provider === "facebook") {
      // Try to get config from window or fallback
      const socialConfig = (typeof window !== 'undefined' && (window as any).__SOCIAL_CONFIG__) || {};
      const version = socialConfig.facebook_graph_version || "v20.0";
      const clientId = (socialConfig.facebook_client_id || socialConfig.fb_login_app_id || '').trim();
      const scopes = socialConfig.facebook_auth_scopes || "email,public_profile,pages_show_list,pages_read_engagement";
      // Hardcoded backend URL for redirect_uri
      const redirectUri = `https://77eee581cbb2.ngrok-free.app/api/user/auth/meta/callback`;
      const state = `state_${Math.random().toString(36).substring(2, 15)}`;
      const loggerId = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      const authUrl = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
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
      params.append('ext', (timestamp + 3600000).toString());
      params.append('hash', Math.random().toString(36).substring(2, 15));
      authUrl.search = params.toString();
      localStorage.setItem('fb_oauth_state', state);
      window.location.href = authUrl.toString();
      return;
    }
    if (provider === "google") {
      // Implement Google OAuth if needed
      // ...
    }
  }

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
            <CardTitle className="text-2xl text-gray-800">Create Account</CardTitle>
            <p className="text-gray-600">Join MBG and start automating today</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">Name *</Label>
                <div className="relative">
                  <i className="fas fa-user absolute left-3 top-3 text-gray-400"></i>
                  <Input
                    id="name"
                    type="text"
                    required
                    className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300 ${focusedField === "name" ? "ring-2 ring-blue-400/50" : ""}`}
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email *</Label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                  <Input
                    id="email"
                    type="email"
                    required
                    className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300 ${focusedField === "email" ? "ring-2 ring-blue-400/50" : ""}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">Password *</Label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                  <Input
                    id="password"
                    type="password"
                    required
                    className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300 ${focusedField === "password" ? "ring-2 ring-blue-400/50" : ""}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mobile_with_country_code" className="text-gray-700">Mobile Number *</Label>
                <div className="relative">
                  <i className="fas fa-phone absolute left-3 top-3 text-gray-400"></i>
                  <Input
                    id="mobile_with_country_code"
                    type="tel"
                    required
                    className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 transition-all duration-300 ${focusedField === "mobile_with_country_code" ? "ring-2 ring-blue-400/50" : ""}`}
                    placeholder="Enter your mobile number with country code"
                    value={formData.mobile_with_country_code}
                    onChange={(e) => setFormData({ ...formData, mobile_with_country_code: e.target.value })}
                    onFocus={() => setFocusedField("mobile_with_country_code")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="acceptPolicy"
                  type="checkbox"
                  checked={formData.acceptPolicy}
                  onChange={e => setFormData({ ...formData, acceptPolicy: e.target.checked })}
                  className="mr-2"
                  required
                />
                <Label htmlFor="acceptPolicy" className="text-gray-700">I accept the policy *</Label>
              </div>
              {/* Plan selection UI can remain, but not sent to backend */}
              <div>
                <Label htmlFor="plan" className="text-gray-700">Select Plan *</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger className="bg-white/50 border-gray-300 text-gray-800">
                    <SelectValue placeholder="Choose your plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="basic">Basic Plan - 500 PKR/month</SelectItem>
                    <SelectItem value="pro">Pro Plan - 1000 PKR/month</SelectItem>
                    <SelectItem value="enterprise">Enterprise Plan - 2000 PKR/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
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
                >
                  <i className="fab fa-google mr-2 text-red-500"></i>
                  Google
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white/50 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => handleOAuthLogin("facebook")}
                >
                  <i className="fab fa-facebook mr-2 text-blue-600"></i>
                  Facebook
                </Button>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
                  Sign in
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
      </motion.div>
    </div>
  )
}
