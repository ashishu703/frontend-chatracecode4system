"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Bot, TrendingUp, Activity, Bell, LogOut, Settings } from 'lucide-react'
import Image from "next/image"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/store"
import { toggleSidebar, setSidebarOpen } from "@/store/slices/uiSlice"
import { setCurrentView } from "@/store/slices/dashboardSlice"
import Sidebar from "@/components/dashboard/Sidebar"
import DashboardView from "@/components/dashboard/DashboardView"
import InboxView from "@/components/dashboard/InboxView"
import ContactsManagement from "@/components/dashboard/ContactsManagement"
import BroadcastView from "@/components/dashboard/BroadcastView"
import { BroadcastTemplateBuilder } from "@/components/dashboard/BroadcastView/CreateTemplatePage"
import ChatbotView from "@/components/dashboard/ChatbotView"
import ReviewManagementView from "@/components/dashboard/ReviewManagementView"
import FeaturesView from "@/components/dashboard/FeaturesView";
import { FlowBuilder } from "@/components/flow-integration/flow-builder"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import AllFlowsPage from "@/components/dashboard/allflows"
import AllTemplatesPage from "@/components/flow-integration/alltemplates"
import AutomationToolsView from "@/components/dashboard/AutomationTools/AutomationToolsView"
import SettingsView from "@/components/dashboard/SettingsView"
import EcommerceView from "@/components/ecommerce/EcommerceView"
import { UserEndpoints } from "@/utils/api/enpointsUtils/Api-endpoints"

const stats = [
  { title: "Total Messages", value: "3,196", change: "+12%", icon: MessageSquare },
  { title: "Active Bots", value: "8", change: "+2", icon: Bot },
  { title: "Response Rate", value: "94%", change: "+3%", icon: TrendingUp },
  { title: "Avg Response Time", value: "2.3s", change: "-0.5s", icon: Activity },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { logout } = useAuth();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { currentView } = useSelector((state: RootState) => state.dashboard);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showBackAsAdmin, setShowBackAsAdmin] = useState(false);
  const [showLoginAsAdmin, setShowLoginAsAdmin] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const autoCollapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-collapse sidebar on smaller screens and on mouse leave
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint (1024px)
        if (sidebarOpen) {
          dispatch(setSidebarOpen(false));
        }
      }
    };

    // Check on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, dispatch]);

  // Auto-collapse on mouse leave (with delay) - only on desktop
  useEffect(() => {
    // Only enable auto-collapse on desktop screens
    if (window.innerWidth < 1024) return;

    const handleMouseLeave = () => {
      // Clear existing timeout
      if (autoCollapseTimeoutRef.current) {
        clearTimeout(autoCollapseTimeoutRef.current);
      }
      
      // Set timeout to collapse after 800ms
      autoCollapseTimeoutRef.current = setTimeout(() => {
        // Only collapse if still on desktop and sidebar is open
        if (window.innerWidth >= 1024 && sidebarOpen) {
          dispatch(setSidebarOpen(false));
        }
      }, 800);
    };

    const handleMouseEnter = () => {
      // Clear timeout when mouse enters sidebar
      if (autoCollapseTimeoutRef.current) {
        clearTimeout(autoCollapseTimeoutRef.current);
        autoCollapseTimeoutRef.current = null;
      }
    };

    const sidebarElement = sidebarRef.current;
    if (sidebarElement && sidebarOpen) {
      sidebarElement.addEventListener('mouseleave', handleMouseLeave);
      sidebarElement.addEventListener('mouseenter', handleMouseEnter);
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener('mouseleave', handleMouseLeave);
        sidebarElement.removeEventListener('mouseenter', handleMouseEnter);
      }
      if (autoCollapseTimeoutRef.current) {
        clearTimeout(autoCollapseTimeoutRef.current);
      }
    };
  }, [sidebarOpen, dispatch]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Fetch dashboard data only if not already loaded
        if (!dashboardData) {
          setLoading(true);
          setError(undefined);
          try {
            const res = await serverHandler.get(UserEndpoints.USER_DASHBOARD);
            setDashboardData((res.data as any).data);
          } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard data');
          } finally {
            setLoading(false);
          }
        }

        // Set admin options
        const hasAdminToken = !!localStorage.getItem('adminToken');
        setShowBackAsAdmin(hasAdminToken);
        setShowLoginAsAdmin(!!(user && user.username && localStorage.getItem('role') === 'user' && hasAdminToken));

        // Handle OAuth tokens in URL
        try {
          const url = new URL(window.location.href);
          const oauthToken = url.searchParams.get('token');
          if (oauthToken) {
            localStorage.setItem('serviceToken', oauthToken);
            localStorage.setItem('role', 'user');
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.toString());
          }
        } catch (error) {
          console.error('OAuth token handling error:', error);
        }

      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError('Failed to initialize dashboard');
        setLoading(false);
      }
    };

    // Only initialize if user is available
    if (user) {
      initializeDashboard();
    }
  }, [user, dashboardData]);

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="min-h-screen ">
            <div className="container mx-auto px-4 py-8">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Welcome back! 👋</h1>
                <p className="text-gray-600">Here's what's happening with your automation today</p>
              </div>
              {loading ? (
                <div className="text-center py-10">Loading dashboard...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-10">{error}</div>
              ) : (
                <DashboardView />
              )}
            </div>
          </div>
        )
      case "inbox":
        return <InboxView />
      case "contacts":
        return <ContactsManagement />
      case "broadcast":
        return <BroadcastView />
      case "template":
        return <BroadcastView />
      case "create-template":
        return <BroadcastTemplateBuilder />
      case "chatbot":
        return <ChatbotView />
      case "reviews":
        return <ReviewManagementView />
      case "features":
        return <FeaturesView />
      case "flows":
        return <FlowBuilder />
      case "allflows":
        return <AllFlowsPage />
      case "templates":
        return <AllTemplatesPage />
      case "automation":
        return <AutomationToolsView />
      case "settings":
        return <SettingsView />
      case "ecommerce":
      case "ecommerce-overview":
      case "ecommerce-catalogs":
      case "ecommerce-products":
      case "ecommerce-orders":
      case "ecommerce-payments":
      case "ecommerce-commerce-settings":
      case "ecommerce-order-settings":
        return <EcommerceView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <div ref={sidebarRef}>
        <Sidebar />
      </div>

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"} flex flex-col min-w-0`}> 
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-bars text-gray-600"></i>
              </button>
              <h1 className="text-2xl font-bold text-gray-800 capitalize">{currentView}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <i className="fas fa-bell text-gray-600"></i>
              </button>
              <div className="relative">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                  onClick={() => setUserMenuOpen((v) => !v)}
                >
                  <i className="fas fa-user-circle text-gray-600 text-xl"></i>
                  {user?.username && <span className="ml-2 text-gray-800 font-medium text-sm">{user.username}</span>}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { setUserMenuOpen(false); router.push('/profile'); }}
                    >
                      <i className="fas fa-user-cog mr-2"></i>Profile Settings
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { setUserMenuOpen(false); router.push('/plans'); }}
                    >
                      <i className="fas fa-crown mr-2"></i>Subscribe a Plan
                    </button>
                    {showBackAsAdmin && (
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setUserMenuOpen(false);
                          localStorage.removeItem('serviceToken');
                          localStorage.setItem('role', 'admin');
                          window.location.href = '/admin/dashboard';
                        }}
                      >
                        <i className="fas fa-arrow-left mr-2"></i>Back as Admin
                      </button>
                    )}
                    {showLoginAsAdmin && (
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                        onClick={() => {
                          setUserMenuOpen(false);
                          const adminToken = localStorage.getItem('adminToken');
                          if (adminToken) {
                            localStorage.setItem('serviceToken', adminToken);
                            localStorage.setItem('role', 'admin');
                            window.location.href = '/admin/dashboard';
                          }
                        }}
                      >
                        <i className="fas fa-user-shield mr-2"></i>Login as Admin
                      </button>
                    )}
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        router.push('/login');
                      }}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-y-auto no-scrollbar flex-1 min-w-0">{renderCurrentView()}</main>
      </div>
    </div>
  )
}
