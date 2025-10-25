import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
      aria-label="Back to homepage"
    >
      <CalendarCheck className="h-6 w-6" />
      <span className="text-lg font-semibold tracking-tight">
        ScheduleQuick
      </span>
    </Link>
  );
}
