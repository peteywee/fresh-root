"use client";
import React, { useState } from "react";

export default function ProfileStep() {
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("en");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [role, setRole] = useState("manager");

  function saveAndNext(e: React.FormEvent) {
    e.preventDefault();
    const profile = { fullName, phone, language, timeZone, selfDeclaredRole: role };
    // persist locally for now; backend wiring happens later
    try {
      localStorage.setItem("onb_profile", JSON.stringify(profile));
    } catch {}
    // use location assignment to avoid strict Route types in app router
    window.location.href = "/onboarding/intent";
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

      <div className="flex items-center justify-end">
        <button className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium">Continue</button>
      </div>
    </form>
  );
}
