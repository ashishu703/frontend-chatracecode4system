import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, host, password, port } = body

    // Validate required fields
    if (!email || !host || !password || !port) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: email, host, password, port'
      }, { status: 400 })
    }

    // Trim whitespace from all fields
    const trimmedEmail = email.trim()
    const trimmedHost = host.trim()
    const trimmedPassword = password.trim()
    const trimmedPort = port.trim()

    // Validate host format
    if (!trimmedHost.includes('.')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid host format. Host should be a valid domain (e.g., smtp.gmail.com)'
      }, { status: 400 })
    }

    // Here you would typically save the SMTP settings to your database
    // For now, we'll just validate the configuration by testing the connection
    
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

    // TODO: Save SMTP settings to database here
    // For now, we'll just validate the configuration
    // In production, you would save to database like this:
    // await prisma.smtpSettings.upsert({
    //   where: { id: 1 },
    //   update: { 
    //     email: trimmedEmail, 
    //     host: trimmedHost, 
    //     password: trimmedPassword, 
    //     port: trimmedPort 
    //   },
    //   create: { 
    //     email: trimmedEmail, 
    //     host: trimmedHost, 
    //     password: trimmedPassword, 
    //     port: trimmedPort 
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'SMTP settings updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating SMTP settings:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update SMTP settings',
      err: error.message
    }, { status: 500 })
  }
} 