import { useAuth } from "@/contexts/auth-context";

const API_URL = "http://localhost:8000/api";

export function useApiClient() {
  const { token, logout } = useAuth();

  const fetchApi = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle unauthorized errors (expired token)
      if (response.status === 401) {
        logout();
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => fetchApi(endpoint, { method: "GET" }),
    post: (endpoint: string, data: any) =>
      fetchApi(endpoint, { method: "POST", body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) =>
      fetchApi(endpoint, { method: "PUT", body: JSON.stringify(data) }),
    delete: (endpoint: string) => fetchApi(endpoint, { method: "DELETE" }),
  };
} 