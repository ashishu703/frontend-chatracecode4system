import { useCallback } from 'react';
import { getOAuthConfig } from '@/utils/oauthConfig';

export const useOAuth = () => {
  const initiateOAuth = useCallback(async (provider: 'facebook' | 'google' | 'instagram') => {
    try {
      const config = await getOAuthConfig();
      
      let authUrl = '';
      const state = `${provider}_${Date.now()}`;
      
      switch (provider) {
        case 'facebook':
          authUrl = `https://www.facebook.com/${config.metaGraphVer}/dialog/oauth?` +
            `client_id=${config.metaAppId}&` +
            `redirect_uri=${encodeURIComponent(config.metaRedirectUri)}&` +
            `state=${state}&` +
            'response_type=code&' +
            'scope=email,public_profile';
          break;
          
        // Add cases for other providers as needed
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      throw error;
    }
  }, []);

  return { initiateOAuth };
};
