import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock data - replace with database
const mockTasks = [
  {
    id: 1,
    title: "Follow up with customer",
    description: "Contact customer about their inquiry regarding order #12345",
    status: "pending",
    priority: "high",
    due_date: "2024-01-15T00:00:00.000Z",
    created_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    title: "Review support ticket",
    description: "Review and respond to support ticket #67890",
    status: "completed",
    priority: "medium",
    due_date: "2024-01-10T00:00:00.000Z",
    created_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    title: "Update documentation",
    description: "Update FAQ section with new product information",
    status: "pending",
    priority: "low",
    due_date: "2024-01-20T00:00:00.000Z",
    created_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    title: "Customer satisfaction survey",
    description: "Conduct follow-up survey with recent customers",
    status: "pending",
    priority: "medium",
    due_date: "2024-01-18T00:00:00.000Z",
    created_at: "2024-01-01T00:00:00.000Z"
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

    // Filter tasks assigned to this agent (in real implementation, you'd query by agent_id)
    const assignedTasks = mockTasks.filter(task => {
      // For now, return all tasks. In real implementation, filter by agent assignment
      return true
    })

    return NextResponse.json({ 
      success: true, 
      data: assignedTasks, 
      message: 'Tasks retrieved successfully' 
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 