// [P0][FIREBASE][CODE] Page page component
// Tags: P0, FIREBASE, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../lib/auth-context";

export default function AdminResponsibility() {
  const router = useRouter();
  const { user } = useAuth();

  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [role, setRole] = useState<string>("network_owner");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      networkId: "", // TODO: wire real networkId when available
      uid: user?.uid ?? "",
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
      data: {
        legalName: legalName || undefined,
        taxId: taxId || undefined,
      },
    } as const;

    try {
      const res = await fetch("/api/onboarding/admin-form", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || json?.error || "Submission failed");
        return;
      }

      const token = json?.formToken;
      if (token) {
        try {
          localStorage.setItem("onb_formToken", String(token));
        } catch {}
        const url = "/onboarding/create-network-org?formToken=" + encodeURIComponent(String(token));
        // router.push typing is strict in App Router — use a cast to avoid RouteImpl literal type issues
        router.push(url as Route);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Admin Responsibility</h1>
        <p className="text-muted-foreground mb-4 text-sm">
          We need a few legal details to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Legal name</label>
            <input
              className="mt-1 block w-full rounded border px-3 py-2"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tax ID</label>
            <input
              className="mt-1 block w-full rounded border px-3 py-2"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded border px-3 py-2"
            >
              <option value="network_owner">Network owner</option>
              <option value="network_admin">Network admin</option>
              <option value="org_owner">Org owner</option>
              <option value="org_admin">Org admin</option>
            </select>
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit form"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
