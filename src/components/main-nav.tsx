
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Lightbulb,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "staff"],
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: Calendar,
    roles: ["admin", "manager", "staff"],
  },
  {
    href: "/team",
    label: "Team",
    icon: Users,
    roles: ["admin", "manager"],
  },
  {
    href: "/insights",
    label: "Insights",
    icon: Lightbulb,
    roles: ["admin", "manager"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export function MainNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 px-2">
      {navItems
        .filter((item) => item.roles.includes(role))
        .map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10",
                    isActive &&
                      "bg-accent text-primary font-medium",
                    "group-data-[collapsible=icon]:p-0"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="hidden group-data-[collapsible=icon]:block"
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
    </nav>
  );
}
