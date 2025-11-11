// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";

import React, { useCallback, useState } from "react";

import { publishSchedule } from "../../../../src/lib/api/schedules";
import Inbox from "../../../components/Inbox";
import MonthView from "../../../components/MonthView";
import ProtectedRoute from "../../../components/ProtectedRoute";

const DashboardPage = React.memo(() => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onPublish = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      // For demo: replace with real orgId/scheduleId selection
      const orgId = "orgA";
      const scheduleId = "demo-schedule";
      await publishSchedule({ orgId, scheduleId });
      setMessage("Published successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Publish failed";
      setMessage(errorMessage);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <ProtectedRoute>
      <main className="animate-fade-in from-surface via-surface-card to-surface-accent min-h-screen bg-gradient-to-br p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="py-8 text-center">
            <h1 className="text-primary mb-2 text-4xl font-bold">Dashboard</h1>
            <p className="text-text-muted text-lg">Manage your schedules and stay updated</p>
          </header>

          <section className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onPublish}
              disabled={busy}
              className="btn-primary px-6 py-3 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <div className="flex items-center gap-2">
                  <div className="loading-skeleton h-5 w-5 rounded-full"></div>
                  Publishing…
                </div>
              ) : (
                "🚀 Publish Schedule"
              )}
            </button>
            {message && (
              <div
                className={`animate-slide-up rounded-lg px-4 py-2 text-sm ${
                  message.includes("successfully")
                    ? "border-secondary bg-secondary/10 text-secondary border"
                    : "border border-red-500 bg-red-500/10 text-red-400"
                }`}
              >
                {message}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <MonthView />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Inbox />
            </div>
          </section>

          <section
            className="card animate-slide-up p-6 text-center"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className="text-primary mb-4 text-2xl font-semibold">Quick Stats</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-surface-accent rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">12</div>
                <div className="text-text-muted">Active Schedules</div>
              </div>
              <div className="bg-surface-accent rounded-lg p-4">
                <div className="text-secondary text-2xl font-bold">5</div>
                <div className="text-text-muted">Pending Tasks</div>
              </div>
              <div className="bg-surface-accent rounded-lg p-4">
                <div className="text-primary text-2xl font-bold">98%</div>
                <div className="text-text-muted">Uptime</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
});

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
