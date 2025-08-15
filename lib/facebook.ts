// Facebook SDK utilities for WhatsApp Business authentication

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

// Load Facebook SDK
export const loadFacebookSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    // Set up Facebook SDK initialization
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: '', // Will be set dynamically
        cookie: true,
        xfbml: true,
        version: 'v22.0'
      });
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Facebook SDK'));
    };

    document.head.appendChild(script);
  });
};

// Initialize Facebook login for WhatsApp Business
export const initFacebookLogin = async (
  appId: string,
  options: {
    configId: string;
    scope: string;
    responseType: string;
  }
): Promise<{ code: string }> => {
  // Load SDK if not already loaded
  await loadFacebookSDK();

  // Re-initialize with the correct app ID
  window.FB.init({
    appId,
    cookie: true,
    xfbml: true,
    version: 'v22.0'
  });

  return new Promise((resolve, reject) => {
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          // For WhatsApp Business, we need the authorization code
          // The code will be available in the response
          resolve({ code: response.authResponse.code || response.code });
        } else {
          reject(new Error('User cancelled the login process'));
        }
      },
      {
        config_id: options.configId,
        response_type: options.responseType,
        override_default_response_type: true,
        scope: options.scope,
        extras: {
          setup: {},
          featureType: 'whatsapp_business',
          sessionInfoVersion: '3'
        }
      }
    );
  });
};

// Get Facebook login status
export const getFacebookLoginStatus = (): Promise<any> => {
  return new Promise((resolve) => {
    if (!window.FB) {
      resolve({ status: 'unknown' });
      return;
    }

    window.FB.getLoginStatus((response: any) => {
      resolve(response);
    });
  });
};

// Logout from Facebook
export const facebookLogout = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      resolve();
      return;
    }

    window.FB.logout((response: any) => {
      if (response) {
        resolve();
      } else {
        reject(new Error('Failed to logout'));
      }
    });
  });
};

