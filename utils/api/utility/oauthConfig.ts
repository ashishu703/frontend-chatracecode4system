let oauthConfig: any = null;

export const getOAuthConfig = async () => {
  if (oauthConfig) return oauthConfig;

  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('Failed to fetch OAuth config');
    }
    oauthConfig = await response.json();
    return oauthConfig;
  } catch (error) {
    console.error('Error fetching OAuth config:', error);
    // Fallback to environment variables if API fails
    return {
      metaRedirectUri: process.env.NEXT_PUBLIC_META_REDIRECT_URI,
      metaAppId: process.env.NEXT_PUBLIC_META_APP_ID,
      metaGraphVer: process.env.NEXT_PUBLIC_META_GRAPH_VER
    };
  }
};
