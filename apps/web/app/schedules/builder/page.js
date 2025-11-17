// [P2][UI][CODE] Page page component
// Tags: P2, UI, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export default function ScheduleBuilder() {
    const [shifts, setShifts] = useState([
        { id: "s1", day: 0, start: "09:00", end: "13:00", title: "Morning" },
        { id: "s2", day: 2, start: "12:00", end: "18:00", title: "Afternoon" },
    ]);
    function addDemoShift(day = 0) {
        const id = `s-${Date.now()}`;
        setShifts((s) => [...s, { id, day, start: "10:00", end: "14:00", title: "New" }]);
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Week view (prototype)" }), _jsx("div", { children: _jsx("button", { onClick: () => addDemoShift(0), className: "rounded bg-emerald-600 px-3 py-1 text-sm", children: "Add shift" }) })] }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: days.map((d, i) => (_jsxs("div", { className: "rounded border border-neutral-800 p-2", children: [_jsx("div", { className: "mb-2 text-sm font-medium text-neutral-300", children: d }), _jsx("div", { className: "space-y-2", children: shifts
                                .filter((sh) => sh.day === i)
                                .map((sh) => (_jsxs("div", { className: "rounded bg-neutral-900 px-2 py-1 text-sm", children: [sh.title, " \u2014 ", sh.start, "-", sh.end] }, sh.id))) })] }, d))) })] }));
}
