import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const orgId = await getAuthenticatedOrgId();
    // Redirect to login if not authenticated or no org
    if (!orgId) {
        redirect("/login");
    }
    // Fetch schedules for the authenticated org
    const rows = await fetchSchedules(orgId, 12);
    return (_jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-bold", children: "Recent Schedules" }), _jsxs("span", { className: "text-sm text-neutral-400", children: ["Org: ", orgId] })] }), _jsx("div", { className: "overflow-x-auto rounded-xl border border-neutral-800", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "bg-neutral-900/40", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left", children: "Name" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Week Start" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Venue" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Status" }), _jsx("th", { className: "px-3 py-2 text-left", children: "ID" })] }) }), _jsxs("tbody", { children: [rows.map((r) => (_jsxs("tr", { className: "border-t border-neutral-800", children: [_jsx("td", { className: "px-3 py-2 font-medium", children: r.name }), _jsx("td", { className: "px-3 py-2", children: r.weekStart?.slice(0, 10) }), _jsx("td", { className: "px-3 py-2 text-neutral-400", children: r.venueId }), _jsx("td", { className: "px-3 py-2", children: _jsx("span", { className: `inline-block rounded px-2 py-1 text-xs ${r.status === "published"
                                                    ? "bg-green-900/30 text-green-400"
                                                    : "bg-yellow-900/30 text-yellow-400"}`, children: r.status }) }), _jsx("td", { className: "px-3 py-2 text-neutral-500", children: r.id })] }, r.id))), rows.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "px-3 py-4 text-neutral-400", colSpan: 5, children: "No schedules yet. Create your first schedule to get started." }) }))] })] }) }), _jsx("p", { className: "text-xs text-neutral-500", children: "Cached with ISR (60s) \u2022 Session-based org gating \u2022 Publishing invalidates via tag" })] }));
}
