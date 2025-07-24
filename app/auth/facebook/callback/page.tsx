"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FacebookCallback() {
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
        // Send code to backend, let backend handle token exchange and login
        const backendRes = await fetch("/api/user/auth/meta/callback?code=" + encodeURIComponent(code), {
          method: "GET",
          credentials: "include",
        });
        // Expect JSON response from backend
        const backendData = await backendRes.json();
        if (!backendRes.ok) {
          setError(backendData.error || backendData.message || "Backend login failed");
          return;
        }
        // Store JWT (if returned)
        if (backendData.token) {
          localStorage.setItem("token", backendData.token);
        }
        router.replace("/dashboard");
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    }
    handleFacebookOAuth();
  }, [searchParams, router]);

  if (error) return <div style={{ color: 'red', padding: 24 }}>Facebook login failed: {error}</div>;
  return <div style={{ padding: 24 }}>Logging you in with Facebook...</div>;
} 