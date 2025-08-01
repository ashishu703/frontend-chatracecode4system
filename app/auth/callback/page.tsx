"use client";

import React, { useEffect, Suspense } from "react"; // Import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { login as loginAction } from "@/store/slices/authSlice";
import serverHandler from "@/utils/serverHandler";

// Function to exchange authorization code for ID token
const exchangeCodeForToken = async (code: string, googleClientId: string) => {
  try {
    // Hardcoded client secret and redirect URI as requested
    const googleClientSecret = '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';
    const redirectUri = 'http://localhost:3000/auth/callback?provider=google';

    if (!googleClientId) {
      throw new Error('Google Client ID not found');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.id_token; 
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

// This component will contain the actual OAuth logic and use client-side hooks
function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOAuth = async () => {
      // 1. Extract token from URL if present
      const urlToken = searchParams.get('token');
      if (urlToken) {
        localStorage.setItem('serviceToken', urlToken);
        try {
          const userRes = await serverHandler.get("/api/user/get_me", {
            headers: { Authorization: `Bearer ${urlToken}` }
          });
          if (userRes && typeof userRes === 'object' && 'data' in userRes && userRes.data && typeof userRes.data === 'object' && 'data' in userRes.data) {
            const user = (userRes.data as any).data;
            dispatch(loginAction({
              id: user.uid,
              username: user.name,
              email: user.email,
            }));
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (userErr) {
          // Optionally handle user fetch error
        }
        router.replace("/dashboard");
        return;
      }

      const code = searchParams.get("code");
      const provider = searchParams.get("provider");
      const state = searchParams.get("state");
      // For Facebook, sometimes access_token is returned directly
      const accessToken = searchParams.get("access_token");

      if (!provider) {
        router.replace("/onboarding");
        return;
      }

      try {
        let response;
        if (provider === "google") {
          // Google returns code, exchange it for ID token first
          console.log('Google OAuth code received:', code);
          
          if (!code) {
            throw new Error('No authorization code received from Google');
          }

          // Fetch Google Client ID from API using serverHandler
          const configResponse: any = await serverHandler.get('/api/web/get_web_public');
          const googleClientId = configResponse.data?.data?.google_client_id;
          
          console.log('Fetched Google Client ID:', googleClientId);

          // Exchange authorization code for ID token
          const idToken = await exchangeCodeForToken(code, googleClientId);
          console.log('ID token obtained from Google');
          
          // Get any existing token for authorization
          const existingToken = localStorage.getItem('serviceToken') || localStorage.getItem('adminToken');
          const headers: any = {};
          if (existingToken) {
            headers['Authorization'] = `Bearer ${existingToken}`;
          }
          
          // Send ID token to backend instead of authorization code
          response = await serverHandler.post("/api/user/login_with_google", { 
            token: idToken 
          }, { headers });
          console.log('Backend response:', response);
        } else if (provider === "facebook") {
          // Facebook returns code, exchange it with backend
          response = await serverHandler.post("/api/user/login_with_facebook", { code });
          // Do NOT call /api/messanger/auth-init here; backend should handle page fetching
        } else if (provider === "instagram") {
          response = await serverHandler.post("/api/instagram/auth-init", { code });
        } else if (provider === "messenger") {
          // Messenger may return access_token directly
          if (accessToken) {
            response = await serverHandler.post("/api/messanger/auth-init", { accessToken });
          } else {
            response = await serverHandler.post("/api/messanger/auth-init", { code });
          }
        } else if (provider === "whatsapp") {
          // WhatsApp may require business_id and waba_id
          const business_id = searchParams.get("business_id");
          const waba_id = searchParams.get("waba_id");
          response = await serverHandler.post("/api/whatsapp/auth-init", { code, business_id, waba_id });
        } else {
          router.replace("/onboarding");
          return;
        }

        const data: any = response?.data;
        // On success, store JWT and user info
        if (data?.token) {
          // Store JWT
          localStorage.setItem("serviceToken", data.token);
          // Fetch user info using the token
          try {
            const token = data.token || localStorage.getItem('serviceToken');
            const userRes = await serverHandler.get("/api/user/get_me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (userRes && typeof userRes === 'object' && 'data' in userRes && userRes.data && typeof userRes.data === 'object' && 'data' in userRes.data) {
              const user = (userRes.data as any).data;
              dispatch(loginAction({
                id: user.uid,
                username: user.name,
                email: user.email,
              }));
              localStorage.setItem('user', JSON.stringify(user));
            }
          } catch (userErr) {
            // Optionally handle user fetch error
          }
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch (err: any) {
        console.error("OAuth error:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        router.replace("/onboarding");
      }
    };
    handleOAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, dispatch, searchParams]); // Added searchParams to dependency array

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-gray-700">Processing OAuth login, please wait...</div>
    </div>
  );
}

// The main page component that wraps the content in Suspense
export default function OAuthCallbackPage() {
  return (
    <div suppressHydrationWarning={true}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      }>
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
}
