// [P0][APP][CODE] Create network organization page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

type OrgFormState = {
  orgName: string;
  venueName: string;
  city: string;
  state: string;
};

export default function CreateNetworkOrgPage() {
  const router = useRouter();
  const nav = router as any;
  const [form, setForm] = useState<OrgFormState>({
    orgName: "",
    venueName: "",
    city: "",
    state: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.orgName.trim() || !form.venueName.trim()) {
      setError("Organization name and primary venue are required.");
      return;
    }

    setError(null);

    // Real implementation would POST to /api/onboarding/create-network-org.
    nav.push("/onboarding/block-4");
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Step 4: Create your organization</h1>
        <p className="text-sm text-gray-600">
          Define your primary organization and first venue. You can add more locations later.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-800">
            Organization name
          </label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            value={form.orgName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Top Shelf Service – Main Location"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="venueName" className="block text-sm font-medium text-gray-800">
            Primary venue name
          </label>
          <input
            id="venueName"
            name="venueName"
            type="text"
            value={form.venueName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Arlington Cafe"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-800">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="w-24 space-y-1">
            <label htmlFor="state" className="block text-sm font-medium text-gray-800">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="TX"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => nav.push("/onboarding/admin-responsibility")}
            className="text-sm text-gray-600 underline"
          >
            Back to Admin responsibilities
          </button>

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Continue to Finalization
          </button>
        </div>
      </form>
    </main>
  );
}
