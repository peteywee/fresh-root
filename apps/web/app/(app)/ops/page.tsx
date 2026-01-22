import { StatCard } from "./_components/StatCard";
import { Button } from "@/components/ui/Button";
import { Activity, Users, Server, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OpsOverviewPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Real-time operational status and key metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-dashed border-border text-muted-foreground"
          >
            Customize Layout
          </Button>
          <Button
            size="sm"
            className="h-9 bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Schedules"
          value="1,284"
          trend="up"
          trendValue="+12.5%"
          description="vs. last week"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value="45.2k"
          trend="up"
          trendValue="+4.3%"
          description="Total registered staff"
          icon={Users}
          color="green"
        />
        <StatCard
          title="System Load"
          value="34%"
          trend="neutral"
          trendValue="Stable"
          description="Server capacity usage"
          icon={Server}
          color="amber"
        />
        <StatCard
          title="Critical Alerts"
          value="3"
          trend="down"
          trendValue="-2"
          description="Requires immediate attention"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold">Weekly Throughput</h2>
          </div>
          <div className="h-[400px] bg-card border border-border rounded-sm p-4 relative overflow-hidden group">
            <div className="absolute inset-0 flex items-end justify-between px-8 pb-8 pt-16 gap-2">
              {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
                <div key={i} className="w-full relative group-hover:opacity-90 transition-opacity">
                  <div
                    style={{ height: `${h}%` }}
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-500",
                      i % 2 === 0 ? "bg-schedule-blue" : "bg-schedule-purple",
                    )}
                  />
                  <div className="mt-2 text-center text-xs text-muted-foreground font-mono">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold">Recent Deployments</h2>
          </div>
          <div className="bg-card border border-border rounded-sm">
            <div className="p-4 space-y-4">
              {[
                {
                  id: "b-1245",
                  name: "Hotfix: Shift Validation",
                  status: "success",
                  time: "2h ago",
                },
                { id: "b-1244", name: "Feature: Auto-Assign", status: "success", time: "5h ago" },
                { id: "b-1243", name: "Update: Dependencies", status: "warning", time: "1d ago" },
                { id: "b-1242", name: "Rollback: UI v2", status: "error", time: "2d ago" },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-sm transition-colors border border-transparent hover:border-border/30"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 mt-2 rounded-full",
                        item.status === "success"
                          ? "bg-schedule-green"
                          : item.status === "warning"
                            ? "bg-schedule-amber"
                            : "bg-schedule-rose",
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-primary"
              >
                View All Deployments →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
