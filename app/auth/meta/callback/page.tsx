"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MetaCallbackRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Always redirect to the new Facebook callback handler
    router.replace("/auth/facebook/callback" + window.location.search);
  }, [router]);
  return <div>Redirecting...</div>;
} 