import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract JWT token from request
function getJwtTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  let token = request.headers.get('authorization');
  if (token && token.startsWith('Bearer ')) {
    return token.replace('Bearer ', '');
  }

  // If not found in headers, try cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    return cookies.serviceToken || cookies.adminToken || null;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Meta callback started');
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('📋 Callback parameters:', {
      hasCode: !!code,
      codeLength: code?.length,
      state,
      error
    });

    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(new URL('/onboarding?error=oauth_failed', request.url));
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(new URL('/onboarding?error=no_code', request.url));
    }

    // Determine platform from state and extract token if embedded: state format can be "platform|<jwt>|<ts>|<encodedRedirect>"
    const rawState = state || '';
    const [statePlatform, embeddedToken, _ts, encodedRedirect] = rawState.split('|');
    const platform = statePlatform?.includes('instagram') ? 'instagram' : 
                    statePlatform?.includes('messenger') ? 'messenger' : 
                    statePlatform?.includes('whatsapp') ? 'whatsapp' : 'unknown';
    
    console.log('🔍 OAuth Callback - Platform:', platform, 'State:', state);

    if (platform === 'unknown') {
      console.error('⚠️ Unknown platform in state:', state);
      return NextResponse.redirect(new URL('/onboarding?error=unknown_platform', request.url));
    }

    // Handle WhatsApp differently - extract code and redirect to frontend
    if (platform === 'whatsapp') {
      console.log('📱 WhatsApp OAuth detected - redirecting to frontend for processing');
      
      // Redirect to frontend with the authorization code
      const redirectUrl = new URL('/dashboard', request.url);
      redirectUrl.searchParams.set('whatsapp_auth_code', code);
      redirectUrl.searchParams.set('whatsapp_state', state || '');
      redirectUrl.searchParams.set('whatsapp_pending', 'true');
      
      return NextResponse.redirect(redirectUrl);
    }

    // For Messenger and other platforms, process the OAuth flow here
    console.log('📘 Processing Facebook/Instagram OAuth flow');

    // Get credentials from backend server using the correct endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    console.log('🔍 Fetching credentials from:', `${baseUrl}/api/web/get_web_public`);
    
    const credentialsRes = await fetch(`${baseUrl}/api/web/get_web_public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!credentialsRes.ok) {
      console.error('❌ Failed to fetch credentials:', {
        status: credentialsRes.status,
        statusText: credentialsRes.statusText,
        url: `${baseUrl}/api/web/get_web_public`
      });
      return NextResponse.redirect(new URL('/onboarding?error=credentials_not_found', request.url));
    }

    const credentialsData = await credentialsRes.json();
    
    if (!credentialsData.success) {
      console.error('❌ Credentials response error:', credentialsData);
      return NextResponse.redirect(new URL('/onboarding?error=credentials_not_found', request.url));
    }

    const settings = credentialsData.data;
    
    // Use Facebook credentials for Instagram and Messenger
    const clientId = settings.facebook_client_id;
    const clientSecret = settings.facebook_client_secret;
    const graphVersion = settings.facebook_graph_version || "v18.0";
    // Compute redirect URI dynamically, but prefer one embedded in state (from the original dialog) or backend config
    const currentUrl = new URL(request.url);
    const defaultCallback = `${currentUrl.origin}/api/user/auth/meta/callback`;
    const stateRedirect = encodedRedirect ? decodeURIComponent(encodedRedirect) : '';
    const effectiveRedirectUri = stateRedirect || settings.instagram_redirect_url || defaultCallback;
    // Prefer dialog origin (e.g., ngrok https) for final navigation
    let finalOrigin: string;
    try {
      finalOrigin = new URL(effectiveRedirectUri).origin;
    } catch {
      finalOrigin = currentUrl.origin;
    }

    if (!clientId || !clientSecret) {
      console.error('❌ Missing Facebook credentials:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        settings: Object.keys(settings)
      });
      return NextResponse.redirect(new URL('/onboarding?error=credentials_incomplete', request.url));
    }

    console.log('✅ Using Facebook credentials for platform:', platform, {
      clientId: clientId?.substring(0, 10) + '...',
      graphVersion
    });

    // For Instagram, let the backend perform the token exchange to avoid double-use of the code
    if (platform === 'instagram') {
      // Retrieve JWT token from state, or cookies/headers as fallback
      let jwtToken = embeddedToken || getJwtTokenFromRequest(request);
      if (!jwtToken) {
        console.error('JWT token not found for Instagram auth');
        return NextResponse.redirect(new URL('/onboarding?error=auth_token_missing', request.url));
      }
      const backendResponse = await fetch(`${baseUrl}/api/instagram/auth-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ code, redirect_uri: effectiveRedirectUri }),
      });
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend Instagram auth-init failed', errorText);
        return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
      }
      const backendData = await backendResponse.json();
      if (!backendData.success) {
        console.error('Backend Instagram auth-init failed:', backendData.message);
        return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
      }
      const redirectUrl = new URL('/dashboard', finalOrigin);
      redirectUrl.searchParams.set('instagram_connected', 'true');
      if (embeddedToken) redirectUrl.searchParams.set('token', embeddedToken);
      return NextResponse.redirect(redirectUrl, 302);
    }

    if (platform === 'messenger') {
      // Retrieve JWT token from state or cookies
      let jwtToken = embeddedToken || getJwtTokenFromRequest(request);
      if (!jwtToken) {
        return NextResponse.redirect(new URL('/onboarding?error=auth_token_missing', request.url));
      }
      // Exchange code on server side and init messenger
      const tokenResponse = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: effectiveRedirectUri,
          code: code!,
        }),
      });
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('❌ Messenger token exchange failed:', errorData);
        return NextResponse.redirect(new URL('/onboarding?error=token_exchange_failed', request.url));
      }
      const tokenJson = await tokenResponse.json();
      const accessToken = tokenJson.access_token;
      const backendResponse = await fetch(`${baseUrl}/api/messanger/auth-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ accessToken }),
      });
      if (!backendResponse.ok) {
        return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
      }
      const r = await backendResponse.json();
      if (!r.success) {
        return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
      }
      const redirectUrl = new URL('/dashboard', finalOrigin);
      redirectUrl.searchParams.set('messenger_connected', 'true');
      if (embeddedToken) redirectUrl.searchParams.set('token', embeddedToken);
      return NextResponse.redirect(redirectUrl, 302);
    }

    console.log('🔄 Exchanging code for access token...');
    // Exchange code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: effectiveRedirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        platform,
        clientId: clientId?.substring(0, 10) + '...',
        redirectUri: effectiveRedirectUri
      });
      return NextResponse.redirect(new URL('/onboarding?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL('/onboarding?error=no_access_token', request.url));
    }

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(`https://graph.facebook.com/${graphVersion}/oauth/access_token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: accessToken,
      }),
    });

    let longLivedToken = accessToken;
    if (longLivedTokenResponse.ok) {
      const longLivedData = await longLivedTokenResponse.json();
      longLivedToken = longLivedData.access_token || accessToken;
    }

    console.log('🔍 Fetching accounts with token (first 20 chars):', longLivedToken?.substring(0, 20) + '...');
    
    // Get user's pages/accounts
    let accountsResponse;
    try {
      console.log(`🔍 Fetching accounts for ${platform} with token (first 20 chars):`, longLivedToken?.substring(0, 20) + '...');
      const accountsUrl = `https://graph.facebook.com/${graphVersion}/me/accounts?access_token=${longLivedToken}&fields=id,name,access_token,category,tasks,whatsapp_business_account`;
      console.log('🔍 Accounts URL:', accountsUrl);
      accountsResponse = await fetch(accountsUrl);
      
      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text();
        console.error('❌ Failed to fetch accounts:', accountsResponse.status, errorText);
        return NextResponse.redirect(new URL('/onboarding?error=accounts_fetch_failed', request.url));
      }
    } catch (error) {
      console.error('❌ Error fetching accounts:', error);
      return NextResponse.redirect(new URL('/onboarding?error=fetch_error', request.url));
    }
    
    if (!accountsResponse.ok) {
      console.error('Failed to fetch accounts');
      return NextResponse.redirect(new URL('/onboarding?error=accounts_fetch_failed', request.url));
    }

    const accountsData = await accountsResponse.json();
    const pages = accountsData.data || [];
    
    console.log('📋 Total pages/accounts found:', pages.length);
    if (pages.length > 0) {
      console.log('📄 First page details:', {
        id: pages[0].id,
        name: pages[0].name,
        category: pages[0].category,
        tasks: pages[0].tasks
      });
    }

    let platformAccounts = [];
    
    if (platform === 'messenger') {
      // For Messenger, store Facebook pages
      platformAccounts = pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        category: page.category,
        tasks: page.tasks || []
      }));
    }

    // Get user info from Facebook Graph API (best-effort)
    const userInfoResponse = await fetch(`https://graph.facebook.com/${graphVersion}/me?fields=id,name,email&access_token=${longLivedToken}`);
    
    let userData = {
      userId: state?.replace(`${platform}_`, '') || Date.now().toString(),
      email: 'user@example.com',
      name: 'User Name'
    };
    
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      userData = {
        userId: userInfo.id || userData.userId,
        email: userInfo.email || userData.email,
        name: userInfo.name || userData.name
      };
    }

    console.log('✅ OAuth successful!', {
      platform: platform,
      accountsCount: platformAccounts.length,
      accessToken: longLivedToken ? '***' : 'none',
      userData: userData,
      accounts: platformAccounts.map((acc: any) => ({
        id: acc.id,
        username: acc.username,
        name: acc.name
      }))
    });

    // Redirect to dashboard with success
    const redirectUrl = new URL('/dashboard', finalOrigin);
    redirectUrl.searchParams.set(`${platform}_connected`, 'true');
    if (embeddedToken) redirectUrl.searchParams.set('token', embeddedToken);
    
    // Add account IDs to the redirect URL for reference
    if (platformAccounts.length > 0) {
      redirectUrl.searchParams.set('account_count', platformAccounts.length.toString());
    }
    
    return NextResponse.redirect(redirectUrl, 302);

  } catch (error: any) {
    console.error('❌ Meta callback error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.redirect(new URL('/onboarding?error=callback_failed', request.url));
  }
} 