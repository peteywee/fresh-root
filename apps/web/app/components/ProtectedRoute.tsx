'use client';

import React from 'react';

/**
 * Minimal placeholder guard:
 * - No real auth check yet (to avoid adding peers/deps)
 * - If "auth" not implemented, we still render children + banner.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthed = false; // replace when auth is wired
  if (!isAuthed) {
    return (
      <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 text-sm">
        <div className="font-semibold">Not authenticated</div>
        <div className="opacity-80">Auth not wired yet; showing content for development.</div>
        <div className="mt-3">{children}</div>
      </div>
    );
  }
  return <>{children}</>;
}
