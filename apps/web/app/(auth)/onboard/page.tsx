// [P0][AUTH][CODE] Onboard entry sample
// This moved from /(auth)/onboarding to avoid duplicate route collisions
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";

export default function OnboardEntry() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.push("/onboarding/profile");
  }, [user, router]);
  return <div>Onboarding redirecting...</div>;
}
