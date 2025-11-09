"use client";

"use client";

import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [phone, setPhone] = useState("");
  const [timeZone, setTimeZone] = useState("America/Chicago");
  const [selfDeclaredRole, setSelfDeclaredRole] = useState("owner_founder_director");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          preferredName,
          phone,
          timeZone,
          selfDeclaredRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = (data as { error?: string }).error;
        setError(err || "Failed to save profile");
        setSubmitting(false);
        return;
      }

      router.push("/onboarding/intent");
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tell us who you are</h1>
      <p className="text-sm text-slate-600">
        Before we set up any organizations or venues, we need a basic profile for you.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Preferred name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Time zone</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Which best describes you?</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={selfDeclaredRole}
            onChange={(e) => setSelfDeclaredRole(e.target.value)}
          >
            <option value="owner_founder_director">Owner / Founder / Director</option>
            <option value="manager_supervisor">Manager / Supervisor</option>
            <option value="corporate_hq">Corporate / HQ</option>
            <option value="manager">Manager (generic)</option>
            <option value="org_owner">Org owner (legacy)</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
