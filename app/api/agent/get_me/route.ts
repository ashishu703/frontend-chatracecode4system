import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock agent data - replace with database
const mockAgents = [
  {
    uid: "agent_uid_123",
    name: "John Agent",
    email: "agent@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    mobile: "+1234567890",
    is_active: 1,
    comments: "Senior support agent",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  },
  {
    uid: "agent_uid_124",
    name: "Sarah Agent",
    email: "sarah@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    mobile: "+1234567891",
    is_active: 1,
    comments: "Customer service specialist",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  }
]

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

    // Find agent by UID
    const agent = mockAgents.find(a => a.uid === decoded.uid)
    if (!agent) {
      return NextResponse.json(
        { success: false, message: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if agent is active
    if (agent.is_active !== 1) {
      return NextResponse.json(
        { success: false, message: 'Account is inactive' },
        { status: 401 }
      )
    }

    // Return agent data (without password)
    const { password, ...agentData } = agent

    return NextResponse.json({
      success: true,
      data: agentData,
      message: 'Agent profile retrieved successfully'
    })

  } catch (error) {
    console.error('Get agent profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 