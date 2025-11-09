// [P2][UI][CODE] Page page component
// Tags: P2, UI, CODE
"use client";
import React, { useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * @description Renders a weekly schedule builder interface.
 * This component allows users to view and add shifts to a 7-day calendar.
 * @returns {React.ReactElement} The schedule builder page.
 */
export default function ScheduleBuilder() {
  const [shifts, setShifts] = useState([
    { id: "s1", day: 0, start: "09:00", end: "13:00", title: "Morning" },
    { id: "s2", day: 2, start: "12:00", end: "18:00", title: "Afternoon" },
  ]);

  /**
   * @description Adds a new demo shift to the schedule for a given day.
   * @param {number} [day=0] - The index of the day (0-6) to add the shift to.
   */
  function addDemoShift(day = 0) {
    const id = `s-${Date.now()}`;
    setShifts((s) => [...s, { id, day, start: "10:00", end: "14:00", title: "New" }]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Week view (prototype)</h2>
        <div>
          <button
            onClick={() => addDemoShift(0)}
            className="rounded bg-emerald-600 px-3 py-1 text-sm"
          >
            Add shift
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={d} className="rounded border border-neutral-800 p-2">
            <div className="mb-2 text-sm font-medium text-neutral-300">{d}</div>
            <div className="space-y-2">
              {shifts
                .filter((sh) => sh.day === i)
                .map((sh) => (
                  <div key={sh.id} className="rounded bg-neutral-900 px-2 py-1 text-sm">
                    {sh.title} — {sh.start}-{sh.end}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
