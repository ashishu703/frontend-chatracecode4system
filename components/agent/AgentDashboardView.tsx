"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Bot, TrendingUp, Activity, Clock, Users, CheckCircle } from 'lucide-react'

const stats = [
  { title: "Total Conversations", value: "156", change: "+8%", icon: MessageSquare, color: "text-blue-600" },
  { title: "Active Sessions", value: "12", change: "+2", icon: Bot, color: "text-green-600" },
  { title: "Response Rate", value: "96%", change: "+2%", icon: TrendingUp, color: "text-purple-600" },
  { title: "Avg Response Time", value: "1.8s", change: "-0.3s", icon: Activity, color: "text-orange-600" },
]

const recentConversations = [
  {
    id: 1,
    customer: "John Doe",
    platform: "Facebook",
    lastMessage: "Hello, I need help with my order",
    time: "2 min ago",
    status: "active",
    priority: "high"
  },
  {
    id: 2,
    customer: "Sarah Wilson",
    platform: "WhatsApp",
    lastMessage: "Thank you for your help!",
    time: "15 min ago",
    status: "resolved",
    priority: "medium"
  },
  {
    id: 3,
    customer: "Mike Johnson",
    platform: "Instagram",
    lastMessage: "Can you check my delivery status?",
    time: "1 hour ago",
    status: "pending",
    priority: "high"
  },
  {
    id: 4,
    customer: "Emily Brown",
    platform: "Facebook",
    lastMessage: "I have a question about returns",
    time: "2 hours ago",
    status: "active",
    priority: "low"
  }
]

const quickActions = [
  { title: "View All Chats", icon: "fas fa-comments", color: "bg-blue-500", href: "/agent/inbox" },
  { title: "Active Sessions", icon: "fas fa-headphones", color: "bg-green-500", href: "/agent/sessions" },
  { title: "My Tasks", icon: "fas fa-tasks", color: "bg-purple-500", href: "/agent/tasks" },
  { title: "Profile Settings", icon: "fas fa-user-cog", color: "bg-orange-500", href: "/agent/profile" }
]

export default function AgentDashboardView({ data }: { data?: any }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-bolt text-yellow-500"></i>
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3`}>
                    <i className={`${action.icon} text-white text-lg`}></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="fas fa-comments text-blue-500"></i>
                <span>Recent Conversations</span>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-600"></i>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{conversation.customer}</h4>
                        <Badge variant={conversation.status === 'active' ? 'default' : conversation.status === 'resolved' ? 'secondary' : 'outline'}>
                          {conversation.status}
                        </Badge>
                        <Badge variant={conversation.priority === 'high' ? 'destructive' : conversation.priority === 'medium' ? 'default' : 'secondary'}>
                          {conversation.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{conversation.lastMessage}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <i className="fas fa-globe text-gray-400 text-xs"></i>
                        <span className="text-xs text-gray-500">{conversation.platform}</span>
                        <i className="fas fa-clock text-gray-400 text-xs"></i>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <i className="fas fa-reply mr-1"></i>
                      Reply
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-chart-line text-green-500"></i>
              <span>Today's Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversations Handled</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="font-semibold text-green-600">1.8s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="font-semibold text-green-600">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-tasks text-blue-500"></i>
              <span>Pending Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm">Follow up with customer</span>
                <Badge variant="outline">High</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm">Review feedback</span>
                <Badge variant="outline">Medium</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">Update documentation</span>
                <Badge variant="outline">Low</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-bell text-orange-500"></i>
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-2 bg-blue-50 rounded">
                <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                <div>
                  <p className="text-sm font-medium">New conversation assigned</p>
                  <p className="text-xs text-gray-600">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2 bg-green-50 rounded">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <div>
                  <p className="text-sm font-medium">Task completed</p>
                  <p className="text-xs text-gray-600">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2 bg-yellow-50 rounded">
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
                <div>
                  <p className="text-sm font-medium">High priority chat</p>
                  <p className="text-xs text-gray-600">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 