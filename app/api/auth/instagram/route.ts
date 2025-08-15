import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get Instagram credentials from backend server directly
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    console.log('Fetching Instagram credentials from:', `${baseUrl}/api/admin/get_social_login`);
    
    const socialLoginRes = await fetch(`${baseUrl}/api/admin/get_social_login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Social login response status:', socialLoginRes.status);
    
    if (!socialLoginRes.ok) {
      const errorText = await socialLoginRes.text();
      console.error('Social login error:', errorText);
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch Instagram credentials from backend" 
      }, { status: 500 });
    }

    const socialLoginData = await socialLoginRes.json();
    console.log('Social login data:', socialLoginData);
    
    if (!socialLoginData.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch Instagram credentials from backend" 
      }, { status: 500 });
    }

    const settings = socialLoginData.data;
    console.log('Instagram OAuth settings:', {
      instagramClientId: settings.instagram_client_id,
      hasInstagramClientSecret: !!settings.instagram_client_secret,
      graphVersion: settings.instagram_graph_version || "v18.0",
      scopes: settings.instagram_auth_scopes || "instagram_business_basic,instagram_business_manage_messages"
    });
    
    // Use Instagram App ID and Secret for Instagram OAuth
    const clientId = settings.instagram_client_id;
    const clientSecret = settings.instagram_client_secret;
    const graphVersion = settings.instagram_graph_version || "v18.0";
    const scopes = settings.instagram_auth_scopes || "instagram_business_basic,instagram_business_manage_messages";

    if (!clientId) {
      console.error('Instagram App ID not configured');
      return NextResponse.json({ 
        success: false, 
        message: "Instagram App ID not configured" 
      }, { status: 400 });
    }

    // Generate state parameter for security
    const state = `instagram_${Math.random().toString(36).substring(2, 15)}`;
    const loggerId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();

    // Create redirect URI - first to localhost, then to ngrok
    const redirectUri = `https://8c9ef71ac9b4.ngrok-free.app/api/user/auth/meta/callback`;

    // Build Instagram OAuth URL
    const authUrl = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`);
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('redirect_uri', redirectUri);
    params.append('response_type', 'code');
    params.append('state', state);
    params.append('scope', scopes);
    params.append('logger_id', loggerId);
    params.append('app_id', clientId);
    params.append('platform_app_id', clientId);

    authUrl.search = params.toString();

    return NextResponse.json({
      success: true,
      data: {
        authUrl: authUrl.toString(),
        state,
        clientId,
        redirectUri
      }
    });

  } catch (error: any) {
    console.error('Instagram OAuth error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate Instagram OAuth URL",
      error: error.message 
    }, { status: 500 });
  }
} 