// [P0][APP][CODE] Page page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

type CreateNetworkOrgResponse = {
  ok: boolean;
  networkId: string;
  orgId: string;
  venueId: string;
  status: string;
};

export default function CreateNetworkOrgPage() {
  const router = useRouter();
  const { formToken, setNetworkId, setOrgId, setVenueId } = useOnboardingWizard();

  const [orgName, setOrgName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [timeZone, setTimeZone] = useState("America/Chicago");

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
        orgName,
        industry: "restaurant",
        approxLocations: 1,
        hasCorporateAboveYou: false,
        venueName,
        location: {
          street1: "",
          street2: "",
          city,
          state,
          postalCode,
          countryCode,
          timeZone,
        },
      };

      const res = await fetch("/api/onboarding/create-network-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as Partial<CreateNetworkOrgResponse>;

      if (!res.ok || !data.ok) {
        if (data && "error" in data) {
          // @ts-expect-error loose shape
          setError(data.error as string);
        } else {
          setError("Failed to create network");
        }
        setSubmitting(false);
        return;
      }

      setNetworkId(data.networkId || null);
      setOrgId(data.orgId || null);
      setVenueId(data.venueId || null);

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
          We need your admin responsibility form before we can create your network.
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
      <h1 className="text-2xl font-semibold">Create your first location</h1>
      <p className="text-sm text-slate-600">
        We&apos;ll set up a network and your first organization and venue.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Organization name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Venue name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">State</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Postal code</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country code</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              required
            />
          </div>
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create workspace"}
        </button>
      </form>
    </div>
  );
}
