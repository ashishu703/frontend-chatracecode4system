import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock agent data - replace with database
let mockAgents = [
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
  }
]

function generateUID() {
  return 'agent_uid_' + Math.random().toString(36).substr(2, 9)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, mobile, comments } = body

    // Validate input
    if (!name || !email || !password || !mobile) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password, and mobile are required' },
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

    // Check if email already exists
    const existingAgent = mockAgents.find(agent => agent.email === email)
    if (existingAgent) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate unique UID
    const uid = generateUID()

    // Create new agent
    const newAgent = {
      uid,
      name,
      email,
      password: hashedPassword,
      mobile,
      is_active: 1,
      comments: comments || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add to mock data (in real app, save to database)
    mockAgents.push(newAgent)

    // Return success response (without password)
    const { password: _, ...agentResponse } = newAgent

    return NextResponse.json({
      success: true,
      data: agentResponse,
      message: 'Agent registered successfully'
    })

  } catch (error) {
    console.error('Agent registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 