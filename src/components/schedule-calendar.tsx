"use client";

import { useState } from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parse,
  startOfToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { MOCK_SHIFTS } from "@/lib/data";
import type { Shift } from "@/lib/types";
import { ShiftEditor } from "./shift-editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function ScheduleCalendar() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  const shiftsByDay = MOCK_SHIFTS.reduce((acc, shift) => {
    const day = format(new Date(shift.start), "yyyy-MM-dd");
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(shift);
    return acc;
  }, {} as Record<string, Shift[]>);

  const [isEditorOpen, setEditorOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const handleAddShift = (day: Date) => {
    setSelectedShift(null);
    setSelectedDay(day);
    setEditorOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setEditorOpen(true);
  };

  const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ];

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-card border-t">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold text-lg">
            {format(firstDayCurrentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-7 text-xs leading-6 text-center text-muted-foreground border-b">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="grid grid-cols-7 flex-1">
          {days.map((day, dayIdx) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayShifts = shiftsByDay[dayKey] || [];

            return (
              <div
                key={day.toString()}
                className={cn(
                  dayIdx === 0 && colStartClasses[day.getDay()],
                  "border-b border-r p-1.5 flex flex-col gap-1 group"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-center">
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "text-xs font-medium",
                      isSameDay(day, today) && "text-primary font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleAddShift(day)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto">
                  {dayShifts.map((shift) => (
                    <Tooltip key={shift.id}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleEditShift(shift)}
                          className="text-xs p-1 rounded-md cursor-pointer hover:bg-accent"
                          style={{
                            backgroundColor: shift.color + "20",
                            borderLeft: `2px solid ${shift.color}`,
                          }}
                        >
                          <p
                            className="font-medium truncate"
                            style={{ color: shift.color }}
                          >
                            {shift.title}
                          </p>
                          <p
                            className="text-muted-foreground truncate"
                            style={{ color: shift.color + "B3" }}
                          >
                            {format(new Date(shift.start), "h:mm a")} -{" "}
                            {format(new Date(shift.end), "h:mm a")}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{shift.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {shift.assignee}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ShiftEditor
        isOpen={isEditorOpen}
        setOpen={setEditorOpen}
        shift={selectedShift}
        day={selectedDay}
      />
    </TooltipProvider>
  );
}
