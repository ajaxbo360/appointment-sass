"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code received");
      return;
    }

    const handleCallback = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/auth/google/callback?code=${code}`
        );

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();
        login(data.token, data.user);
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message || "Authentication failed");
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Authentication Error
          </h1>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Authenticating...</p>
      </div>
    </div>
  );
}
