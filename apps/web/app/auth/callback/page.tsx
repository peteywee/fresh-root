"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeEmailLinkIfPresent, completeGoogleRedirectOnce, establishServerSession } from '../../../src/lib/auth-helpers';
import { reportError } from '../../../src/lib/error/reporting';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle'|'working'|'done'|'error'>('idle');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus('working');
      try {
        // Complete either email link or Google redirect if applicable
        const completedEmail = await completeEmailLinkIfPresent();
        const completedGoogle = await completeGoogleRedirectOnce();
        if (completedEmail || completedGoogle) {
          await establishServerSession();
        }
        if (!mounted) return;
        setStatus('done');
        router.replace('/');
      } catch (e) {
        reportError(e as any, { phase: 'auth_callback' });
        if (!mounted) return;
        setStatus('error');
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">Signing you in…</h1>
        <p className="text-gray-500">Completing authentication. You’ll be redirected shortly.</p>
        {status === 'error' && (
          <p className="text-red-600 mt-4">Something went wrong. Please try again from the login page.</p>
        )}
      </div>
    </div>
  );
}
