 import { Template } from "./types"

 export const TEMPLATE_CATEGORIES = [
   { value: "MARKETING", label: "Marketing", icon: "📢", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
   { value: "UTILITY", label: "Utility", icon: "🔧", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
   { value: "AUTHENTICATION", label: "Authentication", icon: "🔐", color: "bg-gradient-to-r from-green-500 to-emerald-500" },
   { value: "TRANSACTIONAL", label: "Transactional", icon: "💳", color: "bg-gradient-to-r from-orange-500 to-red-500" },
   { value: "OTP", label: "OTP", icon: "🔢", color: "bg-gradient-to-r from-indigo-500 to-purple-500" },
   { value: "ACCOUNT_UPDATE", label: "Account Update", icon: "👤", color: "bg-gradient-to-r from-teal-500 to-blue-500" },
 ]

 export const LANGUAGES = [
   { value: "en", label: "English" },
   { value: "es", label: "Spanish" },
   { value: "fr", label: "French" },
   { value: "de", label: "German" },
   { value: "pt", label: "Portuguese" },
   { value: "hi", label: "Hindi" },
   { value: "ar", label: "Arabic" },
 ]

 export const PREBUILT_TEMPLATES: Record<string, Template[]> = {
   MARKETING: [
     {
       id: "marketing_1",
       name: "Product Launch",
       category: "MARKETING",
       language: "en",
       status: "APPROVED",
       header: { type: "IMAGE", mediaUrl: "https://example.com/product.jpg" },
       body: "🎉 Exciting News! Our new {{1}} is now available! Get {{2}}% off your first order. Limited time offer!",
       footer: "Don't miss out on this amazing deal!",
       buttons: [
         { id: "1", type: "URL", text: "Shop Now", url: "https://shop.example.com" },
         { id: "2", type: "PHONE_NUMBER", text: "Call Us", phoneNumber: "+1234567890" }
       ],
       variables: ["1", "2"],
       catalogEnabled: true,
       catalogId: "catalog_123"
     },
     {
       id: "marketing_2",
       name: "Flash Sale",
       category: "MARKETING",
       language: "en",
       status: "APPROVED",
       body: "⚡ FLASH SALE ALERT! {{1}} is now {{2}}% OFF! Hurry, only {{3}} hours left!",
       buttons: [
         { id: "1", type: "URL", text: "Buy Now", url: "https://sale.example.com" }
       ],
       variables: ["1", "2", "3"],
       catalogEnabled: false
     }
   ],
   UTILITY: [
     {
       id: "utility_1",
       name: "Service Reminder",
       category: "UTILITY",
       language: "en",
       status: "APPROVED",
       body: "📅 Friendly Reminder: Your {{1}} service is scheduled for {{2}} at {{3}}. Please be available.",
       footer: "Thank you for choosing our services!",
       buttons: [
         { id: "1", type: "QUICK_REPLY", text: "Confirm" },
         { id: "2", type: "QUICK_REPLY", text: "Reschedule" }
       ],
       variables: ["1", "2", "3"],
       catalogEnabled: false
     }
   ],
   AUTHENTICATION: [
     {
       id: "auth_1",
       name: "Welcome Message",
       category: "AUTHENTICATION",
       language: "en",
       status: "APPROVED",
       body: "Welcome to {{1}}! Your account has been successfully created. We're excited to have you on board!",
       buttons: [
         { id: "1", type: "URL", text: "Get Started", url: "https://app.example.com" }
       ],
       variables: ["1"],
       catalogEnabled: false
     }
   ],
   OTP: [
     {
       id: "otp_1",
       name: "OTP Verification",
       category: "OTP",
       language: "en",
       status: "APPROVED",
       body: "🔐 Your OTP for {{1}} is: {{2}}\n\nThis code will expire in {{3}} minutes. Please do not share this code with anyone.",
       footer: "Security is our priority",
       buttons: [],
       variables: ["1", "2", "3"],
       catalogEnabled: false
     }
   ]
 }


