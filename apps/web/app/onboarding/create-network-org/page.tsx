// [P0][APP][CODE] Create network organization page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

type OrgFormState = {
  displayName: string;
  venueName: string;
  city: string;
  state: string;
  segment: string;
};

export default function CreateNetworkOrgPage() {
  const router = useRouter();
  const { setOrgId, setNetworkId } = useOnboardingWizard();
  const [form, setForm] = useState<OrgFormState>({
    displayName: "",
    venueName: "",
    city: "",
    state: "",
    segment: "restaurant",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.displayName.trim() || !form.venueName.trim()) {
      setError("Organization name and primary venue are required.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const slug = form.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const res = await fetch("/api/onboarding/create-network-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          displayName: form.displayName,
          kind: "independent_org",
          segment: form.segment,
          metadata: {
            venueName: form.venueName,
            city: form.city,
            state: form.state,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message || "Failed to create organization");
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      if (data.data?.id) {
        setOrgId(data.data.id);
        setNetworkId(data.data.id);
      }

      router.push("/onboarding/block-4");
    } catch (err) {
      console.error("Create org failed:", err);
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
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
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-800">
            Organization name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={form.displayName}
            onChange={handleChange}
            disabled={submitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
            placeholder="e.g., Top Shelf Service"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="segment" className="block text-sm font-medium text-gray-800">
            Business type
          </label>
          <select
            id="segment"
            name="segment"
            value={form.segment}
            onChange={handleChange}
            disabled={submitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="restaurant">Restaurant</option>
            <option value="qsr">Quick Service Restaurant</option>
            <option value="bar">Bar / Nightclub</option>
            <option value="hotel">Hotel / Hospitality</option>
            <option value="retail">Retail</option>
            <option value="nonprofit">Nonprofit</option>
            <option value="other">Other</option>
          </select>
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
            disabled={submitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
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
              disabled={submitting}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
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
              disabled={submitting}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              placeholder="TX"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/onboarding/admin-responsibility")}
            disabled={submitting}
            className="text-sm text-gray-600 underline disabled:opacity-50"
          >
            Back to Admin responsibilities
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Continue to Finalization"}
          </button>
        </div>
      </form>
    </main>
  );
}
