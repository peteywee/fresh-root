// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { user, loading, signInGoogle } = useAuth();
  const router = useRouter();
  if (!loading && user) router.replace("/dashboard");
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      <button className="fs-button" onClick={signInGoogle}>
        Continue with Google
      </button>
    </main>
  );
}
