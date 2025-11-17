// [P2][UI][CODE] Inbox
// Tags: P2, UI, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from "react";
const Inbox = React.memo(() => {
    // Memoized messages for performance
    const messages = useMemo(() => [
        {
            id: "m1",
            title: "Schedule Published",
            body: "Your schedule has been published successfully",
            type: "success",
            time: "2 hours ago",
        },
        {
            id: "m2",
            title: "New Message",
            body: "You have a new message from the team",
            type: "info",
            time: "1 day ago",
        },
        {
            id: "m3",
            title: "Receipt Generated",
            body: "Receipt for your recent transaction is ready",
            type: "neutral",
            time: "3 days ago",
        },
    ], []);
    const getTypeStyles = (type) => {
        switch (type) {
            case "success":
                return "border-secondary bg-secondary/5";
            case "info":
                return "border-primary bg-primary/5";
            default:
                return "border-surface-accent bg-surface-accent/50";
        }
    };
    return (_jsxs("div", { className: "card p-4", children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-primary", children: "Inbox" }), _jsx("div", { className: "max-h-64 space-y-3 overflow-y-auto", children: messages.map((m) => (_jsx("div", { className: `cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${getTypeStyles(m.type)}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-text", children: m.title }), _jsx("div", { className: "mt-1 text-sm text-text-muted", children: m.body })] }), _jsx("div", { className: "ml-2 text-xs text-text-muted", children: m.time })] }) }, m.id))) }), messages.length === 0 && (_jsxs("div", { className: "py-8 text-center text-text-muted", children: [_jsx("div", { className: "mb-2 text-4xl", children: "\uD83D\uDCED" }), _jsx("p", { children: "No messages yet" })] }))] }));
});
Inbox.displayName = "Inbox";
export default Inbox;
