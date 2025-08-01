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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find agent by email
    const agent = mockAgents.find(a => a.email === email)
    if (!agent) {
      return NextResponse.json(
        { success: false, message: 'No agent found with this email' },
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

    // Generate recovery token
    const recoveryToken = jwt.sign(
      {
        uid: agent.uid,
        email: agent.email,
        type: 'recovery'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // In a real application, you would send an email here
    // For now, we'll just log the token
    console.log('Recovery token for', email, ':', recoveryToken)

    return NextResponse.json({
      success: true,
      message: 'Recovery email sent successfully. Please check your inbox.'
    })

  } catch (error) {
    console.error('Agent recovery error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 