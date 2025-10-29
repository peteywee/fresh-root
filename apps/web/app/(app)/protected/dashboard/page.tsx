"use client";

import React from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { publishSchedule } from '../../../../src/lib/api/schedules';

export default function DashboardPage() {
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const onPublish = async () => {
    setBusy(true);
    setMessage(null);
    try {
      // For demo: replace with real orgId/scheduleId selection
      const orgId = 'orgA';
      const scheduleId = 'demo-schedule';
      const res = await publishSchedule({ orgId, scheduleId });
      setMessage('Published successfully');
      console.log('publish result', res);
    } catch (err: any) {
      setMessage(err?.message || 'Publish failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onPublish}
              disabled={busy}
              className="rounded px-3 py-2 bg-blue-600 text-white"
            >
              {busy ? 'Publishing…' : 'Publish Schedule'}
            </button>
            {message && <div className="text-sm text-gray-700">{message}</div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-3 rounded">
              <h2 className="font-medium">Month View</h2>
              <div className="mt-2">
                {/* lightweight MonthView stub */}
                <div className="text-sm text-gray-600">Month view placeholder (rendering optimized)</div>
              </div>
            </div>
            <div className="border p-3 rounded">
              <h2 className="font-medium">Inbox</h2>
              <div className="mt-2 text-sm text-gray-600">Messages & receipts placeholder</div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
