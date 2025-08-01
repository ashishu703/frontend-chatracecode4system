import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock data - replace with database
const mockAssignedChats = [
  {
    id: 1,
    uid: "chat_uid_123",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    platform: "facebook",
    status: "active",
    last_message: "Hello, I need help with my order",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    priority: "high",
    unread_count: 2
  },
  {
    id: 2,
    uid: "chat_uid_124",
    customer_name: "Sarah Wilson",
    customer_email: "sarah@example.com",
    platform: "whatsapp",
    status: "resolved",
    last_message: "Thank you for your help!",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    priority: "medium",
    unread_count: 0
  },
  {
    id: 3,
    uid: "chat_uid_125",
    customer_name: "Mike Johnson",
    customer_email: "mike@example.com",
    platform: "instagram",
    status: "pending",
    last_message: "Can you check my delivery status?",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    priority: "high",
    unread_count: 1
  }
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    if (decoded.role !== 'AGENT') {
      return NextResponse.json({ success: false, message: 'Access denied: Not an agent' }, { status: 403 })
    }

    // Filter chats assigned to this agent (in real implementation, you'd query by agent_id)
    const assignedChats = mockAssignedChats.filter(chat => {
      // For now, return all chats. In real implementation, filter by agent assignment
      return true
    })

    return NextResponse.json({ 
      success: true, 
      data: assignedChats, 
      message: 'Assigned chats retrieved successfully' 
    })
  } catch (error) {
    console.error('Get assigned chats error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 