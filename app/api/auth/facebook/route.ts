import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get Facebook credentials from backend server directly
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    const socialLoginRes = await fetch(`${baseUrl}/api/admin/get_social_login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!socialLoginRes.ok) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch Facebook credentials from backend" 
      }, { status: 500 });
    }

    const socialLoginData = await socialLoginRes.json();
    
    if (!socialLoginData.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch Facebook credentials from backend" 
      }, { status: 500 });
    }

    const settings = socialLoginData.data;
    const clientId = settings.facebook_client_id;
    const clientSecret = settings.facebook_client_secret;
    const graphVersion = settings.facebook_graph_version || "v18.0";
    const scopes = settings.facebook_auth_scopes || "pages_messaging,pages_show_list,pages_manage_metadata";

    if (!clientId) {
      return NextResponse.json({ 
        success: false, 
        message: "Facebook Client ID not configured" 
      }, { status: 400 });
    }

    // Generate state parameter for security
    const state = `messenger_${Math.random().toString(36).substring(2, 15)}`;
    const loggerId = Math.random().toString(36).substring(2, 15);

    // Create redirect URI
    const redirectUri = `https://8c9ef71ac9b4.ngrok-free.app/api/user/auth/meta/callback`;

    // Build Facebook OAuth URL
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
    console.error('Facebook OAuth error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate Facebook OAuth URL",
      error: error.message 
    }, { status: 500 });
  }
} 