"use client"

import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { useQuery } from '@tanstack/react-query';
import serverHandler from "@/utils/api/enpointsUtils/serverHandler";
import { UserEndpoints } from "@/utils/api/enpointsUtils/Api-endpoints";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardView() {
  const { data: dashboardData, isLoading, error } = useQuery<any, Error>({
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

  const statCards = [
    {
      title: "Total Chats",
      value: dashboardData?.totalChats ?? 0,
      icon: "fas fa-comments",
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-500 bg-blue-100"
    },
    {
      title: "Total Chatbots",
      value: dashboardData?.totalChatbots ?? 0,
      icon: "fas fa-robot",
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500 bg-green-100"
    },
    {
      title: "Total Contacts",
      value: dashboardData?.totalContacts ?? 0,
      icon: "fas fa-users",
      color: "bg-purple-50 text-purple-700",
      iconColor: "text-purple-500 bg-purple-100"
    },
    {
      title: "Total Chatbot Flows",
      value: dashboardData?.totalFlows ?? 0,
      icon: "fas fa-project-diagram",
      color: "bg-orange-50 text-orange-700",
      iconColor: "text-orange-500 bg-orange-100"
    },
    {
      title: "Total Broadcasts",
      value: dashboardData?.totalBroadcasts ?? 0,
      icon: "fas fa-broadcast-tower",
      color: "bg-red-50 text-red-700",
      iconColor: "text-red-500 bg-red-100"
    },
    {
      title: "Total Templates",
      value: dashboardData?.totalTemplates ?? dashboardData?.totalTemplets ?? 0,
      icon: "fas fa-file-alt",
      color: "bg-indigo-50 text-indigo-700",
      iconColor: "text-indigo-500 bg-indigo-100"
    },
    {
      title: "Open Chats",
      value: dashboardData?.opened?.length ?? 0,
      icon: "fas fa-inbox",
      color: "bg-cyan-50 text-cyan-700",
      iconColor: "text-cyan-500 bg-cyan-100"
    },
    {
      title: "Pending Chats",
      value: dashboardData?.pending?.length ?? 0,
      icon: "fas fa-hourglass-half",
      color: "bg-yellow-50 text-yellow-700",
      iconColor: "text-yellow-500 bg-yellow-100"
    },
    {
      title: "Resolved Chats",
      value: dashboardData?.resolved?.length ?? 0,
      icon: "fas fa-check-circle",
      color: "bg-lime-50 text-lime-700",
      iconColor: "text-lime-500 bg-lime-100"
    },
    {
      title: "Active Bots",
      value: dashboardData?.activeBot?.length ?? 0,
      icon: "fas fa-bolt",
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500 bg-green-100"
    },
    {
      title: "Deactivated Bots",
      value: dashboardData?.dActiveBot?.length ?? 0,
      icon: "fas fa-power-off",
      color: "bg-gray-50 text-gray-700",
      iconColor: "text-gray-500 bg-gray-100"
    },
  ];

  // Example graph data: distribution of open, pending, resolved chats
  const chartData = [
    { label: 'Open', value: dashboardData?.opened?.length ?? 0, color: '#06b6d4' },
    { label: 'Pending', value: dashboardData?.pending?.length ?? 0, color: '#facc15' },
    { label: 'Resolved', value: dashboardData?.resolved?.length ?? 0, color: '#84cc16' },
  ];

  // Find the max value for scaling
  const maxChartValue = Math.max(...chartData.map(item => item.value), 1);

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
              <Card key={card.title} className={`p-2 ${card.color} border-0 shadow-sm`}>
                <CardContent className="flex items-center gap-3 p-3">
                  <div className={`rounded-full p-2 ${card.iconColor} flex items-center justify-center`} style={{ minWidth: 36, minHeight: 36 }}>
                    <i className={`${card.icon} text-lg`}></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold leading-tight">{card.value}</span>
                    <span className="text-xs font-medium text-gray-500 mt-1">{card.title}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Improved horizontal bar chart for open/pending/resolved chats */}
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold mb-6 text-gray-700">Chat Status Overview</h3>
            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-20 flex items-center gap-2">
                    <span className="block w-3 h-3 rounded-full" style={{ background: item.color }}></span>
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex-1 relative h-7 flex items-center">
                    <div
                      className="rounded-lg transition-all duration-500"
                      style={{
                        width: `${(item.value / maxChartValue) * 100}%`,
                        background: item.color,
                        minWidth: 12,
                        height: 18,
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)'
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
                  <span className="block w-3 h-3 rounded-full" style={{ background: item.color }}></span>
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
