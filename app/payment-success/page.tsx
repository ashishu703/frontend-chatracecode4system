"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
// useAuth is no longer needed since users are created during initial registration
import { toast } from 'sonner'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // register is no longer needed since users are created during initial registration
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handlePaymentSuccess()
  }, [])

  const handlePaymentSuccess = async () => {
    try {
      // Check if this is a Stripe redirect with registration data
      const pendingRegistration = sessionStorage.getItem('pendingRegistration')
      
      if (pendingRegistration) {
        try {
          const registrationData = JSON.parse(pendingRegistration)
          
          // Clear session storage
          sessionStorage.removeItem('pendingRegistration')
          
          // Show success message since user is already registered
          toast.success('Payment successful! Your account is now active. Please login to continue.', {
            style: {
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb'
            }
          })
          
          setSuccess(true)
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          
        } catch (error) {
          console.error('Payment success handling error:', error)
          setError('Payment successful but there was an issue. Please contact support.')
          toast.error('Payment successful but there was an issue. Please contact support.')
        }
      } else {
        // Regular payment success (not from registration)
        setSuccess(true)
        toast.success('Payment successful!')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      console.error('Payment success handling error:', error)
      setError('Failed to process payment success. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="bg-white/80 border-gray-200 backdrop-blur-md shadow-xl max-w-md w-full">
          <CardContent className="text-center p-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we complete your transaction...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="bg-white/80 border-gray-200 backdrop-blur-md shadow-xl max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/register')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            <CardTitle className="text-2xl text-gray-800">Payment Successful!</CardTitle>
            <p className="text-gray-600">
              {success ? 'Your account has been created successfully!' : 'Your payment has been processed successfully!'}
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <p className="text-green-800 text-sm">
                  You will be redirected to the login page shortly...
                </p>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
