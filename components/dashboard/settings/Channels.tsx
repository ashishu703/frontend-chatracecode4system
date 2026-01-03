"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, Check, Loader2, User, Star } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGoogle } from "@fortawesome/free-brands-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import serverHandler from "@/utils/api/enpointsUtils/serverHandler"
import InstagramProfileSigner from "@/components/integrations/instagram/InstagramProfileSigner"
import { useSelector } from "react-redux"

// SVG Icons (unchanged from your original code)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookMessengerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.13 3.26L19.752 8.1l-6.561 6.863z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
  </svg>
)

interface ConnectedAccount {
  id: string
  platform: string
  account_name?: string
  account_id?: string
  username?: string
  avatar?: string
  social_account_id?: string
  connected_at: string
  status: string
}

export default function ChannelsSettings() {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const user = useSelector((state: any) => state.auth.user)
  const [instagramConfig, setInstagramConfig] = useState<{ authURI?: string } | undefined>()

  const [googleStatus, setGoogleStatus] = useState<any>(null);

  // Fetch google connection status
  useEffect(() => {
    const fetchGoogleStatus = async () => {
      try {
        const response = await serverHandler.get('/api/google/status');
        setGoogleStatus(response.data?.data);
      } catch {}
    };
    fetchGoogleStatus();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      const response = await serverHandler.get('/api/google/auth');
      if (response.data?.data?.url) {
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      console.error('Failed to initiate Google auth:', err);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await serverHandler.post('/api/google/disconnect');
      setGoogleStatus({ isConnected: false });
    } catch (err) {
      console.error('Failed to disconnect Google:', err);
    }
  };

  // Helper to deduplicate by platform + social/account id
  const dedupeAccounts = (list: ConnectedAccount[]) => {
    const seen = new Set<string>()
    const result: ConnectedAccount[] = []
    for (const item of list) {
      const key = `${(item.platform || '').toLowerCase()}|${item.social_account_id || item.account_id || item.id}`
      if (seen.has(key)) continue
      seen.add(key)
      result.push(item)
    }
    return result
  }

  // Check for successful connection parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const instagramConnected = urlParams.get('instagram_connected');
    const messengerConnected = urlParams.get('messenger_connected');
    const whatsappConnected = urlParams.get('whatsapp_connected');
    
    if (instagramConnected || messengerConnected || whatsappConnected) {
      if (instagramConnected) {
        setSuccessMessage('Instagram connected successfully!');
      } else if (messengerConnected) {
        setSuccessMessage('Facebook Messenger connected successfully!');
      } else if (whatsappConnected) {
        setSuccessMessage('WhatsApp connected successfully!');
      }
      
      // Clear URL parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('instagram_connected');
      newUrl.searchParams.delete('messenger_connected');
      newUrl.searchParams.delete('whatsapp_connected');
      window.history.replaceState({}, '', newUrl.toString());
      
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, []);

  // Fetch connected accounts on component mount
  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      // Resolve userId from Redux or localStorage
      let resolvedUserId: string | null = user?.id || null;
      if (!resolvedUserId) {
        try {
          const userLS = localStorage.getItem('user');
          const parsed = userLS ? JSON.parse(userLS) : null;
          resolvedUserId = parsed?.id || parsed?.uid || null;
        } catch {}
      }

      try {
        setLoading(true)
        // Fetch auth params to mirror chatrace-front integration flow
        try {
          type AuthParams = { instagram?: { authURI?: string } }
          const authParamsRes = await serverHandler.get<AuthParams>('/api/user/get_auth_params')
          const instagram = (authParamsRes.data as any)?.instagram
          if (instagram) setInstagramConfig(instagram)
        } catch {}
        
        // Get auth token from localStorage
        const serviceToken = localStorage.getItem('serviceToken');
        const adminToken = localStorage.getItem('adminToken');
        const agentToken = localStorage.getItem('agentToken');
        const token = serviceToken || adminToken || agentToken;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (resolvedUserId) {
          const response = await fetch(`/api/user/get_connected_accounts?user_id=${resolvedUserId}`, {
            method: 'GET',
            headers,
            credentials: 'include',
          });

          const data = await response.json()

          if (data.success) {
            setConnectedAccounts(dedupeAccounts((data.data || []) as ConnectedAccount[]))
            try {
              const current = (data.data || []) as ConnectedAccount[]
              const hasFb = current.some(a => ['facebook','messenger','facebook_messenger','messanger'].includes((a.platform || '').toLowerCase()))
              if (!hasFb) {
                const fbRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messanger/accounts`, {
                  method: 'GET',
                  headers,
                }).then(res => res.json())
                const fbProfiles = fbRes?.data?.profiles || fbRes?.profiles || []
                const mapped = fbProfiles.map((profile: any) => ({
                  id: profile.id,
                  platform: profile.platform,
                  account_name: profile.name,
                  account_id: profile.social_user_id,
                  username: profile.username,
                  avatar: profile.avatar,
                  social_account_id: profile.social_account_id,
                  connected_at: new Date().toISOString(),
                  status: 'active'
                })) as ConnectedAccount[]
                if (mapped.length) setConnectedAccounts(prev => dedupeAccounts([...(prev || []), ...mapped]))
              }
            } catch {}
          } else {
            // If authentication failed, try calling backend directly
            if (data.message === 'Authentication token required' || String(data.message || '').includes('uid')) {
              try {
                const [facebookData, instagramData, whatsappData] = await Promise.all([
                  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messanger/accounts`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }).then(res => res.json()),
                  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/accounts`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }).then(res => res.json()),
                  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/accounts`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }).then(res => res.json())
                ]);
                
                // Combine all profiles
                const allProfiles = [
                  ...(facebookData?.data?.profiles || facebookData?.profiles || []),
                  ...(instagramData?.data?.profiles || instagramData?.profiles || []),
                  ...(whatsappData?.data?.profiles || whatsappData?.profiles || [])
                ];
                
                const connectedAccounts = allProfiles.map((profile: any) => ({
                  id: profile.id,
                  platform: profile.platform,
                  account_name: profile.name,
                  account_id: profile.social_user_id,
                  username: profile.username,
                  avatar: profile.avatar,
                  social_account_id: profile.social_account_id,
                  connected_at: new Date().toISOString(),
                  status: 'active'
                }));
                
                setConnectedAccounts(dedupeAccounts(connectedAccounts));
                return; // Exit early since we got data
              } catch (directErr) {
                setError('Failed to fetch connected accounts');
              }
            }
            setError(data.message || 'Failed to fetch connected accounts')
          }
        } else {
          
          try {
            const [facebookData, instagramData, whatsappData] = await Promise.all([
              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messanger/accounts`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }).then(res => res.json()),
              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/accounts`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }).then(res => res.json()),
              fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/accounts`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }).then(res => res.json())
            ]);

            const allProfiles = [
              ...(facebookData?.data?.profiles || facebookData?.profiles || []),
              ...(instagramData?.data?.profiles || instagramData?.profiles || []),
              ...(whatsappData?.data?.profiles || whatsappData?.profiles || [])
            ];

            const connectedAccounts = allProfiles.map((profile: any) => ({
              id: profile.id,
              platform: profile.platform,
              account_name: profile.name,
              account_id: profile.social_user_id,
              username: profile.username,
              avatar: profile.avatar,
              social_account_id: profile.social_account_id,
              connected_at: new Date().toISOString(),
              status: 'active'
            }));

            setConnectedAccounts(dedupeAccounts(connectedAccounts));
          } catch (directErr) {
            setError('Failed to fetch connected accounts');
          }
        }
      } catch (err) {
        setError('Failed to fetch connected accounts')
      } finally {
        setLoading(false)
      }
    }

    fetchConnectedAccounts()
  }, [user?.id, successMessage])

  const isConnected = (platform: string) => {
    // Handle different platform name variations
    const platformVariations = {
      'instagram': ['instagram', 'instagram_business'],
      'facebook': ['facebook', 'messenger', 'messanger'], 
      'whatsapp': ['whatsapp', 'whatsapp_business']
    };
    
    const variations = platformVariations[platform as keyof typeof platformVariations] || [platform];
    
    const connected = connectedAccounts.some(account => 
      variations.some(variation => 
        account.platform.toLowerCase() === variation.toLowerCase()
      ) && 
      account.status === 'active'
    )
    return connected
  }

  const getConnectedAccountInfo = (platform: string) => {
    // Handle different platform name variations
    const platformVariations = {
      'instagram': ['instagram', 'instagram_business'],
      'facebook': ['facebook', 'messenger', 'facebook_messenger', 'messanger'], // Handle backend typo
      'whatsapp': ['whatsapp', 'whatsapp_business']
    };
    
    const variations = platformVariations[platform as keyof typeof platformVariations] || [platform];
    
    const account = connectedAccounts.find(account => 
      variations.some(variation => 
        account.platform.toLowerCase() === variation.toLowerCase()
      ) && 
      account.status === 'active'
    )
    return account
  }

  const getConnectedAccounts = (platform: string) => {
    // Handle different platform name variations
    const platformVariations = {
      'instagram': ['instagram', 'instagram_business'],
      'facebook': ['facebook', 'messenger', 'facebook_messenger', 'messanger'], // Handle backend typo
      'whatsapp': ['whatsapp', 'whatsapp_business']
    };
    
    const variations = platformVariations[platform as keyof typeof platformVariations] || [platform];
    
    const accounts = connectedAccounts.filter(account => 
      variations.some(variation => 
        account.platform.toLowerCase() === variation.toLowerCase()
      ) && 
      account.status === 'active'
    )
    return accounts
  }

  const handleChannelConnect = async (platform: string) => {
    // Redirect to onboarding page for connection with force flag
    window.location.href = `/onboarding?platform=${platform}&force=true`
  }

  const handleChannelDisconnect = async (platform: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      const accounts = getConnectedAccounts(platform);
      if (accounts.length === 0) {
        console.log(`No ${platform} accounts to disconnect`);
        return;
      }

      // Show confirmation dialog
      const confirmMessage = `Are you sure you want to disconnect your ${platform} account? This will remove the connection and you'll need to reconnect it later.`;
      if (!window.confirm(confirmMessage)) {
        return;
      }

      // For each connected account, disconnect it
      for (const account of accounts) {
        const accountId = account.social_account_id || account.account_id || account.id;
        
        if (platform === 'facebook') {
          // Call the messenger accounts delete endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messanger/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              // Add authorization header if needed
              'Authorization': `Bearer ${localStorage.getItem('serviceToken') || localStorage.getItem('adminToken') || localStorage.getItem('agentToken') || ''}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to disconnect ${platform} account`);
          }
        } else if (platform === 'whatsapp') {
          // Call the whatsapp accounts delete endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              // Add authorization header if needed
              'Authorization': `Bearer ${localStorage.getItem('serviceToken') || localStorage.getItem('adminToken') || localStorage.getItem('agentToken') || ''}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to disconnect ${platform} account`);
          }
        }
      }
      
      // Refresh the connected accounts by calling the function directly
      const fetchConnectedAccounts = async () => {
        // Resolve userId from Redux or localStorage
        let resolvedUserId: string | null = user?.id || null;
        if (!resolvedUserId) {
          try {
            const userLS = localStorage.getItem('user');
            const parsed = userLS ? JSON.parse(userLS) : null;
            resolvedUserId = parsed?.id || parsed?.uid || null;
          } catch {}
        }

        try {
          setLoading(true)
          // Get auth token from localStorage
          const serviceToken = localStorage.getItem('serviceToken');
          const adminToken = localStorage.getItem('adminToken');
          const agentToken = localStorage.getItem('agentToken');
          const token = serviceToken || adminToken || agentToken;

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          if (resolvedUserId) {
            const response = await fetch(`/api/user/get_connected_accounts?user_id=${resolvedUserId}`, {
              method: 'GET',
              headers,
              credentials: 'include',
            });

            const data = await response.json()

            if (data.success) {
              setConnectedAccounts(dedupeAccounts((data.data || []) as ConnectedAccount[]))
            } else {
              // If authentication failed, try calling backend directly
              if (data.message === 'Authentication token required' || String(data.message || '').includes('uid')) {
                try {
                  const [facebookData, instagramData, whatsappData] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messanger/accounts`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }).then(res => res.json()),
                    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/accounts`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }).then(res => res.json()),
                    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/accounts`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }).then(res => res.json())
                  ]);
                  
                  // Combine all profiles
                  const allProfiles = [
                    ...(facebookData?.data?.profiles || facebookData?.profiles || []),
                    ...(instagramData?.data?.profiles || instagramData?.profiles || []),
                    ...(whatsappData?.data?.profiles || whatsappData?.profiles || [])
                  ];
                  
                  const connectedAccounts = allProfiles.map((profile: any) => ({
                    id: profile.id,
                    platform: profile.platform,
                    account_name: profile.name,
                    account_id: profile.social_user_id,
                    username: profile.username,
                    avatar: profile.avatar,
                    social_account_id: profile.social_account_id,
                    connected_at: new Date().toISOString(),
                    status: 'active'
                  }));
                  
                  setConnectedAccounts(dedupeAccounts(connectedAccounts));
                } catch (directErr) {
                  setError('Failed to fetch connected accounts');
                }
              }
            }
          } else {
            try {
              const [facebookData, instagramData, whatsappData] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messanger/accounts`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }).then(res => res.json()),
                fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/accounts`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }).then(res => res.json()),
                fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/accounts`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }).then(res => res.json())
              ]);

              const allProfiles = [
                ...(facebookData?.data?.profiles || facebookData?.profiles || []),
                ...(instagramData?.data?.profiles || instagramData?.profiles || []),
                ...(whatsappData?.data?.profiles || whatsappData?.profiles || [])
              ];

              const connectedAccounts = allProfiles.map((profile: any) => ({
                id: profile.id,
                platform: profile.platform,
                account_name: profile.name,
                account_id: profile.social_user_id,
                username: profile.username,
                avatar: profile.avatar,
                social_account_id: profile.social_account_id,
                connected_at: new Date().toISOString(),
                status: 'active'
              }));

              setConnectedAccounts(dedupeAccounts(connectedAccounts));
            } catch (directErr) {
              setError('Failed to fetch connected accounts');
            }
          }
        } catch (err) {
          setError('Failed to fetch connected accounts')
        } finally {
          setLoading(false)
        }
      };

      await fetchConnectedAccounts();
      setSuccessMessage(`${platform} account(s) disconnected successfully`);
      console.log(`${platform} account(s) disconnected successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error(`Error disconnecting ${platform}:`, error);
      setError(`Failed to disconnect ${platform} account: ${error.message || 'Unknown error'}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  }

  if (loading) {
    return (
      <motion.div
        key="channels"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-6 w-6 text-purple-600" />🔗 Channels Integration
            </CardTitle>
            <CardDescription>Connect your chatbot to various messaging platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading connected accounts...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="channels"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-6 w-6 text-purple-600" />🔗 Channels Integration
          </CardTitle>
          <CardDescription>Connect your chatbot to various messaging platforms</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative overflow-hidden border-2 hover:border-pink-300 transition-all duration-200 h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-pink-500">
                    <InstagramIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold">Instagram</h3>
                    <p className="text-xs text-gray-500">Business</p>

                    {/* Show connected accounts */}
                    {getConnectedAccounts('instagram').map((account, index) => (
                      <div key={`${account.platform}-${account.social_account_id || account.account_id || account.id}-${index}`} className="mt-3 p-3 bg-pink-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={account.avatar} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="text-xs font-medium text-gray-800">{account.account_name}</p>
                            {account.username && (
                              <p className="text-xs text-gray-500">@{account.username}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {isConnected('instagram') ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="h-3 w-3 mr-1" />
                        Connected ({getConnectedAccounts('instagram').length})
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      if (isConnected('instagram')) {
                        const first = getConnectedAccounts('instagram')[0];
                        if (first?.social_account_id) {
                          serverHandler
                            .delete(`/api/instagram/accounts/${first.social_account_id}`)
                            .then(() => {
                              setConnectedAccounts(prev => prev.filter(a => a.social_account_id !== first.social_account_id));
                            })
                            .catch(() => setError('Failed to disconnect Instagram'))
                        }
                      } else {
                        const authURI = instagramConfig?.authURI;
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
                        }
                      }
                    }}
                    variant={isConnected('instagram') ? "outline" : "default"}
                    className={
                      isConnected('instagram')
                        ? "text-red-600 hover:bg-red-50"
                        : "bg-pink-500 hover:bg-pink-600"
                    }
                    size="sm"
                  >
                    {isConnected('instagram') ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Facebook Messenger */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-200 h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-blue-500">
                    <FacebookMessengerIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold">Facebook Messenger</h3>
                    <p className="text-xs text-gray-500">Page Messages</p>
                    
                    {/* Show connected accounts */}
                    {getConnectedAccounts('facebook').map((account, index) => (
                      <div key={`${account.platform}-${account.social_account_id || account.account_id || account.id}-${index}`} className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={account.avatar} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="text-xs font-medium text-gray-800">{account.account_name}</p>
                            {account.username && (
                              <p className="text-xs text-gray-500">@{account.username}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {isConnected('facebook') ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="h-3 w-3 mr-1" />
                        Connected ({getConnectedAccounts('facebook').length})
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => isConnected('facebook') 
                      ? handleChannelDisconnect('facebook') 
                      : handleChannelConnect('facebook')
                    }
                    variant={isConnected('facebook') ? "outline" : "default"}
                    className={
                      isConnected('facebook')
                        ? "text-red-600 hover:bg-red-50"
                        : "bg-blue-500 hover:bg-blue-600"
                    }
                    size="sm"
                  >
                    {isConnected('facebook') ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* WhatsApp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative overflow-hidden border-2 hover:border-green-300 transition-all duration-200 h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-green-500">
                    <WhatsAppIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <p className="text-xs text-gray-500">Business API</p>
                    
                    {/* Show connected accounts */}
                    {getConnectedAccounts('whatsapp').map((account, index) => (
                      <div key={`${account.platform}-${account.social_account_id || account.account_id || account.id}-${index}`} className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={account.avatar} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="text-xs font-medium text-gray-800">{account.account_name}</p>
                            {account.social_account_id && (
                              <p className="text-xs text-gray-500">ID: {account.social_account_id}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {isConnected('whatsapp') ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="h-3 w-3 mr-1" />
                        Connected ({getConnectedAccounts('whatsapp').length})
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => isConnected('whatsapp') 
                      ? handleChannelDisconnect('whatsapp') 
                      : handleChannelConnect('whatsapp')
                    }
                    variant={isConnected('whatsapp') ? "outline" : "default"}
                    className={
                      isConnected('whatsapp')
                        ? "text-red-600 hover:bg-red-50"
                        : "bg-green-500 hover:bg-green-600"
                    }
                    size="sm"
                  >
                    {isConnected('whatsapp') ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Google Business Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="relative overflow-hidden border-2 hover:border-green-300 transition-all duration-200 h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-green-600">
                    <FontAwesomeIcon icon={faGoogle} className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Google Business</h3>
                    <p className="text-xs text-gray-500">Profile Reviews</p>
                    
                    {googleStatus?.isConnected && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={googleStatus.profile?.picture} />
                            <AvatarFallback>
                              <Star className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="text-xs font-medium text-gray-800">{googleStatus.profile?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{googleStatus.profile?.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {googleStatus?.isConnected ? (
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                  <Button
                    onClick={googleStatus?.isConnected ? handleDisconnectGoogle : handleConnectGoogle}
                    variant={googleStatus?.isConnected ? "outline" : "default"}
                    className={
                      googleStatus?.isConnected
                        ? "text-red-600 hover:bg-red-50"
                        : "bg-green-600 hover:bg-green-700"
                    }
                    size="sm"
                  >
                    {googleStatus?.isConnected ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 