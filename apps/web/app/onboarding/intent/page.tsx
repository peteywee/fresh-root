// [P2][APP][CODE] Intent onboarding page component
// Tags: P2, APP, CODE
"use client";

import { useRouter } from "next/navigation";

import ProtectedRoute from "../../components/ProtectedRoute";

/**
 * @description Renders the intent step of the onboarding process.
 * This component displays options for the user to select their intent, such as joining a team, setting up a team, or managing multiple locations.
 * @returns {React.ReactElement} The intent step page.
 */
export default function IntentStep() {
  const router = useRouter();
  const navigate = (p: string) => (router as unknown as { push: (s: string) => void }).push(p);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">What's your intent?</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate("/onboarding/join")}
            className="rounded border p-6 text-left"
            aria-label="Join: I was invited to join a team"
          >
            <h3 className="font-medium">Join</h3>
            <p className="text-muted-foreground text-sm">I was invited to join a team</p>
          </button>

          <button
            onClick={() => navigate("/onboarding/create-network-org")}
            className="rounded border p-6 text-left"
            aria-label="Set up my team: Create an org and venue"
          >
            <h3 className="font-medium">Set up my team</h3>
            <p className="text-muted-foreground text-sm">Create an org and venue</p>
          </button>

          <button
            onClick={() => navigate("/onboarding/create-network-corporate")}
            className="rounded border p-6 text-left"
            aria-label="Corporate / HQ: I manage multiple locations"
          >
            <h3 className="font-medium">Corporate / HQ</h3>
            <p className="text-muted-foreground text-sm">I manage multiple locations</p>
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
