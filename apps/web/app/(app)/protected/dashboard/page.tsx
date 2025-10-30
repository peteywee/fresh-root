"use client";

import React, { useCallback, useState } from 'react';

import { publishSchedule } from '../../../../src/lib/api/schedules';
import Inbox from '../../../components/Inbox';
import MonthView from '../../../components/MonthView';
import ProtectedRoute from '../../../components/ProtectedRoute';

const DashboardPage = React.memo(() => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onPublish = useCallback(async () => {
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
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 bg-gradient-to-br from-surface via-surface-card to-surface-accent animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="text-center py-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
            <p className="text-text-muted text-lg">Manage your schedules and stay updated</p>
          </header>

          <section className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={onPublish}
              disabled={busy}
              className="btn-primary px-6 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (
                <div className="flex items-center gap-2">
                  <div className="loading-skeleton w-5 h-5 rounded-full"></div>
                  Publishing…
                </div>
              ) : (
                '🚀 Publish Schedule'
              )}
            </button>
            {message && (
              <div className={`text-sm px-4 py-2 rounded-lg animate-slide-up ${
                message.includes('successfully')
                  ? 'bg-secondary/10 text-secondary border border-secondary'
                  : 'bg-red-500/10 text-red-400 border border-red-500'
              }`}>
                {message}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <MonthView />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Inbox />
            </div>
          </section>

          <section className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-semibold text-primary mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-accent rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-text-muted">Active Schedules</div>
              </div>
              <div className="bg-surface-accent rounded-lg p-4">
                <div className="text-2xl font-bold text-secondary">5</div>
                <div className="text-text-muted">Pending Tasks</div>
              </div>
              <div className="bg-surface-accent rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-text-muted">Uptime</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;
