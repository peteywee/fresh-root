// [P2][UI][CODE] MonthView
// Tags: P2, UI, CODE
"use client";
import React, { useMemo } from "react";

/**
 * A memoized component that displays a calendar view of a given month.
 *
 * @param {object} props - The props for the component.
 * @param {Date} [props.month=new Date()] - The month to be displayed.
 * @returns {JSX.Element} The rendered month view component.
 */
const MonthView = React.memo(({ month = new Date() }: { month?: Date }) => {
  // Optimized month grid with memoization for performance
  const days = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const daysArray = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }
    return daysArray;
  }, [month]);

  return (
    <div className="card p-4">
      <h3 className="mb-4 text-lg font-semibold text-primary">
        {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </h3>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-center font-medium text-text-muted">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex aspect-square items-center justify-center rounded-lg transition-all duration-200 ${
              day
                ? "cursor-pointer border border-surface-accent bg-surface-accent hover:bg-primary/10 hover:text-primary"
                : ""
            }`}
          >
            {day && <span className="font-medium">{day}</span>}
          </div>
        ))}
      </div>
    </div>
  );
});

MonthView.displayName = "MonthView";

export default MonthView;
