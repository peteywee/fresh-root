// [P0][FIREBASE][CODE] Page page component
// Tags: P0, FIREBASE, CODE
"use client";
import React from "react";
import { useOnboardingStore } from "../_stores/useOnboardingStore";

export default function AdminResponsibility() {
  const { role, formToken, isSubmitting, error, setRole, setFormToken, setIsSubmitting, setError } =
    useOnboardingStore();
  const [result, setResult] = React.useState<Record<string, unknown> | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);
    
    try {
      const payload = {
        networkId: "",
        uid: "",
        role,
        certification: {
          acknowledgesDataProtection: true,
          acknowledgesGDPRCompliance: true,
          acknowledgesAccessControl: true,
          acknowledgesMFARequirement: true,
          acknowledgesAuditTrail: true,
          acknowledgesIncidentReporting: true,
          understandsRoleScope: true,
          agreesToTerms: true,
        },
      };

      const res = await fetch("/api/onboarding/admin-form", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      
      if (json?.formToken) {
        setFormToken(json.formToken);
      }
      
      setResult(json);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      setResult({ error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Admin Responsibility Form</h1>
      <p className="mt-2">Fill and submit the admin responsibility form to obtain a form token.</p>

      {formToken && (
        <div className="mt-4 rounded bg-emerald-900/30 p-3 text-sm text-emerald-300">
          Form token saved: {formToken}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded bg-red-900/30 p-3 text-sm text-red-300">
          Error: {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm text-neutral-300">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 px-3 py-2 text-white"
          >
            <option value="network_owner">Network owner</option>
            <option value="network_admin">Network admin</option>
            <option value="org_owner">Org owner</option>
            <option value="org_admin">Org admin</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button 
            disabled={isSubmitting}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit form"}
          </button>
        </div>
      </form>

      {result && (
        <pre className="mt-4 overflow-auto rounded bg-neutral-900 p-3 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
