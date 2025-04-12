"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // Only process once to prevent infinite loops
    if (processed) return;

    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(token, user);
        setProcessed(true);
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setProcessed(true);
        router.push("/login?error=Invalid user data");
      }
    } else {
      const error = searchParams.get("error");
      setProcessed(true);
      router.push(`/login${error ? `?error=${error}` : ""}`);
    }
  }, [router, searchParams, login, processed]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Authenticating...</p>
      </div>
    </div>
  );
}
