// [P0][SECURITY][CODE] Page page component
// Tags: P0, SECURITY, CODE
"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

type CreateNetworkCorporateResponse = {
  ok: boolean;
  networkId: string;
  corpId: string;
  status: string;
};

export default function CreateNetworkCorporatePage() {
  const router = useRouter();
  const { formToken, setNetworkId, setCorpId } = useOnboardingWizard();

  const [corporateName, setCorporateName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("restaurant");
  const [approxLocations, setApproxLocations] = useState(10);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formToken) {
      setError("Missing admin form token. Please restart onboarding.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        formToken,
        corporateName,
        brandName,
        industry,
        approxLocations,
      };

      const res = await fetch("/api/onboarding/create-network-corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as Partial<CreateNetworkCorporateResponse>;

      if (!res.ok || !data.ok) {
        if (data && "error" in data) {
          // @ts-expect-error loose
          setError(data.error as string);
        } else {
          setError("Failed to create corporate network");
        }
        setSubmitting(false);
        return;
      }

      setNetworkId(data.networkId || null);
      setCorpId(data.corpId || null);

      router.push("/onboarding/block-4");
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
      setSubmitting(false);
    }
  }

  if (!formToken) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          We need your admin responsibility form before we can create your corporate network.
        </p>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          onClick={() => router.push("/onboarding/admin-responsibility")}
        >
          Go back to admin form
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create your corporate network</h1>
      <p className="text-sm text-slate-600">
        This will set up a network owned by your corporate / HQ entity.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Corporate legal name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={corporateName}
            onChange={(e) => setCorporateName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Brand name (optional)</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Industry</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Approx. locations</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={approxLocations}
            onChange={(e) => setApproxLocations(Number(e.target.value) || 1)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create corporate network"}
        </button>
      </form>
    </div>
  );
}
