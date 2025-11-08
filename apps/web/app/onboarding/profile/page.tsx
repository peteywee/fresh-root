// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import ProtectedRoute from "../../components/ProtectedRoute";

export default function ProfileStep() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: call update profile API (placeholder for now)
    // Example: await fetch('/api/users/profile', ...)
    router.push("/onboarding/intent");
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <input
              className="mt-1 block w-full rounded border px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              className="mt-1 block w-full rounded border px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
// single ProfileStep component (form) above
