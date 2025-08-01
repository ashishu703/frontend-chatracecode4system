import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
    const { chatId, message } = body

    if (!chatId) {
      return NextResponse.json({ success: false, message: 'Chat ID is required' }, { status: 400 })
    }

    if (!message || message.trim() === '') {
      return NextResponse.json({ success: false, message: 'Message content is required' }, { status: 400 })
    }

    // In real implementation, you would:
    // 1. Validate that the agent has access to this chat
    // 2. Save the message to the database
    // 3. Send the message to the appropriate platform (Facebook, WhatsApp, etc.)
    // 4. Update the chat status if needed

    console.log(`Agent ${decoded.uid} sent message to chat ${chatId}: ${message}`)

    return NextResponse.json({
      success: true,
      msg: "chat_status_updated",
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Send text message error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 