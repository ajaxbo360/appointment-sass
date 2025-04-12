"use client";

import { useAuth } from "@/contexts/auth-context";
import { useState, useCallback } from "react";

interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

export function useApiClient() {
  const { token, logout } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const request = useCallback(
    async <T = any>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
      try {
        const url = `${apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
        
        const headers = new Headers(options.headers);
        
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        
        headers.set("Accept", "application/json");
        
        if (options.method && options.method !== "GET" && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        const response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });

        // Handle unauthorized responses
        if (response.status === 401) {
          logout();
          throw new Error("Your session has expired. Please log in again.");
        }

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return {
          data,
          status: response.status,
          ok: response.ok,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [apiUrl, token, logout]
  );

  const get = useCallback(
    <T = any>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: "GET" }),
    [request]
  );

  const post = useCallback(
    <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [request]
  );

  const put = useCallback(
    <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [request]
  );

  const patch = useCallback(
    <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      request<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [request]
  );

  const del = useCallback(
    <T = any>(endpoint: string, options?: RequestInit) =>
      request<T>(endpoint, { ...options, method: "DELETE" }),
    [request]
  );

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    error,
  };
} 