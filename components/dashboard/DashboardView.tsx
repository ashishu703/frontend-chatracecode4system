"use client"

import { Card, CardContent } from "@/components/ui/card";
import React, { useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { UserEndpoints } from "@/utils/api/enpointsUtils/Api-endpoints";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faInstagram, faFacebookMessenger, faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function DashboardView() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Parallel API calls for dashboard data and connected channels
  const { data: dashboardData, isLoading: dashboardLoading, error } = useQuery<any, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await serverHandler.get(UserEndpoints.USER_DASHBOARD);
      const data = response.data;
      if (!data.success) throw new Error(data.msg || 'Failed to fetch dashboard');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: connectedChannels, isLoading: channelsLoading } = useQuery<any, Error>({
    queryKey: ['connected-channels', user?.id],
    queryFn: async () => {
      // Resolve userId from Redux or localStorage (same as Settings page)
      let resolvedUserId: string | null = user?.id || null;
      if (!resolvedUserId) {
        try {
          const userLS = localStorage.getItem('user');
          const parsed = userLS ? JSON.parse(userLS) : null;
          resolvedUserId = parsed?.id || parsed?.uid || null;
        } catch {}
      }

      if (!resolvedUserId) return [];

      try {
        // Get auth token from localStorage (same approach as Settings page)
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

        // Use fetch with proper headers (same as Settings page)
        const response = await fetch(`/api/user/get_connected_accounts?user_id=${resolvedUserId}`, {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success && data.data) {
          // Deduplicate accounts (same logic as Settings page)
          const seen = new Set<string>();
          const deduplicated = (data.data || []).filter((account: any) => {
            const key = `${(account.platform || '').toLowerCase()}|${account.social_account_id || account.account_id || account.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          return Array.isArray(deduplicated) ? deduplicated : [];
        }

        // Fallback: Try direct backend calls if API route fails
        if (token) {
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

            // Deduplicate
            const seen = new Set<string>();
            const deduplicated = connectedAccounts.filter((account: any) => {
              const key = `${(account.platform || '').toLowerCase()}|${account.social_account_id || account.account_id || account.id}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });

            return deduplicated;
          } catch (directErr) {
            return [];
          }
        }

        return [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!(user?.id || typeof window !== 'undefined'),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading = dashboardLoading || channelsLoading;

  // Memoized stat cards with colorful green theme matching logo
  const statCards = useMemo(() => [
    {
      title: "Total Chats",
      value: dashboardData?.totalChats ?? 0,
      icon: "fas fa-comments",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border border-blue-200",
      iconColor: "text-blue-600 bg-blue-200"
    },
    {
      title: "Total Chatbots",
      value: dashboardData?.totalChatbots ?? 0,
      icon: "fas fa-robot",
      color: "bg-gradient-to-br from-green-50 to-emerald-100 text-green-700 border border-green-200",
      iconColor: "text-green-600 bg-green-200"
    },
    {
      title: "Total Contacts",
      value: dashboardData?.totalContacts ?? 0,
      icon: "fas fa-users",
      color: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border border-purple-200",
      iconColor: "text-purple-600 bg-purple-200"
    },
    {
      title: "Total Chatbot Flows",
      value: dashboardData?.totalFlows ?? 0,
      icon: "fas fa-project-diagram",
      color: "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border border-orange-200",
      iconColor: "text-orange-600 bg-orange-200"
    },
    {
      title: "Total Broadcasts",
      value: dashboardData?.totalBroadcasts ?? 0,
      icon: "fas fa-broadcast-tower",
      color: "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border border-red-200",
      iconColor: "text-red-600 bg-red-200"
    },
    {
      title: "Total Templates",
      value: dashboardData?.totalTemplates ?? dashboardData?.totalTemplets ?? 0,
      icon: "fas fa-file-alt",
      color: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200",
      iconColor: "text-indigo-600 bg-indigo-200"
    },
    {
      title: "Open Chats",
      value: dashboardData?.opened?.length ?? 0,
      icon: "fas fa-inbox",
      color: "bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-700 border border-cyan-200",
      iconColor: "text-cyan-600 bg-cyan-200"
    },
    {
      title: "Pending Chats",
      value: dashboardData?.pending?.length ?? 0,
      icon: "fas fa-hourglass-half",
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200",
      iconColor: "text-yellow-600 bg-yellow-200"
    },
    {
      title: "Resolved Chats",
      value: dashboardData?.resolved?.length ?? 0,
      icon: "fas fa-check-circle",
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200",
      iconColor: "text-emerald-600 bg-emerald-200"
    },
    {
      title: "Active Bots",
      value: dashboardData?.activeBot?.length ?? 0,
      icon: "fas fa-bolt",
      color: "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border border-green-200",
      iconColor: "text-green-600 bg-green-200"
    },
    {
      title: "Deactivated Bots",
      value: dashboardData?.dActiveBot?.length ?? 0,
      icon: "fas fa-power-off",
      color: "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border border-gray-200",
      iconColor: "text-gray-600 bg-gray-200"
    },
  ], [dashboardData]);

  // Memoized chart data
  const chartData = useMemo(() => [
    { label: 'Open', value: dashboardData?.opened?.length ?? 0, color: '#06b6d4' },
    { label: 'Pending', value: dashboardData?.pending?.length ?? 0, color: '#facc15' },
    { label: 'Resolved', value: dashboardData?.resolved?.length ?? 0, color: '#22a454' },
  ], [dashboardData]);

  // Memoized max chart value
  const maxChartValue = useMemo(() => 
    Math.max(...chartData.map(item => item.value), 1),
    [chartData]
  );

  // Memoized platform icons and colors with proper brand logos
  const platformConfig = useMemo(() => ({
    whatsapp: { 
      icon: faWhatsapp, 
      iconColor: '#25D366',
      color: 'bg-green-500', 
      textColor: 'text-green-700', 
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    messenger: { 
      icon: faFacebookMessenger, 
      iconColor: '#0084FF',
      color: 'bg-blue-500', 
      textColor: 'text-blue-700', 
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    },
    messanger: { 
      icon: faFacebookMessenger, 
      iconColor: '#0084FF',
      color: 'bg-blue-500', 
      textColor: 'text-blue-700', 
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    },
    instagram: { 
      icon: faInstagram, 
      iconColor: '#E1306C',
      color: 'bg-pink-500', 
      textColor: 'text-pink-700', 
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-300'
    },
    facebook: { 
      icon: faFacebook, 
      iconColor: '#1877F2',
      color: 'bg-blue-600', 
      textColor: 'text-blue-700', 
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    },
    google: { 
      icon: faGoogle, 
      iconColor: '#EA4335',
      color: 'bg-red-500', 
      textColor: 'text-red-700', 
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300'
    },
  }), []);

  const { data: googleStatus } = useQuery({
    queryKey: ['google-status'],
    queryFn: async () => {
      try {
        const response = await serverHandler.get('/api/google/status');
        return response.data?.data || { isConnected: false };
      } catch {
        return { isConnected: false };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      {isLoading ? (
        <>
          {/* Skeleton loading for stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 12 }, (_, index) => (
              <Card key={`skeleton-${index}`} className="p-2 border-0 shadow-sm">
                <CardContent className="flex items-center gap-3 p-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex flex-col space-y-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skeleton loading for chart */}
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-100">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`chart-skeleton-${index}`} className="flex items-center gap-4">
                  <div className="w-20 flex items-center gap-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex-1 relative h-7 flex items-center">
                    <Skeleton className="h-5 rounded-lg" style={{ width: `${Math.random() * 60 + 20}%` }} />
                    <Skeleton className="absolute right-0 h-3 w-6" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`legend-skeleton-${index}`} className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : error ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {statCards.map((card) => (
              <Card key={card.title} className={`p-2 ${card.color} shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className={`rounded-full p-2.5 ${card.iconColor} flex items-center justify-center shadow-sm`} style={{ minWidth: 40, minHeight: 40 }}>
                    <i className={`${card.icon} text-lg`}></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold leading-tight">{card.value}</span>
                    <span className="text-xs font-medium text-gray-600 mt-1">{card.title}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Connected Channels Section - Always Visible */}
          <div className="mt-8 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-xl shadow-lg border-2 border-green-200">
            <h3 className="text-xl font-bold mb-4 text-green-800 flex items-center gap-2">
              <i className="fas fa-plug text-green-600 text-2xl"></i>
              Connected Channels
            </h3>
            {channelsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border-2 border-gray-200 bg-white animate-pulse">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (connectedChannels && Array.isArray(connectedChannels) && connectedChannels.length > 0) || googleStatus?.isConnected ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Regular social channels */}
                {connectedChannels?.map((channel: any) => {
                  const platform = (channel.platform || '').toLowerCase();
                  const config = platformConfig[platform as keyof typeof platformConfig] || {
                    icon: faFacebookMessenger, // Fallback to messenger icon
                    iconColor: '#6B7280',
                    color: 'bg-gray-500',
                    textColor: 'text-gray-700',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-300'
                  };
                  
                  return (
                    <div
                      key={channel.id || channel.social_account_id}
                      className={`p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor} hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${config.color} text-white p-3 rounded-full shadow-md flex items-center justify-center`} style={{ minWidth: 48, minHeight: 48 }}>
                          <FontAwesomeIcon 
                            icon={config.icon} 
                            style={{ color: '#FFFFFF', fontSize: 24 }} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold ${config.textColor} truncate text-base`}>
                            {channel.account_name || channel.username || 'Unknown Account'}
                          </p>
                          <p className="text-xs text-gray-600 capitalize font-medium mt-1">
                            {channel.platform || 'Unknown'} Channel
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></span>
                          <span className="text-xs text-green-600 font-semibold">Active</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Google Business Profile */}
                {googleStatus?.isConnected && (
                  <div
                    className={`p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`bg-red-500 text-white p-3 rounded-full shadow-md flex items-center justify-center`} style={{ minWidth: 48, minHeight: 48 }}>
                        <FontAwesomeIcon 
                          icon={faGoogle} 
                          style={{ color: '#FFFFFF', fontSize: 24 }} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-red-700 truncate text-base`}>
                          {googleStatus.profile?.name}
                        </p>
                        <p className="text-xs text-gray-600 capitalize font-medium mt-1">
                          Google Business
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></span>
                        <span className="text-xs text-green-600 font-semibold">Active</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <i className="fas fa-plug text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-600 font-medium mb-2">No channels connected yet</p>
                <p className="text-sm text-gray-500">Connect your WhatsApp, Messenger, or Instagram accounts to get started</p>
              </div>
            )}
          </div>

          {/* Improved horizontal bar chart for open/pending/resolved chats */}
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border-2 border-gray-200">
            <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
              <i className="fas fa-chart-bar text-green-600"></i>
              Chat Status Overview
            </h3>
            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-20 flex items-center gap-2">
                    <span className="block w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }}></span>
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex-1 relative h-7 flex items-center">
                    <div
                      className="rounded-lg transition-all duration-500 shadow-md"
                      style={{
                        width: `${(item.value / maxChartValue) * 100}%`,
                        background: item.color,
                        minWidth: 12,
                        height: 18,
                      }}
                    ></div>
                    <span className="absolute right-0 text-xs font-semibold text-gray-800 pr-2">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 gap-4">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="block w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }}></span>
                  <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
