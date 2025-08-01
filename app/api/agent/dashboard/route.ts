import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Extract token
    const token = authHeader.substring(7)

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if token is for an agent
    if (decoded.role !== 'AGENT') {
      return NextResponse.json(
        { success: false, message: 'Invalid token type' },
        { status: 401 }
      )
    }

    // Mock dashboard data
    const dashboardData = {
      stats: {
        totalConversations: 156,
        activeSessions: 12,
        responseRate: 96,
        avgResponseTime: 1.8
      },
      recentConversations: [
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
        }
      ],
      notifications: [
        {
          id: 1,
          type: "info",
          message: "New conversation assigned",
          time: "2 minutes ago"
        },
        {
          id: 2,
          type: "success",
          message: "Task completed",
          time: "15 minutes ago"
        },
        {
          id: 3,
          type: "warning",
          message: "High priority chat",
          time: "1 hour ago"
        }
      ],
      quickActions: [
        { title: "View All Chats", icon: "fas fa-comments", color: "bg-blue-500" },
        { title: "Active Sessions", icon: "fas fa-headphones", color: "bg-green-500" },
        { title: "My Tasks", icon: "fas fa-tasks", color: "bg-purple-500" },
        { title: "Profile Settings", icon: "fas fa-user-cog", color: "bg-orange-500" }
      ]
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    })

  } catch (error) {
    console.error('Agent dashboard error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 