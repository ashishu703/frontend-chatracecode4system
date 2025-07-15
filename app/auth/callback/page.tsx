"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { login as loginAction } from "@/store/slices/authSlice";
import serverHandler from "@/utils/serverHandler";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOAuth = async () => {
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
          // Google returns code, exchange it with backend
          response = await serverHandler.post("/api/user/login_with_google", { code });
        } else if (provider === "facebook") {
          // Facebook returns code, exchange it with backend
          response = await serverHandler.post("/api/user/login_with_facebook", { code });
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
        if (data?.token && data?.user) {
          localStorage.setItem("serviceToken", data.token);
          dispatch(loginAction({
            id: data.user.id,
            username: data.user.name,
            email: data.user.email,
          }));
          localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            username: data.user.name,
            email: data.user.email,
          }));
          router.replace("/dashboard");
        } else if (data?.token) {
          // Some providers may not return user object
          localStorage.setItem("serviceToken", data.token);
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch (err) {
        router.replace("/onboarding");
      }
    };
    handleOAuth();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-gray-700">Processing OAuth login, please wait...</div>
    </div>
  );
} 