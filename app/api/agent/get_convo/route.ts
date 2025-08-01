import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock data - replace with database
const mockConversations = [
  {
    id: 1,
    uid: "chat_uid_123",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    platform: "facebook",
    status: "active",
    priority: "high"
  },
  {
    id: 2,
    uid: "chat_uid_124",
    customer_name: "Sarah Wilson",
    customer_email: "sarah@example.com",
    platform: "whatsapp",
    status: "resolved",
    priority: "medium"
  },
  {
    id: 3,
    uid: "chat_uid_125",
    customer_name: "Mike Johnson",
    customer_email: "mike@example.com",
    platform: "instagram",
    status: "pending",
    priority: "high"
  }
]

const mockMessages = {
  "chat_uid_123": [
    {
      id: 1,
      content: "Hello, I need help with my order",
      type: "text",
      direction: "incoming",
      timestamp: "2024-01-01T00:00:00.000Z"
    },
    {
      id: 2,
      content: "Hi! I'd be happy to help you. Can you provide your order number?",
      type: "text",
      direction: "outgoing",
      timestamp: "2024-01-01T00:01:00.000Z"
    },
    {
      id: 3,
      content: "Yes, it's #12345",
      type: "text",
      direction: "incoming",
      timestamp: "2024-01-01T00:02:00.000Z"
    }
  ],
  "chat_uid_124": [
    {
      id: 1,
      content: "Thank you for your help!",
      type: "text",
      direction: "incoming",
      timestamp: "2024-01-01T00:00:00.000Z"
    },
    {
      id: 2,
      content: "You're welcome! Is there anything else I can help you with?",
      type: "text",
      direction: "outgoing",
      timestamp: "2024-01-01T00:01:00.000Z"
    }
  ],
  "chat_uid_125": [
    {
      id: 1,
      content: "Can you check my delivery status?",
      type: "text",
      direction: "incoming",
      timestamp: "2024-01-01T00:00:00.000Z"
    }
  ]
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { chatId } = body

    if (!chatId) {
      return NextResponse.json({ success: false, message: 'Chat ID is required' }, { status: 400 })
    }

    // Find the conversation
    const conversation = mockConversations.find(chat => chat.uid === chatId)
    if (!conversation) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 })
    }

    // Get messages for this conversation
    const messages = mockMessages[chatId as keyof typeof mockMessages] || []

    return NextResponse.json({
      success: true,
      data: {
        chat: conversation,
        messages: messages
      },
      message: 'Conversation details retrieved successfully'
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 