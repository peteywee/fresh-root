// [P2][APP][CODE] Onboarding join page component
// Tags: P2, APP, CODE
"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

type JoinFormState = {
  token: string;
  email: string;
};

export default function JoinPage() {
  const router = useRouter();
  const nav = router as any;
  const [form, setForm] = useState<JoinFormState>({
    token: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.token.trim()) {
      setError("Invite token is required.");
      return;
    }

    setError(null);

    // Real implementation would POST to /api/onboarding/join-with-token.
    nav.push("/onboarding/block-4");
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Step 3: Join with token</h1>
        <p className="text-sm text-gray-600">
          Enter the invite token sent by your organization to connect your account.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="token" className="block text-sm font-medium text-gray-800">
            Invite token
          </label>
          <input
            id="token"
            name="token"
            type="text"
            value={form.token}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Paste your invite token"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-800">
            Email (optional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Used for verification if required"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => nav.push("/onboarding/intent")}
            className="text-sm text-gray-600 underline"
          >
            Back to Intent
          </button>

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Continue
          </button>
        </div>
      </form>
    </main>
  );
}
