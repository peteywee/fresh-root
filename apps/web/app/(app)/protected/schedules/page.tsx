// [P1][APP][PAGE] Schedules page component with real auth
// Tags: P1, APP, PAGE, SCHEDULES, AUTH
// Server component: schedules list uses session-based org gating + ISR
import { redirect } from "next/navigation";

import { getAuthenticatedOrgId, fetchSchedules } from "./page.server";

// 60s ISR; override to 'force-dynamic' only if you truly need live reads.
export const revalidate = 60;

export const metadata = {
  title: "Schedules | Fresh Schedules",
  description: "Recent schedules by week and venue.",
};

export default async function SchedulesPage() {
  // Get authenticated user's org from session cookie
  const _orgId = await getAuthenticatedOrgId();

  // Redirect to login if not authenticated or no org
  if (!orgId) {
    redirect("/login");
  }

  // Fetch schedules for the authenticated org
  const rows = await fetchSchedules(orgId, 12);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Recent Schedules</h1>
        <span className="text-sm text-neutral-400">Org: {orgId}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/40">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Week Start</th>
              <th className="px-3 py-2 text-left">Venue</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-800">
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{r.weekStart?.slice(0, 10)}</td>
                <td className="px-3 py-2 text-neutral-400">{r.venueId}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs ${
                      r.status === "published"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-neutral-500">{r.id}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={5}>
                  No schedules yet. Create your first schedule to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Cached with ISR (60s) • Session-based org gating • Publishing invalidates via tag
      </p>
    </div>
  );
}
