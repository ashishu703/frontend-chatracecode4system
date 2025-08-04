import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, host, password, port, to } = body

    // Validate required fields
    if (!email || !host || !password || !port || !to) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: email, host, password, port, to'
      }, { status: 400 })
    }

    // Trim whitespace from all fields
    const trimmedEmail = email.trim()
    const trimmedHost = host.trim()
    const trimmedPassword = password.trim()
    const trimmedPort = port.trim()
    const trimmedTo = to.trim()

    // Validate host format
    if (!trimmedHost.includes('.')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid host format. Host should be a valid domain (e.g., smtp.gmail.com)'
      }, { status: 400 })
    }

    // Import nodemailer using dynamic import
    let nodemailer
    try {
      const nodemailerModule = await import('nodemailer')
      nodemailer = nodemailerModule.default || nodemailerModule
    } catch (importError: any) {
      console.error('Failed to import nodemailer:', importError)
      return NextResponse.json({
        success: false,
        message: 'Failed to load nodemailer module',
        err: importError.message
      }, { status: 500 })
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: trimmedHost,
      port: parseInt(trimmedPort),
      secure: trimmedPort === '465', // true for 465, false for other ports
      auth: {
        user: trimmedEmail,
        pass: trimmedPassword,
      },
    })

    // Verify connection configuration
    await transporter.verify()

    // Send test email
    const info = await transporter.sendMail({
      from: trimmedEmail,
      to: trimmedTo,
      subject: 'Test Email from ChatRace Admin Panel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email sent from the ChatRace Admin Panel.</p>
          <p><strong>SMTP Configuration:</strong></p>
          <ul>
            <li>Host: ${trimmedHost}</li>
            <li>Port: ${trimmedPort}</li>
            <li>Email: ${trimmedEmail}</li>
          </ul>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId
    })

  } catch (error: any) {
    console.error('Error sending test email:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to send test email',
      err: error.message
    }, { status: 500 })
  }
} 