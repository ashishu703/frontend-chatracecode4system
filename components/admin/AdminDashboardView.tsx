"use client"

import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface AdminDashboardData {
  success: boolean;
  paidSignupsByMonth: Array<{
    month: string;
    numberOfSignups: number;
    userEmails: string[];
    paid: boolean;
  }>;
  unpaidSignupsByMonth: Array<{
    month: string;
    numberOfSignups: number;
    userEmails: string[];
    paid: boolean;
  }>;
  ordersByMonth: Array<{
    month: string;
    numberOfOders: number;
    totalOrders: number;
  }>;
  totalUsers: number;
  totalContacts: number;
}

export default function AdminDashboardView({ data }: { data: AdminDashboardData | null }) {
  if (!data) return null;

  // Calculate totals
  const totalOrders = data.ordersByMonth.reduce((sum, month) => sum + month.numberOfOders, 0);
  const totalPaidSignups = data.paidSignupsByMonth.reduce((sum, month) => sum + month.numberOfSignups, 0);
  const totalUnpaidSignups = data.unpaidSignupsByMonth.reduce((sum, month) => sum + month.numberOfSignups, 0);

  const statCards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: "fas fa-users",
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-500 bg-blue-100"
    },
    {
      title: "Total Contacts",
      value: data.totalContacts,
      icon: "fas fa-address-book",
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500 bg-green-100"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: "fas fa-shopping-cart",
      color: "bg-purple-50 text-purple-700",
      iconColor: "text-purple-500 bg-purple-100"
    },
    {
      title: "Paid Signups",
      value: totalPaidSignups,
      icon: "fas fa-user-check",
      color: "bg-orange-50 text-orange-700",
      iconColor: "text-orange-500 bg-orange-100"
    },
    {
      title: "Unpaid Signups",
      value: totalUnpaidSignups,
      icon: "fas fa-user-clock",
      color: "bg-red-50 text-red-700",
      iconColor: "text-red-500 bg-red-100"
    },
    {
      title: "Total Revenue",
      value: totalPaidSignups * 1000, // Assuming 1000 per paid signup
      icon: "fas fa-rupee-sign",
      color: "bg-indigo-50 text-indigo-700",
      iconColor: "text-indigo-500 bg-indigo-100"
    },
    {
      title: "Active Plans",
      value: totalPaidSignups,
      icon: "fas fa-credit-card",
      color: "bg-cyan-50 text-cyan-700",
      iconColor: "text-cyan-500 bg-cyan-100"
    },
    {
      title: "Pending Orders",
      value: totalUnpaidSignups,
      icon: "fas fa-hourglass-half",
      color: "bg-yellow-50 text-yellow-700",
      iconColor: "text-yellow-500 bg-yellow-100"
    },
    {
      title: "Completed Orders",
      value: totalPaidSignups,
      icon: "fas fa-check-circle",
      color: "bg-lime-50 text-lime-700",
      iconColor: "text-lime-500 bg-lime-100"
    },
    {
      title: "System Health",
      value: "100%",
      icon: "fas fa-heartbeat",
      color: "bg-gray-50 text-gray-700",
      iconColor: "text-gray-500 bg-gray-100"
    },
  ];

  return (
    <div className="space-y-8">
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
    </div>
  );
}
