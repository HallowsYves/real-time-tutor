"use client";

import { useEffect, useState } from "react";

export default function TutorPage() {
  const [token, setToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/token", { method: "POST" });
        if (!r.ok) {
          const body = await r.text();
          throw new Error(body || `HTTP ${r.status}`);
        }
        const { token } = await r.json();
        setToken(token);
      } catch (e: any) {
        setErr(e?.message || "Failed to fetch token");
      }
    })();
  }, []);

  if (err) {
    return (
      <div className="p-6 text-red-600">
        Failed to initialize tutor: {err}
      </div>
    );
  }

  if (!token) {
    return <div className="p-6">Connecting to tutor…</div>;
  }

  // Public demo embed URL from the Agent Starter Embed; in production, point to your hosted embed.
  const EMBED_URL = "https://agent-starter-embed.production.livekit.io/embed?theme=dark";

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Realtime Tutor</h1>
      <iframe
        src={`${EMBED_URL}&token=${encodeURIComponent(token)}`}
        className="w-full h-[80vh] rounded-xl border"
        allow="microphone; camera; clipboard-read; clipboard-write; autoplay"
      />
      <p className="mt-2 text-sm opacity-70">
        Tip: Make sure your LiveKit Agent joins the same room (env: <code>LIVEKIT_ROOM</code>).
      </p>
    </div>
  );
}
