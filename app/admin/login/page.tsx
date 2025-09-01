"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, loading, error } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin(formData.email, formData.password);
      router.push('/admin/dashboard');
    } catch (err) {
      // error is handled by the hook
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await serverHandler({
        method: "POST",
        url: "/api/admin/send_resovery",
        data: {
          email: formData.email
        }
      });

      toast({
        title: "Success",
        description: "If this email is associated with an admin account, you will receive a recovery link.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send recovery email. Please try again.",
        variant: "destructive",
      });
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
              <img
                src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1752042604/mbg_logo_l7xfr2.png"
                alt="MBG Logo"
                width={100}
                height={100}
              />
            </motion.div>
            <CardTitle className="text-xl text-gray-800">ADMIN LOGIN</CardTitle>
            <p className="text-gray-600 text-sm">Authorized personnel only</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 text-sm">
                  Email
                </Label>
                <div className="relative">
                  <i className="fas fa-user absolute left-3 top-3 text-gray-400"></i>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-red-400 transition-all duration-300 ${focusedField === "email" ? "ring-1 ring-red-400/50" : ""}`}
                    placeholder="Admin email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700 text-sm">
                  Password
                </Label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className={`pl-10 bg-white/50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-red-400 transition-all duration-300 ${focusedField === "password" ? "ring-1 ring-red-400/50" : ""}`}
                    placeholder="Admin password"
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
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-red-600 hover:text-red-700"
                  onClick={handleForgotPassword}
                  disabled={recoveryLoading}
                >
                  {recoveryLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sending...
                    </>
                  ) : (
                    "Forgot Password?"
                  )}
                </Button>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:bg-blue-700 text-white font-semibold py-2" 
                  disabled={loading}
                >
                  <i className="fas fa-shield-alt mr-2"></i>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </motion.div>
              {error && <div className="text-red-500 text-center text-sm mt-2">{error}</div>}
            </form>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                href="/login"
                className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to User Login
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
