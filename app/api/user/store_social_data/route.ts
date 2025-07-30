import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, access_token, accounts, user_id } = body;

    if (!access_token || !platform) {
      return NextResponse.json({ 
        success: false, 
        message: "Access token and platform are required" 
      }, { status: 400 });
    }

    // Store social data in backend server directly
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    const storeResponse = await fetch(`${baseUrl}/api/user/store_social_connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        platform: platform,
        access_token: access_token,
        accounts: accounts || [],
        connected_at: new Date().toISOString(),
        status: 'active'
      }),
    });

    if (!storeResponse.ok) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to store social data"
      }, { status: 500 });
    }

    const storeData = await storeResponse.json();
    
    if (!storeData.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to store social data",
        error: storeData.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${platform} data stored successfully`,
      data: {
        platform: platform,
        accounts_count: accounts?.length || 0,
        user_id: user_id
      }
    });

  } catch (error: any) {
    console.error('Store social data error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to store social data",
      error: error.message 
    }, { status: 500 });
  }
} 