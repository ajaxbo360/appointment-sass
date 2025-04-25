"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/contexts/auth-context";

interface ApiClientContextType {
  get: <T = any>(endpoint: string) => Promise<T>;
  post: <T = any>(endpoint: string, data?: any) => Promise<T>;
  put: <T = any>(endpoint: string, data?: any) => Promise<T>;
  patch: <T = any>(endpoint: string, data?: any) => Promise<T>;
  delete: <T = any>(endpoint: string) => Promise<T>;
}

const ApiClientContext = createContext<ApiClientContextType | undefined>(
  undefined
);

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Use the correct API URL depending on where the code is running
    setBaseUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

    // Fetch CSRF token on component mount
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      // Make a request to the CSRF cookie endpoint
      const response = await fetch(
        "http://localhost:8000/sanctum/csrf-cookie",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Extract CSRF token from cookies
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split("=");
          if (name === "XSRF-TOKEN") {
            // XSRF-TOKEN is URL encoded, so we need to decode it
            const decodedValue = decodeURIComponent(value);
            setCsrfToken(decodedValue);
            return;
          }
        }
      }

      console.warn("Failed to fetch CSRF token");
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
    }
  };

  const fetchWithAuth = async <T = any,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    if (!baseUrl) {
      throw new Error("API base URL not initialized");
    }

    // If we don't have a CSRF token yet, fetch it
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    // Ensure endpoint starts with '/' and doesn't include '/api' if baseUrl already has it
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

    // Make sure we don't have double "/api" in the URL
    const url =
      baseUrl.endsWith("/api") && normalizedEndpoint.startsWith("/api")
        ? `${baseUrl}${normalizedEndpoint.substring(4)}`
        : `${baseUrl}${normalizedEndpoint}`;

    const headers = new Headers(options.headers);

    // Set default headers
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    // Add CSRF token header for non-GET requests
    if (csrfToken && options.method && options.method !== "GET") {
      headers.set("X-XSRF-TOKEN", csrfToken);
    }

    // Only add Authorization header if token exists
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        if (logout) logout();
        throw new Error("Unauthenticated. Please log in again.");
      }

      if (response.status === 419) {
        await fetchCsrfToken();
        throw new Error("CSRF token mismatch. Please try again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API error: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      // Check if the response is empty
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
      }
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  };

  const apiClient: ApiClientContextType = {
    get: <T = any,>(endpoint: string) => fetchWithAuth<T>(endpoint),
    post: <T = any,>(endpoint: string, data?: any) =>
      fetchWithAuth<T>(endpoint, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    put: <T = any,>(endpoint: string, data?: any) =>
      fetchWithAuth<T>(endpoint, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    patch: <T = any,>(endpoint: string, data?: any) =>
      fetchWithAuth<T>(endpoint, {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      }),
    delete: <T = any,>(endpoint: string) =>
      fetchWithAuth<T>(endpoint, { method: "DELETE" }),
  };

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient() {
  const context = useContext(ApiClientContext);
  if (context === undefined) {
    throw new Error("useApiClient must be used within an ApiClientProvider");
  }
  return context;
}
