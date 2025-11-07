"use client";
import React, { useState, useEffect } from "react";

export default function AdminFormStep() {
  const [company, setCompany] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formToken, setFormToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // prefill from profile if present
    try {
      const p = localStorage.getItem("onb_profile");
      if (p) {
        const parsed = JSON.parse(p);
        if (parsed.fullName) setCompany(parsed.fullName + "'s org");
        if (parsed.phone) setEmail(parsed.phone);
      }
    } catch {}
  }, []);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/admin-form", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ legalEntityName: company, taxIdNumber: taxId, businessEmail: email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || "Failed to submit");
      } else {
        setFormToken(json.formToken);
        try {
          localStorage.setItem("onb_formToken", json.formToken);
        } catch {}
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submitForm} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-300">Legal entity name</label>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300">Tax ID (optional)</label>
          <input
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300">Business email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
            placeholder="admin@example.com"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <a
            className="text-sm text-neutral-400 hover:underline"
            href="/onboarding/intent"
          >
            Back
          </a>
          <button
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Submitting…" : "Save and continue"}
          </button>
        </div>
      </form>

      {formToken && (
        <div className="rounded border border-emerald-700 bg-emerald-900/10 p-3 text-sm">
          <p className="font-medium text-emerald-200">Form saved</p>
          <p className="text-neutral-300">Use this token to continue network creation.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-neutral-900 px-2 py-1 text-xs">{formToken}</code>
            <a href="/onboarding/create-network-org" className="text-emerald-400 hover:underline">
              Continue to create network
            </a>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-rose-400">{error}</div>}
    </div>
  );
}
