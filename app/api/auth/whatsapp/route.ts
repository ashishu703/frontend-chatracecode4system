import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get WhatsApp credentials from backend server using the correct endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    const credentialsRes = await fetch(`${baseUrl}/api/web/get_web_public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!credentialsRes.ok) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch WhatsApp credentials from backend" 
      }, { status: 500 });
    }

    const credentialsData = await credentialsRes.json();
    
    if (!credentialsData.success) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to fetch WhatsApp credentials from backend" 
      }, { status: 500 });
    }

    const settings = credentialsData.data;
    const clientId = settings.whatsapp_client_id;
    const clientSecret = settings.whatsapp_client_secret;
    const graphVersion = settings.whatsapp_graph_version || "v18.0";
    const scopes = [
      'business_management',
      'whatsapp_business_management',
      'whatsapp_business_messaging',
      'pages_show_list',
      'pages_manage_metadata',
      'pages_messaging'
    ].join(',');

    if (!clientId) {
      return NextResponse.json({ 
        success: false, 
        message: "WhatsApp Client ID not configured" 
      }, { status: 400 });
    }

    // Generate state parameter for security
    const state = `whatsapp_${Math.random().toString(36).substring(2, 15)}`;
    const loggerId = Math.random().toString(36).substring(2, 15);

    // Redirect back to our frontend callback handler (GET) which will POST to backend
    const { origin } = new URL(request.url);
    const redirectUri = `${origin}/api/user/auth/whatsapp/callback`;

    // Build WhatsApp OAuth URL
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
    console.error('WhatsApp OAuth error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate WhatsApp OAuth URL",
      error: error.message 
    }, { status: 500 });
  }
} 