import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, flowId } = body

    if (!id || !flowId) {
      return NextResponse.json(
        { success: false, msg: 'ID and Flow ID are required' },
        { status: 400 }
      )
    }

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:6400'
    const apiUrl = `${backendUrl}/api/chat_flow/del_flow`

    console.log('Calling backend API:', apiUrl)

    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Add cookie header if present (for session-based auth)
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, flowId }),
      credentials: 'include', // Include cookies in the request
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: errorText
      })
      
      throw new Error(`Backend API responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    // Log successful response for debugging
    console.log('Backend API response:', data)
    
    // Return the data from your backend server
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in del_flow API:', error)
    return NextResponse.json(
      { 
        success: false, 
        msg: "Failed to delete flow",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
} 