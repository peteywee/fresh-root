// [P0][APP][CODE] Page page component
// Tags: P0, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

import { useOnboardingWizard } from "../_wizard/OnboardingWizardContext";

type JoinResponse = {
  ok: boolean;
  networkId: string;
  orgId: string;
  role: string;
};

export default function JoinPage() {
  const router = useRouter();
  const { setNetworkId, setOrgId, setJoinedRole } = useOnboardingWizard();

  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/join-with-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await res.json().catch(() => ({}))) as Partial<JoinResponse>;

      if (!res.ok || !data.ok) {
        if (data && "error" in data) {
          // @ts-expect-error loose
          setError(data.error as string);
        } else {
          setError("Failed to join with token");
        }
        setSubmitting(false);
        return;
      }

      setNetworkId(data.networkId || null);
      setOrgId(data.orgId || null);
      setJoinedRole(data.role || null);

      router.push("/onboarding/block-4");
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Join an existing workspace</h1>
      <p className="text-sm text-slate-600">
        Paste the invite or access token you were given by your manager or admin.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Access token</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Joining..." : "Join workspace"}
        </button>
      </form>
    </div>
  );
}
