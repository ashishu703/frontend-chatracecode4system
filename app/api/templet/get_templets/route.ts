import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const size = searchParams.get('size') || '10'
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    // Build query parameters for the backend API
    const queryParams = new URLSearchParams({
      page,
      size,
      search,
      sort,
      order
    })

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:6400'
    const apiUrl = `${backendUrl}/api/templet/get_templets?${queryParams}`

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
      method: 'GET',
      headers,
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
    console.error('Error in get_templets API:', error)
    return NextResponse.json(
      { 
        success: false, 
        msg: "Failed to fetch templates",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
} 