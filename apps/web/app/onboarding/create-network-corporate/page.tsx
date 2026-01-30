// [P0][CODE] Create corporate network page component
// Tags: P0, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

async function activateNetwork(networkId: string) {
  const res = await fetch("/api/onboarding/activate-network", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ networkId }),
  });
  if (!res.ok) throw new Error("Failed to activate network");
}

// Narrow router usage to only push to eliminate any.
type NavRouter = Pick<ReturnType<typeof useRouter>, "push">;

type CorporateFormState = {
  corporateName: string;
  brandName: string;
  hqCity: string;
  hqState: string;
  locationCount: string;
};

export default function CreateNetworkCorporatePage() {
  const router = useRouter();
  const nav: NavRouter = { push: router.push };
  const { setNetworkId, setOrgId } = useOnboardingWizard();
  const [form, setForm] = useState<CorporateFormState>({
    corporateName: "",
    brandName: "",
    hqCity: "",
    hqState: "",
    locationCount: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.corporateName.trim() || !form.brandName.trim()) {
      setError("Corporate entity name and brand are required.");
      return;
    }

    setError(null);

    try {
      const res = await fetch("/api/onboarding/create-network-corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corporateName: form.corporateName,
          brandName: form.brandName,
          hqCity: form.hqCity,
          hqState: form.hqState,
          locationCount: form.locationCount,
          formToken: "", // optional, keep empty until admin-responsibility supplies
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message || "Failed to create corporate network");
        return;
      }

      const data = await res.json();
      const createdId = data.data?.id;
      if (createdId) {
        setNetworkId(createdId);
        setOrgId(createdId);
        try {
          await activateNetwork(createdId);
        } catch (activationError) {
          console.warn("activate-network failed", activationError);
        }
      }

      nav.push("/onboarding/block-4");
    } catch (err) {
      console.error("Create corporate network failed", err);
      setError("Network error. Please try again.");
    }
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Step 4: Create your corporate network</h1>
        <p className="text-sm text-gray-600">
          Define your corporate entity and brand so we can link your locations together under one
          network.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="corporateName" className="block text-sm font-medium text-gray-800">
            Corporate entity name
          </label>
          <input
            id="corporateName"
            name="corporateName"
            type="text"
            value={form.corporateName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Top Shelf Service Holdings, LLC"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="brandName" className="block text-sm font-medium text-gray-800">
            Brand name
          </label>
          <input
            id="brandName"
            name="brandName"
            type="text"
            value={form.brandName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., Fresh Schedules Cafes"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label htmlFor="hqCity" className="block text-sm font-medium text-gray-800">
              HQ City
            </label>
            <input
              id="hqCity"
              name="hqCity"
              type="text"
              value={form.hqCity}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="w-24 space-y-1">
            <label htmlFor="hqState" className="block text-sm font-medium text-gray-800">
              State
            </label>
            <input
              id="hqState"
              name="hqState"
              type="text"
              value={form.hqState}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="TX"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="locationCount" className="block text-sm font-medium text-gray-800">
            Approximate location count
          </label>
          <input
            id="locationCount"
            name="locationCount"
            type="number"
            min={1}
            value={form.locationCount}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g., 5"
          />
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
