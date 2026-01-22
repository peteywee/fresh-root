import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into system performance and usage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" className="border-border text-muted-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card variant="solid" className="bg-card">
        <CardHeader>
          <CardTitle>Usage Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1 h-64">
            {Array.from({ length: 12 * 7 }).map((_, i) => {
              const opacity = Math.random();
              const intensity =
                opacity > 0.8
                  ? "bg-schedule-rose"
                  : opacity > 0.6
                    ? "bg-schedule-amber"
                    : opacity > 0.3
                      ? "bg-schedule-blue"
                      : "bg-muted";
              return (
                <div
                  key={i}
                  className={`rounded-[2px] transition-all hover:scale-110 ${intensity}`}
                  style={{ opacity: opacity < 0.3 ? 0.2 : 1 }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-muted-foreground font-mono">
            <span>Low Activity</span>
            <div className="flex gap-1 items-center">
              <div className="w-3 h-3 bg-muted rounded-[1px]"></div>
              <div className="w-3 h-3 bg-schedule-blue rounded-[1px]"></div>
              <div className="w-3 h-3 bg-schedule-amber rounded-[1px]"></div>
              <div className="w-3 h-3 bg-schedule-rose rounded-[1px]"></div>
            </div>
            <span>High Load</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card variant="outline" className="bg-background/50">
          <CardHeader>
            <CardTitle>Top Organizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center font-bold text-xs">
                    #{i}
                  </div>
                  <span className="text-sm font-medium">Acme Kitchens Inc.</span>
                </div>
                <span className="text-sm font-mono text-schedule-green">98.5% Active</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card variant="outline" className="bg-background/50">
          <CardHeader>
            <CardTitle>Error Rates by Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Auth Service</span>
                <span className="text-schedule-green">0.01%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-schedule-green w-[1%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Scheduler Engine</span>
                <span className="text-schedule-amber">2.4%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-schedule-amber w-[12%]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Notification Relay</span>
                <span className="text-schedule-rose">5.1%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-schedule-rose w-[25%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
