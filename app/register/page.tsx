"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RegisterModal from "@/components/auth/RegisterModal"
import LoginModal from "@/components/auth/LoginModal"

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    setRegisterOpen(true)
  }, [])

  const handleRegisterClose = (open: boolean) => {
    setRegisterOpen(open)
    if (!open) {
      router.push("/")
    }
  }

  const handleSwitchToLogin = () => {
    setRegisterOpen(false)
    setLoginOpen(true)
  }

  const handleLoginClose = (open: boolean) => {
    setLoginOpen(open)
    if (!open) {
      router.push("/")
    }
  }

  const handleSwitchToRegister = () => {
    setLoginOpen(false)
    setRegisterOpen(true)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white">
      <RegisterModal
        open={registerOpen}
        onOpenChange={handleRegisterClose}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <LoginModal
        open={loginOpen}
        onOpenChange={handleLoginClose}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </div>
  )
}
