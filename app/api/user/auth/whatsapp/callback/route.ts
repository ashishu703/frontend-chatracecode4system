import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 WhatsApp callback started');
    
    // Add cache control headers to prevent 304 responses
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('📋 WhatsApp callback parameters:', {
      hasCode: !!code,
      codeLength: code?.length,
      state,
      error
    });

    if (error) {
      console.error('❌ WhatsApp OAuth error:', error);
      return NextResponse.redirect(new URL('/onboarding?error=whatsapp_oauth_failed', request.url));
    }

    if (!code) {
      console.error('❌ No WhatsApp authorization code received');
      return NextResponse.redirect(new URL('/onboarding?error=no_whatsapp_code', request.url));
    }

    // Hand off to client-side callback handler which uses serverHandler (baseURL: 6400) with localStorage token
    const clientCallbackUrl = new URL('/auth/callback', request.url);
    clientCallbackUrl.searchParams.set('provider', 'whatsapp');
    clientCallbackUrl.searchParams.set('code', code);
    if (state) clientCallbackUrl.searchParams.set('state', state);
    clientCallbackUrl.searchParams.set('from', 'whatsapp_api_callback');
    return NextResponse.redirect(clientCallbackUrl);

  } catch (error: any) {
    console.error('❌ WhatsApp callback error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.redirect(new URL('/onboarding?error=whatsapp_callback_failed', request.url));
  }
}
