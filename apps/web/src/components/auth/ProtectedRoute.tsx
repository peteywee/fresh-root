'use client';
import React, { useEffect, type ReactNode } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) return React.createElement('div', { className: 'p-6' }, 'Loading…');
  return React.createElement(React.Fragment, null, children);
}
