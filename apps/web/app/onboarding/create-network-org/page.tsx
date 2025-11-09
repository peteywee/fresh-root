// [P0][APP][CODE] Page component
// Tags: P0, APP, CODE
"use client";

import React, { useState, useEffect } from "react";

/**
 * @description Renders the create network organization step of the onboarding process.
 * This component displays a form for the user to enter organization and venue names.
 * @returns {React.ReactElement} The create network organization step page.
 */
export default function CreateNetworkOrg() {
  const [orgName, setOrgName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [formToken, setFormToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("onb_formToken");
      if (t) setFormToken(t);
      const p = localStorage.getItem("onb_profile");
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.fullName) setOrgName(parsed.fullName + "'s org");
      }
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = { orgName, venueName, formToken };
      const res = await fetch("/api/onboarding/create-network-org", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
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
          <label className="block text-sm text-neutral-300">Organization name</label>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300">Initial venue name</label>
          <input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300">Form token</label>
          <input
            value={formToken ?? ""}
            onChange={(e) => setFormToken(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>

        <div className="flex justify-end">
          <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium">
            {loading ? "Creating…" : "Create network"}
          </button>
        </div>
      </form>

      {result && (
        <pre className="mt-4 overflow-auto rounded bg-neutral-900 p-3 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
