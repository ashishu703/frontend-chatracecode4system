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

    // Determine platform from state
    const platform = state?.includes('instagram') ? 'instagram' : 
                    state?.includes('messenger') ? 'messenger' : 
                    state?.includes('whatsapp') ? 'whatsapp' : 'unknown';
    
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

    // For Instagram and Messenger, process the OAuth flow here
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
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || `https://79a53a3720a9.ngrok-free.app/api/user/auth/meta/callback`;

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
        redirect_uri: redirectUri,
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
        redirectUri
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
    
    if (platform === 'instagram') {
      // Find Instagram business accounts
      for (const page of pages as any[]) {
        const instagramResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${page.id}?fields=instagram_business_account&access_token=${longLivedToken}`);
        if (instagramResponse.ok) {
          const instagramData = await instagramResponse.json();
          if (instagramData.instagram_business_account) {
            const instagramAccountId = instagramData.instagram_business_account.id;
            
            // Get Instagram account details
            const accountDetailsResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${instagramAccountId}?fields=id,username,name,profile_picture_url,biography,followers_count,media_count&access_token=${longLivedToken}`);
            
            if (accountDetailsResponse.ok) {
              const accountDetails = await accountDetailsResponse.json();
              platformAccounts.push({
                ...accountDetails,
                page_id: page.id,
                page_name: page.name,
                page_access_token: page.access_token
              });
            }
          }
        }
      }
    } else if (platform === 'messenger') {
      // For Messenger, store Facebook pages
      platformAccounts = pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        category: page.category,
        tasks: page.tasks || []
      }));
    }

    // Get user info from Facebook Graph API
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

    // Handle Instagram authentication
    if (platform === 'instagram') {
      // Retrieve JWT token from cookies or headers
      let jwtToken = request.headers.get('authorization');
      if (jwtToken && jwtToken.startsWith('Bearer ')) {
        jwtToken = jwtToken.replace('Bearer ', '');
      }
      // If not found in headers, try cookies
      if (!jwtToken) {
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          jwtToken = cookies.serviceToken || cookies.adminToken;
        }
      }
      if (!jwtToken) {
        console.error('JWT token not found for Instagram auth');
        return NextResponse.redirect(new URL('/onboarding?error=auth_token_missing', request.url));
      }
      const backendResponse = await fetch(`${baseUrl}/instagram/auth-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ code }),
      });
      if (!backendResponse.ok) {
        console.error('Backend Instagram auth-init failed');
        return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
      }
      const backendData = await backendResponse.json();
      if (!backendData.success) {
        console.error('Backend Instagram auth-init failed:', backendData.message);
        return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
      }
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
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set(`${platform}_connected`, 'true');
    
    // Add account IDs to the redirect URL for reference
    if (platformAccounts.length > 0) {
      redirectUrl.searchParams.set('account_count', platformAccounts.length.toString());
    }
    
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('❌ Meta callback error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.redirect(new URL('/onboarding?error=callback_failed', request.url));
  }
} 