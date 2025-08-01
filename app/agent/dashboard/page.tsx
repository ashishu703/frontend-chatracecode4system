"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Bot,
  TrendingUp,
  Activity,
  Bell,
  LogOut,
  Settings,
  Menu,
  Home,
  Inbox,
  CheckSquare,
  User,
  ChevronDown,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/store"
import { toggleSidebar } from "@/store/slices/uiSlice"
import { setCurrentView } from "@/store/slices/agentDashboardSlice"
import AgentSidebar from "@/components/agent/AgentSidebar"
import { useAgentAuth } from '@/hooks/useAgentAuth';
import { useRouter } from 'next/navigation';

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

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  icon: any;
}

interface DashboardData {
  stats: DashboardStat[];
  recentActivity: string[];
  tasks: any[];
}

export default function AgentDashboard() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { logout } = useAgentAuth()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const { currentView } = useSelector((state: RootState) => state.agentDashboard)
  const agent = useSelector((state: RootState) => state.agentAuth.agent)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Simulate data loading
    const fetchDashboard = async () => {
      setLoading(true)
      setError(undefined)
      try {
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setDashboardData({
          stats: [
            { title: "Total Conversations", value: "0", change: "0%", icon: MessageSquare },
            { title: "Active Sessions", value: "0", change: "0", icon: Bot },
            { title: "Response Rate", value: "0%", change: "0%", icon: TrendingUp },
            { title: "Avg Response Time", value: "0s", change: "0s", icon: Activity },
          ],
          recentActivity: [],
          tasks: [],
        })
      } catch (err) {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {dashboardData?.stats?.map((stat: DashboardStat, index: number) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <p className="text-sm text-muted-foreground">{activity}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const InboxView = () => (
    <div className="space-y-6">
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Inbox functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const TasksView = () => (
    <div className="space-y-6">
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Tasks functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />
      case "inbox":
        return <InboxView />
      case "tasks":
        return <TasksView />
      default:
        return <DashboardView />
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/agent/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AgentSidebar />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
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
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <i className="fas fa-user-shield text-gray-600 text-xl"></i>
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-destructive">
                <p className="text-lg font-medium mb-2">Error</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {renderCurrentView()}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
