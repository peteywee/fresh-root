import { ScheduleCalendar } from "@/components/schedule-calendar";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Schedule</h1>
          <p className="text-muted-foreground">
            View and manage your team&apos;s shifts for the month.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        </div>
      </div>
      <div className="flex-1 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
        <ScheduleCalendar />
      </div>
    </div>
  );
}
