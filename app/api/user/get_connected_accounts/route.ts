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
        'X-User-ID': userId
      }
    });

    // Parallel API calls for better performance
    const [facebookResponse, instagramResponse, whatsappResponse] = await Promise.all([
      authServerHandler.get<ApiResponse>('/api/messanger/accounts').catch(() => ({ data: { profiles: [] } })),
      authServerHandler.get<ApiResponse>('/api/instagram/accounts').catch(() => ({ data: { profiles: [] } })),
      authServerHandler.get<ApiResponse>('/api/whatsapp/accounts').catch(() => ({ data: { profiles: [] } }))
    ]);

    // Combine all profiles from different platforms
    const facebookProfiles = facebookResponse.data?.data?.profiles || facebookResponse.data?.profiles || [];
    const instagramProfiles = instagramResponse.data?.data?.profiles || instagramResponse.data?.profiles || [];
    const whatsappProfiles = whatsappResponse.data?.data?.profiles || whatsappResponse.data?.profiles || [];
    
    const allProfiles = [
      ...facebookProfiles,
      ...instagramProfiles,
      ...whatsappProfiles
    ];

    // Transform the data to match our expected format
    const transformedAccounts = allProfiles.map((profile: Profile) => ({
      id: profile.id,
      platform: profile.platform,
      account_name: profile.name,
      account_id: profile.social_user_id,
      username: profile.username,
      avatar: profile.avatar,
      social_account_id: profile.social_account_id,
      connected_at: new Date().toISOString(),
      status: 'active'
    }));

    // Deduplicate by social_account_id or id to avoid duplicates
    const seen = new Set<string>();
    const connectedAccounts = transformedAccounts.filter((account) => {
      const key = account.social_account_id || account.id;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      success: true,
      message: "Connected accounts fetched successfully",
      data: connectedAccounts
    });

  } catch (error: any) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Get connected accounts error:', error.message);
    }
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch connected accounts",
      error: error.message 
    }, { status: 500 });
  }
} 