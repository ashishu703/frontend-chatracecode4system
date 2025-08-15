import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json();
    if (!code || !redirect_uri) {
      return NextResponse.json({ success: false, message: 'code and redirect_uri are required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';

    // Fetch WhatsApp app settings from backend
    const settingsRes = await fetch(`${baseUrl}/api/web/get_web_public`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!settingsRes.ok) {
      return NextResponse.json({ success: false, message: 'Failed to fetch app settings' }, { status: 500 });
    }

    const settingsJson = await settingsRes.json();
    if (!settingsJson?.success) {
      return NextResponse.json({ success: false, message: 'App settings response invalid' }, { status: 500 });
    }

    const settings = settingsJson.data || {};
    const clientId: string | undefined = settings.whatsapp_client_id;
    const clientSecret: string | undefined = settings.whatsapp_client_secret;
    const graphVersion: string = settings.whatsapp_graph_version || 'v18.0';
    const businessId: string | undefined = settings.whatsapp_config_id;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ success: false, message: 'WhatsApp credentials not configured' }, { status: 500 });
    }

    // Exchange code for short-lived access token
    const tokenResp = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri,
        code,
      })
    });

    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      return NextResponse.json({ success: false, message: 'Token exchange failed', error: errText }, { status: 400 });
    }

    const tokenJson = await tokenResp.json();
    let accessToken: string | undefined = tokenJson.access_token;

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'No access token received' }, { status: 400 });
    }

    // Optionally exchange for long-lived token
    try {
      const longLivedResp = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_token: accessToken,
        }),
        { method: 'GET' }
      );
      if (longLivedResp.ok) {
        const longLivedJson = await longLivedResp.json();
        accessToken = longLivedJson.access_token || accessToken;
      }
    } catch {}

    // Fetch pages/accounts to find WhatsApp Business Account (WABA)
    const accountsUrl = `https://graph.facebook.com/${graphVersion}/me/accounts?` +
      new URLSearchParams(
        Object.entries({
          access_token: accessToken || '',
          fields: 'id,name,whatsapp_business_account'
        }) as [string, string][]
      ).toString();

    const accountsResp = await fetch(accountsUrl, { method: 'GET' });
    if (!accountsResp.ok) {
      const errText = await accountsResp.text();
      return NextResponse.json({ success: false, message: 'Failed to fetch accounts', error: errText }, { status: 400 });
    }

    const accountsJson = await accountsResp.json();
    const pages: any[] = accountsJson?.data || [];

    let wabaId: string | null = null;
    for (const page of pages) {
      if (page?.whatsapp_business_account?.id) {
        wabaId = page.whatsapp_business_account.id;
        break;
      }
    }

    if (!wabaId) {
      return NextResponse.json({ success: false, message: 'No WhatsApp Business Account found for this user' }, { status: 404 });
    }

    return NextResponse.json({ success: true, waba_id: String(wabaId).trim(), business_id: businessId ? String(businessId).trim() : null });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Unexpected error' }, { status: 500 });
  }
}


