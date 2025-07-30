import { NextRequest, NextResponse } from 'next/server';
import serverHandler from '@/utils/serverHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, instagram_accounts, user_id } = body;

    if (!access_token) {
      return NextResponse.json({ 
        success: false, 
        message: "Access token is required" 
      }, { status: 400 });
    }

    // Store Instagram data in your backend
    const storeResponse = await serverHandler.post("/api/user/store_instagram_connection", {
      user_id: user_id,
      access_token: access_token,
      instagram_accounts: instagram_accounts,
      connected_at: new Date().toISOString(),
      status: 'active'
    });

    if (!storeResponse.data.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to store Instagram data",
        error: storeResponse.data.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Instagram data stored successfully",
      data: {
        accounts_count: instagram_accounts?.length || 0,
        user_id: user_id
      }
    });

  } catch (error: any) {
    console.error('Store Instagram data error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to store Instagram data",
      error: error.message 
    }, { status: 500 });
  }
} 