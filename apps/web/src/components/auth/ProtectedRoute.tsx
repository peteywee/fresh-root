'use client';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) return <div className="p-6">Loading…</div>;
  return <>{children}</>;
}
