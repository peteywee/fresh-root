// [P0][SECURITY][CODE] Page page component
// Tags: P0, SECURITY, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import ProtectedRoute from "../../components/ProtectedRoute";

/**
 * @description Renders the create network corporate step of the onboarding process.
 * This component displays a form for the user to enter a corporate name.
 * @returns {React.ReactElement} The create network corporate step page.
 */
export default function CreateNetworkCorporate() {
  const router = useRouter();
  const [corporateName, setCorporateName] = useState("");

  /**
   * @description Handles the form submission.
   * Prevents the default form submission behavior and navigates to the next step in the onboarding process.
   * @param {React.FormEvent} e - The form submission event.
   */
  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder for corporate-specific flow
    const navigate = (p: string) => (router as unknown as { push: (s: string) => void }).push(p);
    navigate("/onboarding/admin-responsibility");
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Corporate setup</h1>
        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Corporate name</label>
            <input
              className="mt-1 block w-full rounded border px-3 py-2"
              value={corporateName}
              onChange={(e) => setCorporateName(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button className="rounded bg-blue-600 px-4 py-2 text-white">Next</button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
// single CreateNetworkCorporate component above
