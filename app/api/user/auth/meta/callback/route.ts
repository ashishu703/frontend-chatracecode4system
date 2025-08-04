import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Instagram OAuth error:', error);
      return NextResponse.redirect(new URL('/onboarding?error=instagram_oauth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/onboarding?error=no_code', request.url));
    }

    // Get Instagram credentials from backend server directly
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:6400';
    const socialLoginRes = await fetch(`${baseUrl}/api/admin/get_social_login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!socialLoginRes.ok) {
      return NextResponse.redirect(new URL('/onboarding?error=credentials_not_found', request.url));
    }

    const socialLoginData = await socialLoginRes.json();
    
    if (!socialLoginData.success) {
      return NextResponse.redirect(new URL('/onboarding?error=credentials_not_found', request.url));
    }

    const settings = socialLoginData.data;
    // For Instagram Business API, we need to use Facebook App ID, not Instagram Client ID
    const clientId = settings.facebook_client_id; // Use Facebook App ID for Instagram OAuth
    const clientSecret = settings.facebook_client_secret;
    const graphVersion = settings.facebook_graph_version || "v18.0";
    const redirectUri = `https://7e61ad963202.ngrok-free.app/api/user/auth/meta/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/onboarding?error=credentials_incomplete', request.url));
    }

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
      console.error('Token exchange failed:', errorData);
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

    // Determine platform from state
    const platform = state?.includes('instagram') ? 'instagram' : 
                    state?.includes('messenger') ? 'messenger' : 
                    state?.includes('whatsapp') ? 'whatsapp' : 'unknown';

    // Get user's pages/accounts based on platform
    const accountsResponse = await fetch(`https://graph.facebook.com/${graphVersion}/me/accounts?access_token=${longLivedToken}`);
    
    if (!accountsResponse.ok) {
      console.error('Failed to fetch accounts');
      return NextResponse.redirect(new URL('/onboarding?error=accounts_fetch_failed', request.url));
    }

    const accountsData = await accountsResponse.json();
    const pages = accountsData.data || [];

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
    } else if (platform === 'whatsapp') {
      // For WhatsApp, get business accounts
      for (const page of pages as any[]) {
        const whatsappResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${page.id}?fields=whatsapp_business_account&access_token=${longLivedToken}`);
        if (whatsappResponse.ok) {
          const whatsappData = await whatsappResponse.json();
          if (whatsappData.whatsapp_business_account) {
            const whatsappAccountId = whatsappData.whatsapp_business_account.id;
            
            // Get WhatsApp account details
            const accountDetailsResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${whatsappAccountId}?fields=id,name,phone_number,message_template_namespace&access_token=${longLivedToken}`);
            
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

    // Send data to backend in the required format - send only the code like existing Facebook login
    const backendResponse = await fetch(`${baseUrl}/api/user/login_with_facebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code
      }),
    });

    if (!backendResponse.ok) {
      console.error('Backend login failed');
      return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
    }

    const backendData = await backendResponse.json();
    
    if (!backendData.success) {
      console.error('Backend login failed:', backendData.message);
      return NextResponse.redirect(new URL('/onboarding?error=backend_login_failed', request.url));
    }

    console.log('Instagram OAuth successful!', {
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
    return NextResponse.redirect(new URL(`/dashboard?${platform}_connected=true`, request.url));

  } catch (error: any) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(new URL('/onboarding?error=callback_failed', request.url));
  }
} 