import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    const credentialsRes = await fetch(`${baseUrl}/api/web/get_web_public`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!credentialsRes.ok) {
      return NextResponse.json({ success: false, message: 'Failed to fetch WhatsApp credentials from backend' }, { status: 500 });
    }
    const credentialsData = await credentialsRes.json();
    if (!credentialsData.success) {
      return NextResponse.json({ success: false, message: 'Failed to fetch WhatsApp credentials from backend' }, { status: 500 });
    }

    const settings = credentialsData.data || {};
    const clientId = settings.whatsapp_client_id;
    const graphVersion = settings.whatsapp_graph_version || 'v20.0';
    const configId = settings.whatsapp_config_id;
    const scopes = 'business_management,whatsapp_business_management,whatsapp_business_messaging,pages_show_list,pages_manage_metadata,pages_messaging';

    if (!clientId || !configId) {
      return NextResponse.json({ success: false, message: 'WhatsApp App ID or Config ID not configured' }, { status: 400 });
    }

    const { origin } = new URL(request.url);
    const redirectUri = `${origin}/api/user/auth/whatsapp/callback`;

    return NextResponse.json({
      success: true,
      data: {
        facebookAppId: clientId,
        version: graphVersion,
        scopes,
        configId,
        redirectUri,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to load WhatsApp config', error: error.message }, { status: 500 });
  }
} 