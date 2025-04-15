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
  const { token } = useAuth();
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    // Use the correct API URL depending on where the code is running
    // In the browser, use the public URL
    setBaseUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");
  }, []);

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    if (!baseUrl) {
      throw new Error("API base URL not initialized");
    }

    const url = `${baseUrl}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      console.log(`Making ${options.method || "GET"} request to: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return await response.json();
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
