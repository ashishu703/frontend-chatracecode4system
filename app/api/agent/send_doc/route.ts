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
    const document = formData.get('document') as File

    if (!chatId) {
      return NextResponse.json({ success: false, message: 'Chat ID is required' }, { status: 400 })
    }

    if (!document) {
      return NextResponse.json({ success: false, message: 'Document file is required' }, { status: 400 })
    }

    // Validate file type (common document formats)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/rtf'
    ]

    if (!allowedTypes.includes(document.type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid file type. Only PDF, Word, Excel, and text files are allowed' 
      }, { status: 400 })
    }

    // Validate file size (e.g., max 20MB)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (document.size > maxSize) {
      return NextResponse.json({ success: false, message: 'File size too large. Maximum size is 20MB' }, { status: 400 })
    }

    // In real implementation, you would:
    // 1. Validate that the agent has access to this chat
    // 2. Upload the document to a cloud storage service
    // 3. Save the message with document URL to the database
    // 4. Send the document to the appropriate platform (Facebook, WhatsApp, etc.)
    // 5. Update the chat status if needed

    console.log(`Agent ${decoded.uid} sent document to chat ${chatId}: ${document.name} (${document.size} bytes)`)

    return NextResponse.json({
      success: true,
      msg: "chat_status_updated",
      message: 'Document sent successfully'
    })
  } catch (error) {
    console.error('Send document error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
} 