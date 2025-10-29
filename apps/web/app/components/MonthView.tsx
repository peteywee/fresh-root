"use client";
import React from 'react';

export default function MonthView({ month = new Date() }: { month?: Date }) {
  // Minimal, fast-rendering month grid stub for v12 initial implementation.
  const days = Array.from({ length: 30 }).map((_, i) => ({ day: i + 1 }));
  return (
    <div className="grid grid-cols-7 gap-1 text-sm">
      {days.map((d) => (
        <div key={d.day} className="border rounded p-1 text-center">
          {d.day}
        </div>
      ))}
    </div>
  );
}
