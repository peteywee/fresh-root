// Server component: schedules list uses ISR + cache tag for rapid render.
import { fetchRecentSchedulesLite } from "../../../lib/db";

// 60s ISR; override to 'force-dynamic' only if you truly need live reads.
export const revalidate = 60;

export const metadata = {
  title: "Schedules | Fresh Schedules",
  description: "Recent schedules by week and venue.",
};

async function getOrgId(): Promise<string> {
  // TODO: replace with real org gating (custom claims or membership)
  return "demo-org";
}

export default async function SchedulesPage() {
  const orgId = await getOrgId();
  const rows = await fetchRecentSchedulesLite(orgId, 12);

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-bold">Recent Schedules</h1>
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/40">
            <tr>
              <th className="px-3 py-2 text-left">Week Start</th>
              <th className="px-3 py-2 text-left">Venue</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-800">
                <td className="px-3 py-2">{r.weekStart?.slice(0, 10)}</td>
                <td className="px-3 py-2">{r.venueId}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2 text-neutral-500">{r.id}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-neutral-400" colSpan={4}>
                  No schedules yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Cached with ISR (60s). Publishing should invalidate via tag.
      </p>
    </div>
  );
}
