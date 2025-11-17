// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { publishSchedule } from "../../../../src/lib/api/schedules";
import Inbox from "../../../components/Inbox";
import MonthView from "../../../components/MonthView";
import ProtectedRoute from "../../../components/ProtectedRoute";
const DashboardPage = React.memo(() => {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const onPublish = useCallback(async () => {
        setBusy(true);
        setMessage(null);
        try {
            // For demo: replace with real orgId/scheduleId selection
            const orgId = "orgA";
            const scheduleId = "demo-schedule";
            await publishSchedule({ orgId, scheduleId });
            setMessage("Published successfully");
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Publish failed";
            setMessage(errorMessage);
        }
        finally {
            setBusy(false);
        }
    }, []);
    return (_jsx(ProtectedRoute, { children: _jsx("main", { className: "min-h-screen animate-fade-in bg-gradient-to-br from-surface via-surface-card to-surface-accent p-6", children: _jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [_jsxs("header", { className: "py-8 text-center", children: [_jsx("h1", { className: "mb-2 text-4xl font-bold text-primary", children: "Dashboard" }), _jsx("p", { className: "text-lg text-text-muted", children: "Manage your schedules and stay updated" })] }), _jsxs("section", { className: "mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row", children: [_jsx("button", { onClick: onPublish, disabled: busy, className: "btn-primary px-6 py-3 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50", children: busy ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "loading-skeleton h-5 w-5 rounded-full" }), "Publishing\u2026"] })) : ("🚀 Publish Schedule") }), message && (_jsx("div", { className: `animate-slide-up rounded-lg px-4 py-2 text-sm ${message.includes("successfully")
                                    ? "border border-secondary bg-secondary/10 text-secondary"
                                    : "border border-red-500 bg-red-500/10 text-red-400"}`, children: message }))] }), _jsxs("section", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [_jsx("div", { className: "animate-slide-up", style: { animationDelay: "0.1s" }, children: _jsx(MonthView, {}) }), _jsx("div", { className: "animate-slide-up", style: { animationDelay: "0.2s" }, children: _jsx(Inbox, {}) })] }), _jsxs("section", { className: "card animate-slide-up p-6 text-center", style: { animationDelay: "0.3s" }, children: [_jsx("h2", { className: "mb-4 text-2xl font-semibold text-primary", children: "Quick Stats" }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [_jsxs("div", { className: "rounded-lg bg-surface-accent p-4", children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: "12" }), _jsx("div", { className: "text-text-muted", children: "Active Schedules" })] }), _jsxs("div", { className: "rounded-lg bg-surface-accent p-4", children: [_jsx("div", { className: "text-2xl font-bold text-secondary", children: "5" }), _jsx("div", { className: "text-text-muted", children: "Pending Tasks" })] }), _jsxs("div", { className: "rounded-lg bg-surface-accent p-4", children: [_jsx("div", { className: "text-2xl font-bold text-primary", children: "98%" }), _jsx("div", { className: "text-text-muted", children: "Uptime" })] })] })] })] }) }) }));
});
DashboardPage.displayName = "DashboardPage";
export default DashboardPage;
