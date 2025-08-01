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

    const formData = await request.formData()
    const chatId = formData.get('chatId') as string
    const video = formData.get('video') as File

    if (!chatId) {
      return NextResponse.json({ success: false, message: 'Chat ID is required' }, { status: 400 })
    }

    if (!video) {
      return NextResponse.json({ success: false, message: 'Video file is required' }, { status: 400 })
    }

    // Validate file type
    if (!video.type.startsWith('video/')) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Only video files are allowed' }, { status: 400 })
    }

    // Validate file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (video.size > maxSize) {
      return NextResponse.json({ success: false, message: 'File size too large. Maximum size is 50MB' }, { status: 400 })
    }

    // In real implementation, you would:
    // 1. Validate that the agent has access to this chat
    // 2. Upload the video to a cloud storage service
    // 3. Save the message with video URL to the database
    // 4. Send the video to the appropriate platform (Facebook, WhatsApp, etc.)
    // 5. Update the chat status if needed

    console.log(`Agent ${decoded.uid} sent video to chat ${chatId}: ${video.name} (${video.size} bytes)`)

    return NextResponse.json({
      success: true,
      msg: "chat_status_updated",
      message: 'Video sent successfully'
    })
  } catch (error) {
    console.error('Send video error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 