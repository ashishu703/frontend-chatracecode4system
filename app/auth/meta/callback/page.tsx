"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOAuthConfig } from "../../../../utils/oauthConfig";

function MetaCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No code found in URL.");
      return;
    }

    async function handleFacebookOAuth() {
      try {
        // Fetch config from getOAuthConfig
        const socialConfig = await getOAuthConfig();
        const appId = socialConfig.facebook_client_id || socialConfig.facebook_app_id;
        const appSecret = socialConfig.facebook_client_secret || socialConfig.facebook_app_secret;
        const version = socialConfig.facebook_graph_version || "v18.0";
        const scopes = socialConfig.facebook_auth_scopes || "email,public_profile";
        const redirectUri = socialConfig.facebook_redirect_uri || `${window.location.origin}/auth/meta/callback`;
        const backendUrl = socialConfig.backend_url || "http://localhost:3002";
        if (!code) throw new Error("No code found in URL.");
        // Exchange code for access token
        const tokenRes = await fetch(
          `https://graph.facebook.com/${version}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
        );
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error(tokenData.error?.message || "Failed to get access token");
        // Fetch user profile
        const profileRes = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`
        );
        const profile = await profileRes.json();
        if (!profile.id || !profile.email || !profile.name) throw new Error("Failed to fetch user profile");
        // POST to backend
        const backendRes = await fetch(`${backendUrl}/auth/meta/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenData.access_token,
            userId: profile.id,
            email: profile.email,
            name: profile.name,
          }),
        });
        const backendData = await backendRes.json();
        if (!backendRes.ok || !backendData.token) throw new Error(backendData.message || "Backend login failed");
        // Store JWT
        localStorage.setItem("jwt", backendData.token);
        router.replace("/dashboard");
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    }

    handleFacebookOAuth();
    // eslint-disable-next-line
  }, [searchParams, router]);

  if (error) return <div style={{ color: 'red', padding: 24 }}>Facebook login failed: {error}</div>;
  return <div style={{ padding: 24 }}>Logging you in with Facebook...</div>;
}

export default function MetaCallback() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <MetaCallbackContent />
    </Suspense>
  );
} 