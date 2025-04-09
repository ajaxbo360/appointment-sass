"use client";

import { useState, useEffect } from "react";

export default function TestConnection() {
  const [status, setStatus] = useState("Loading...");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/test-connection");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setStatus(data.status);
        setMessage(data.message);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setStatus("error");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">Connection Test</h1>

        <div className="card">
          <h2>Status: {status}</h2>
          {message && <p>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </main>
    </div>
  );
}
