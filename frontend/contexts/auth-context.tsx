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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load auth state from localStorage on component mount
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken) {
      console.log("Found stored token:", storedToken.substring(0, 10) + "...");
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

    setIsLoaded(true);

    // Fetch CSRF token on mount
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
        console.log("CSRF token cookie set successfully");
      } else {
        console.warn("Failed to set CSRF token cookie");
      }
    } catch (error) {
      console.error("Error setting CSRF token cookie:", error);
    }
  };

  const login = (newToken: string, newUser: User) => {
    console.log("Logging in with token:", newToken.substring(0, 10) + "...");
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));

    // Fetch a fresh CSRF token on login
    fetchCsrfToken();
  };

  const logout = () => {
    // Call logout API
    if (token) {
      fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(console.error);
    }

    // Clear local state
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
    console.log("Logged out, auth data cleared");
  };

  const value = {
    user,
    token,
    isAuthenticated,
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
