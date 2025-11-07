// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import React, { useState } from "react";

export default function ProfileStep() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [role, setRole] = useState("manager");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function saveAndNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      displayName: fullName,
      phoneNumber: phone,
      preferences: { language },
      timeZone,
      selfDeclaredRole: role,
    } as const;

    setBusy(true);
    try {
      // Attempt server-side save (PATCH existing profile endpoint)
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // success — advance to intent
        window.location.href = "/onboarding/intent";
        return;
      }

      // server returned non-OK: show message but allow local fallback
      const body = await res.json().catch(() => null);
      setError(body?.message || `Server returned ${res.status}`);

      // persist locally as fallback so wizard can continue even if auth/session not wired
      try {
        localStorage.setItem(
          "onb_profile",
          JSON.stringify({ fullName, phone, language, timeZone, selfDeclaredRole: role }),
        );
      } catch {}

      window.location.href = "/onboarding/intent";
    } catch (e) {
      // network error: persist locally and continue
      try {
        localStorage.setItem(
          "onb_profile",
          JSON.stringify({ fullName, phone, language, timeZone, selfDeclaredRole: role }),
        );
      } catch {}
      window.location.href = "/onboarding/intent";
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={saveAndNext} className="space-y-4">
      <div>
        <label className="block text-sm text-neutral-300">Full name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-300">Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          placeholder="+12065551234"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-neutral-300">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-neutral-300">Time zone</label>
          <input
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-300">I am a</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
        >
          <option value="manager">Manager / Owner</option>
          <option value="staff">Staff</option>
          <option value="corporate">Corporate / HQ</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        {error ? <div className="text-sm text-rose-400">{error}</div> : <div />}
        <div>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {busy ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </form>
  );
}
