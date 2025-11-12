// [P0][AUTH][CODE] Onboarding wizard entry point
// Tags: P0, AUTH, CODE
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect to profile step
      router.push("/onboarding/profile");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Welcome to Fresh Schedules</h1>
        <p className="text-gray-600">Setting up your account...</p>
      </div>
    </div>
  );
}
