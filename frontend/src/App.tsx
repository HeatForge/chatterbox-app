import { useEffect, useState } from "react";
import { api } from "./api/client";

interface HealthResponse {
  status: string;
  db: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<HealthResponse>("/api/health")
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="app">
      <h1>chatterbox-app</h1>
      <div className="card">
        <h2>Frontend</h2>
        <p className="status ok">Running on port 5173</p>
      </div>
      <div className="card">
        <h2>Backend</h2>
        {health ? (
          <>
            <p className="status ok">Status: {health.status}</p>
            <p className="status ok">Database: {health.db}</p>
          </>
        ) : error ? (
          <p className="status error">Unreachable: {error}</p>
        ) : (
          <p className="status">Connecting...</p>
        )}
      </div>
    </div>
  );
}
