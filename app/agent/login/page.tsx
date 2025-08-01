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
import { useAgentAuth } from '@/hooks/useAgentAuth';
import { useToast } from '@/hooks/use-toast';

export default function AgentLoginPage() {
  const router = useRouter()
  const { login, loading, error } = useAgentAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      router.push('/agent/dashboard')
    } catch (err) {
      // error is handled by the hook
    }
  }

  // Password recovery handler
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryLoading(true);
    try {
      const res = await fetch('/api/agent/send_recovery', {
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
            <CardTitle className="text-2xl text-gray-800">Agent Login</CardTitle>
            <p className="text-gray-600">Sign in to your agent account</p>
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

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an agent account?{" "}
                <Link href="/agent/register" className="text-blue-600 hover:text-blue-700 transition-colors">
                  Register here
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