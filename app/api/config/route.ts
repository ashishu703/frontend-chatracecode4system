import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch config from the same endpoint as the admin config panel
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/get_web_public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch web config:', response.status, response.statusText);
      throw new Error('Failed to fetch web config');
    }

    const data = await response.json();
    const d = data.data || {};
    // Log all possible Facebook App ID/Secret fields for debugging
    console.log('FB config fields:', {
      facebook_client_id: d.facebook_client_id,
      fb_login_app_id: d.fb_login_app_id,
      facebook_client_secret: d.facebook_client_secret,
      fb_login_app_sec: d.fb_login_app_sec,
    });
    // Return all possible Facebook OAuth fields
    return NextResponse.json({
      facebook_client_id: d.facebook_client_id || d.fb_login_app_id || d.facebook_app_id || d.metaAppId || '',
      facebook_client_secret: d.facebook_client_secret || d.fb_login_app_sec || d.facebook_app_secret || d.metaAppSecret || '',
      facebook_graph_version: d.facebook_graph_version || d.metaGraphVer || 'v18.0',
      facebook_auth_scopes: d.facebook_auth_scopes || d.metaAuthScopes || 'email,public_profile',
      facebook_redirect_uri: d.facebook_redirect_uri || d.metaRedirectUri || '',
      backend_url: process.env.NEXT_PUBLIC_BASE_URL || '',
    });
  } catch (error) {
    console.error('Error fetching OAuth config:', error);
    let errorMessage = '';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as any).message;
    } else {
      errorMessage = String(error);
    }
    return NextResponse.json(
      { error: 'Failed to load OAuth configuration', details: errorMessage },
      { status: 500 }
    );
  }
}
