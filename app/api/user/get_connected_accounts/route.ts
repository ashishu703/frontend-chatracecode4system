import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface Profile {
  id: string;
  platform: string;
  name: string;
  username?: string;
  social_user_id: string;
  avatar?: string;
  social_account_id?: string;
  token: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    msg: string;
    profiles: Profile[];
  };
  profiles?: Profile[]; // Direct array response
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    console.log('🔍 Fetching connected accounts for user:', userId);

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID is required" 
      }, { status: 400 });
    }

    // Get authorization token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    // Extract token from cookies if not in header
    let token = authHeader?.replace('Bearer ', '');
    if (!token && cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies.serviceToken || cookies.adminToken;
    }

    console.log('🔑 Token found:', !!token);

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentication token required" 
      }, { status: 401 });
    }

    // Create a custom axios instance for server-side requests with auth
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    const authServerHandler = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-ID': userId // Add user ID to headers as backup
      }
    });

    // Get connected social accounts from three separate endpoints with proper /api prefix
    console.log('📡 Calling backend endpoints...');
    console.log('🔧 Request details:', {
      baseURL,
      token: token ? `${token.substring(0, 20)}...` : 'none',
      userId,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? '***' : 'none'}`,
        'X-User-ID': userId
      }
    });
    
    // Use GET requests as backend expects GET, not POST
    const [facebookResponse, instagramResponse, whatsappResponse] = await Promise.all([
      authServerHandler.get<ApiResponse>('/api/messanger/accounts'),
      authServerHandler.get<ApiResponse>('/api/instagram/accounts'),
      authServerHandler.get<ApiResponse>('/api/whatsapp/accounts')
    ]);

    console.log('🔍 Raw Facebook response:', JSON.stringify(facebookResponse.data, null, 2));
    console.log('🔍 Raw Instagram response:', JSON.stringify(instagramResponse.data, null, 2));
    console.log('🔍 Raw WhatsApp response:', JSON.stringify(whatsappResponse.data, null, 2));

    console.log('📊 Facebook response:', {
      success: facebookResponse.data?.success,
      profiles: facebookResponse.data?.profiles?.length || 0,
      data: facebookResponse.data,
      profilesArray: facebookResponse.data?.profiles
    });

    console.log('📊 Instagram response:', {
      success: instagramResponse.data?.success,
      profiles: instagramResponse.data?.profiles?.length || 0,
      data: instagramResponse.data,
      profilesArray: instagramResponse.data?.profiles
    });

    console.log('📊 WhatsApp response:', {
      success: whatsappResponse.data?.success,
      profiles: whatsappResponse.data?.profiles?.length || 0,
      data: whatsappResponse.data,
      profilesArray: whatsappResponse.data?.profiles
    });

    // Combine all profiles from different platforms
    // Handle both possible response structures: data.profiles or direct array
    const facebookProfiles = facebookResponse.data?.data?.profiles || facebookResponse.data?.profiles || [];
    const instagramProfiles = instagramResponse.data?.data?.profiles || instagramResponse.data?.profiles || [];
    const whatsappProfiles = whatsappResponse.data?.data?.profiles || whatsappResponse.data?.profiles || [];
    
    console.log('🔍 Facebook profiles count:', facebookProfiles.length);
    console.log('🔍 Instagram profiles count:', instagramProfiles.length);
    console.log('🔍 WhatsApp profiles count:', whatsappProfiles.length);
    
    const allProfiles = [
      ...facebookProfiles,
      ...instagramProfiles,
      ...whatsappProfiles
    ];

    console.log('🔗 Total profiles found:', allProfiles.length);
    console.log('📋 All profiles:', JSON.stringify(allProfiles, null, 2));

    // Transform the data to match our expected format
    const connectedAccounts = allProfiles.map((profile: Profile) => ({
      id: profile.id,
      platform: profile.platform,
      account_name: profile.name,
      account_id: profile.social_user_id,
      username: profile.username,
      avatar: profile.avatar,
      social_account_id: profile.social_account_id,
      connected_at: new Date().toISOString(), // Since we don't have this info, using current time
      status: 'active'
    }));

    console.log('✅ Transformed accounts:', connectedAccounts);

    return NextResponse.json({
      success: true,
      message: "Connected accounts fetched successfully",
      data: connectedAccounts
    });

  } catch (error: any) {
    console.error('❌ Get connected accounts error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch connected accounts",
      error: error.message 
    }, { status: 500 });
  }
} 