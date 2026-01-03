"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { userPlansAPI, Plan } from '@/utils/api/plan/plans';
import { toast } from 'sonner';

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ open, onOpenChange, onSwitchToLogin }: RegisterModalProps) {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    mobile_with_country_code: '',
    acceptPolicy: false,
    plan_id: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await userPlansAPI.getPlans();
      if ((response as any).success) {
        setPlans((response as any).data);
      } else {
        toast.error('Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch plans');
    } finally {
      setPlansLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plan_id) {
      toast.error('Please select a plan to continue');
      return;
    }

    try {
      const registrationData = {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        mobile_with_country_code: formData.mobile_with_country_code,
        acceptPolicy: formData.acceptPolicy,
        plan_id: formData.plan_id
      };
      
      await register(
        formData.email,
        formData.name,
        formData.password,
        formData.mobile_with_country_code,
        formData.acceptPolicy,
        formData.plan_id
      );
      
      localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
      toast.success('Account created successfully! Please complete payment to activate your plan.');
      onOpenChange(false);
      router.push(`/checkout?plan=${formData.plan_id}&from=register`);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error.response?.status === 409) {
        toast.error('An account with this email already exists. Please login instead.');
        onOpenChange(false);
        onSwitchToLogin?.();
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  const handleOAuthLogin = (provider: string) => {
    if (provider === "facebook") {
      const socialConfig = (typeof window !== 'undefined' && (window as any).__SOCIAL_CONFIG__) || {};
      const version = socialConfig.facebook_graph_version || "v20.0";
      const clientId = (socialConfig.facebook_client_id || socialConfig.fb_login_app_id || '').trim();
      const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || `https://79a53a3720a9.ngrok-free.app/api/user/auth/meta/callback`;
      const state = `state_${Math.random().toString(36).substring(2, 15)}`;
      const loggerId = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      const authUrl = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('redirect_uri', redirectUri);
      params.append('response_type', 'code');
      params.append('scope', 'email,public_profile,pages_show_list,pages_read_engagement');
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
      // Google OAuth implementation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <motion.div className="flex items-center justify-center space-x-3 mb-4" whileHover={{ scale: 1.05 }}>
            <Image
              src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
              alt="Code4U Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-800">Code4U</span>
          </motion.div>
          <DialogTitle className="text-2xl text-gray-800">Create Account</DialogTitle>
          <p className="text-gray-600">Join Code4U and start automating today</p>
        </DialogHeader>

        <div className="space-y-6">
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
            <div>
              <Label htmlFor="plan_id" className="text-gray-700">Select Plan *</Label>
              <Select 
                value={formData.plan_id} 
                onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
                required
                disabled={plansLoading}
              >
                <SelectTrigger className="bg-white/50 border-gray-300 text-gray-800">
                  <SelectValue placeholder={plansLoading ? "Loading plans..." : "Choose your plan"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {plansLoading ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Loading plans...</div>
                  ) : plans.length > 0 ? (
                    plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.title} - {plan.price} INR/{plan.plan_duration_in_days} days
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-gray-500">No plans available</div>
                  )}
                </SelectContent>
              </Select>
              {plans.length === 0 && !plansLoading && (
                <p className="text-red-500 text-sm mt-1">No plans available. Please contact admin.</p>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
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
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToLogin?.();
                }}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

