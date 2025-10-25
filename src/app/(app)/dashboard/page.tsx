
"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  CalendarCheck,
  BarChart,
  ClipboardList,
  Plus,
} from "lucide-react";
import type { Role } from "@/lib/types";

// Since the layout passes the role, we can accept it as a prop.
// The default is provided for when the page is accessed directly without the layout context.
export default function DashboardPage({ role = "manager" }: { role?: Role }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Welcome, {role.charAt(0).toUpperCase() + role.slice(1)}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s a quick overview of your day.
          </p>
        </div>
        {role !== "staff" && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Shift
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Shared Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Shifts
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 / 5</div>
            <p className="text-xs text-muted-foreground">
              Shifts completed today
            </p>
          </CardContent>
        </Card>

        {/* Manager & Admin Cards */}
        {(role === "manager" || role === "admin") && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team Members on Duty
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Tasks
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  3 urgent tasks pending
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Staff Card */}
        {role === "staff" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Next Shift
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Tomorrow at 9:00 AM</div>
              <p className="text-xs text-muted-foreground">Front Desk Duty</p>
            </CardContent>
          </Card>
        )}

        {/* Admin Only Card */}
        {role === "admin" && (
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Labor Cost Forecast
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">
                Projected for this month
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              A log of recent changes and updates in your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    New team member invited
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Alex Doe was invited by Admin. (2 hours ago)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="rounded-full bg-accent p-2">
                  <CalendarCheck className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Schedule Published</p>
                  <p className="text-xs text-muted-foreground">
                    Next week&apos;s schedule is now live. (1 day ago)
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Your most frequent tasks, just a click away.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline">View Full Schedule</Button>
            {role !== "staff" && (
              <Button variant="outline">Manage Team</Button>
            )}
            <Button variant="outline">Check Notifications</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
