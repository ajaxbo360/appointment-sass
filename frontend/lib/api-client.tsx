"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/contexts/auth-context";

interface ApiClientContextType {
  get: (endpoint: string) => Promise<any>;
  post: (endpoint: string, data?: any) => Promise<any>;
  put: (endpoint: string, data?: any) => Promise<any>;
  delete: (endpoint: string) => Promise<any>;
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
            console.log(
              "CSRF token fetched:",
              decodedValue.substring(0, 15) + "..."
            );
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

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    if (!baseUrl) {
      throw new Error("API base URL not initialized");
    }

    // If we don't have a CSRF token yet, fetch it
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    const url = `${baseUrl}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    // Add CSRF token header for non-GET requests
    if (csrfToken && options.method && options.method !== "GET") {
      headers["X-XSRF-TOKEN"] = csrfToken;
    }

    // Only add Authorization header if token exists
    if (token) {
      console.log(
        "Adding auth token to request:",
        token.substring(0, 15) + "..."
      );
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No auth token available for request to:", url);
    }

    try {
      console.log(`Making ${options.method || "GET"} request to: ${url}`);
      console.log("Request headers:", headers);

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      console.log(`Response status for ${url}:`, response.status);

      if (response.status === 401) {
        console.error("Authentication failed - logging out");
        if (logout) logout();
        throw new Error("Unauthenticated. Please log in again.");
      }

      if (response.status === 419) {
        console.error("CSRF token mismatch - refreshing token");
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

        console.error(`API error response:`, {
          status: response.status,
          text: errorText,
        });
        throw new Error(errorMessage);
      }

      // Check if the response is empty
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      }
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  };

  const apiClient = {
    get: (endpoint: string) => fetchWithAuth(endpoint),
    post: (endpoint: string, data?: any) =>
      fetchWithAuth(endpoint, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    put: (endpoint: string, data?: any) =>
      fetchWithAuth(endpoint, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    delete: (endpoint: string) => fetchWithAuth(endpoint, { method: "DELETE" }),
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
