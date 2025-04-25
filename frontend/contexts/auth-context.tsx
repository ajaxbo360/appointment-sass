"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get API URL from environment variables
const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const getSanctumUrl = () =>
  process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000/sanctum";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load auth state from localStorage on component mount
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }

    setIsLoading(false);

    // Fetch CSRF token on mount
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      // Make a request to the CSRF cookie endpoint
      const response = await fetch(`${getSanctumUrl()}/csrf-cookie`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("Failed to set CSRF token cookie");
      }
    } catch (error) {
      console.error("Error setting CSRF token cookie:", error);
    }
  };

  const apiCall = async <T = any,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${getApiUrl()}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;

    const headers = new Headers(options.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");

    if (options.method && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));

    // Fetch a fresh CSRF token on login
    fetchCsrfToken();
  };

  const logout = async () => {
    // Call logout API
    if (token) {
      try {
        await apiCall("/auth/logout", {
          method: "POST",
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    // Clear local state
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
