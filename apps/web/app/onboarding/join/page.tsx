// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import React, { useState } from "react";

export default function JoinStep() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/join-with-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      setResult(json);
    } catch (e) {
      setResult({ error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-300">Invite token or code</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
            placeholder="abcd-efgh-1234"
          />
        </div>

        <div className="flex justify-end">
          <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium">
            {loading ? "Joining…" : "Join"}
          </button>
        </div>
      </form>

      {result && (
        <pre className="mt-4 rounded bg-neutral-900 p-3 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
