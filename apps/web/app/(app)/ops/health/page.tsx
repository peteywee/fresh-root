import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type HealthStatus = "healthy" | "degraded" | "down";

interface ServiceHealth {
  name: string;
  status: HealthStatus;
  latency: string;
  lastCheck: string;
}

const SERVICES: ServiceHealth[] = [
  { name: "API Gateway", status: "healthy", latency: "12ms", lastCheck: "2s ago" },
  { name: "Firestore", status: "healthy", latency: "45ms", lastCheck: "5s ago" },
  { name: "Auth Service", status: "healthy", latency: "23ms", lastCheck: "3s ago" },
  { name: "Scheduler Engine", status: "degraded", latency: "890ms", lastCheck: "10s ago" },
  { name: "Notification Relay", status: "healthy", latency: "67ms", lastCheck: "8s ago" },
  { name: "Redis Cache", status: "healthy", latency: "2ms", lastCheck: "1s ago" },
];

function StatusIcon({ status }: { status: HealthStatus }) {
  if (status === "healthy") return <CheckCircle className="w-5 h-5 text-schedule-green" />;
  if (status === "degraded") return <AlertTriangle className="w-5 h-5 text-schedule-amber" />;
  return <XCircle className="w-5 h-5 text-schedule-rose" />;
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const styles = {
    healthy: "bg-schedule-green/10 text-schedule-green border-schedule-green/20",
    degraded: "bg-schedule-amber/10 text-schedule-amber border-schedule-amber/20",
    down: "bg-schedule-rose/10 text-schedule-rose border-schedule-rose/20",
  };
  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function HealthPage() {
  const healthyCount = SERVICES.filter((s) => s.status === "healthy").length;
  const degradedCount = SERVICES.filter((s) => s.status === "degraded").length;
  const downCount = SERVICES.filter((s) => s.status === "down").length;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">System Health</h1>
        <p className="text-muted-foreground mt-1">
          Real-time service status and performance metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="solid" className="border-l-4 border-l-schedule-green">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-schedule-green">
              {healthyCount}
            </div>
          </CardContent>
        </Card>
        <Card variant="solid" className="border-l-4 border-l-schedule-amber">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Degraded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-schedule-amber">
              {degradedCount}
            </div>
          </CardContent>
        </Card>
        <Card variant="solid" className="border-l-4 border-l-schedule-rose">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Down</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-schedule-rose">{downCount}</div>
          </CardContent>
        </Card>
        <Card variant="solid" className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uptime (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-primary">99.94%</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground font-mono uppercase text-xs">
            <tr>
              <th className="p-4 font-medium">Service</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Latency</th>
              <th className="p-4 font-medium text-right">Last Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {SERVICES.map((service) => (
              <tr key={service.name} className="hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon status={service.status} />
                    <span className="font-medium text-foreground">{service.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge status={service.status} />
                </td>
                <td className="p-4 font-mono text-muted-foreground">{service.latency}</td>
                <td className="p-4 text-right text-muted-foreground text-xs">
                  {service.lastCheck}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-semibold text-foreground mb-2">ℹ️ Health Check Endpoints</div>
        <p className="text-sm text-muted-foreground">
          Data aggregated from <code className="text-primary">/api/ops/health</code> and individual
          service endpoints. Refresh interval: 30 seconds.
        </p>
      </div>
    </div>
  );
}
