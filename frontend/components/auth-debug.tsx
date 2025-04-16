"use client";

import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

export default function AuthDebug() {
  const { token, user, isAuthenticated, logout } = useAuth();
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Auth Debug</h2>
      <div className="space-y-2">
        <p>
          <span className="font-semibold">Authenticated:</span>{" "}
          {isAuthenticated ? "Yes" : "No"}
        </p>
        <p>
          <span className="font-semibold">Token:</span>{" "}
          {token ? (
            <>
              <span>{showToken ? token : token.substring(0, 15) + "..."}</span>
              <button
                className="ml-2 text-blue-500 text-sm"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </>
          ) : (
            "No token"
          )}
        </p>
        <p>
          <span className="font-semibold">User:</span>{" "}
          {user ? JSON.stringify(user, null, 2) : "No user"}
        </p>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
