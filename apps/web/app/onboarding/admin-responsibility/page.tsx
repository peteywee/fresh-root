// [P0][FIREBASE][CODE] Page page component
// Tags: P0, FIREBASE, CODE
"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

export default function AdminResponsibilityPage() {
  const router = useRouter();
  const { intent, setFormToken } = useOnboardingWizard();

  const [legalEntityName, setLegalEntityName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [liabilityAcknowledged, setLiabilityAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [signature, setSignature] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        legalEntityName,
        taxId,
        countryCode,
        businessEmail,
        businessPhone,
        liabilityAcknowledged,
        termsAcceptedVersion: termsAccepted ? "TOS-2025-01" : "",
        privacyAcceptedVersion: privacyAccepted ? "PRIV-2025-01" : "",
        adminSignature: {
          type: "typed",
          value: signature,
        },
      };

      const res = await fetch("/api/onboarding/admin-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.formToken) {
        setError(data.error || "Failed to submit admin responsibility form");
        setSubmitting(false);
        return;
      }

      setFormToken(data.formToken as string);

      if (intent === "create_corporate") {
        router.push("/onboarding/create-network-corporate");
      } else {
        router.push("/onboarding/create-network-org");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
      setSubmitting(false);
    }
  }

  if (!intent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">We need to know what you&apos;re setting up first.</p>
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          onClick={() => router.push("/onboarding/intent")}
        >
          Back to intent selection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin responsibility</h1>
      <p className="text-sm text-slate-600">
        This step designates who is legally responsible for this workspace and the data in it.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Legal entity name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={legalEntityName}
            onChange={(e) => setLegalEntityName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Tax ID</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Business email</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Business phone</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={liabilityAcknowledged}
              onChange={(e) => setLiabilityAcknowledged(e.target.checked)}
            />
            <span>I understand I&apos;m responsible for how this workspace is used.</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>I agree to the Terms of Service.</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>I agree to the Privacy Policy.</span>
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Type your full name as signature</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
