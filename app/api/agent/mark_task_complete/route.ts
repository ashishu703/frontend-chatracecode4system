import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock data - replace with database
let mockTasks = [
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
    const { id, comment } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'Task ID is required' }, { status: 400 })
    }

    // Find the task
    const taskIndex = mockTasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 })
    }

    // Update the task status
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      status: 'completed',
      comment: comment || undefined,
      completed_at: new Date().toISOString()
    }

    console.log(`Agent ${decoded.uid} marked task ${id} as complete`)

    return NextResponse.json({
      success: true,
      msg: "task_updated",
      message: 'Task marked as completed successfully'
    })
  } catch (error) {
    console.error('Mark task complete error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 