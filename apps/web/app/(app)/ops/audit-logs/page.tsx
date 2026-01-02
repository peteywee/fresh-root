import { Button } from "@/components/ui/Button";
import { Filter, Download, Search, User, Shield, Database, Settings } from "lucide-react";

type LogLevel = "info" | "warn" | "error" | "debug";
type LogCategory = "auth" | "data" | "system" | "security";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  actor: string;
  action: string;
  resource: string;
  details?: string;
}

const LOGS: AuditLogEntry[] = [
  { id: "1", timestamp: "2025-01-15T14:32:01Z", level: "info", category: "auth", actor: "user@example.com", action: "LOGIN", resource: "session", details: "IP: 192.168.1.100" },
  { id: "2", timestamp: "2025-01-15T14:31:45Z", level: "warn", category: "security", actor: "system", action: "RATE_LIMIT", resource: "/api/batch", details: "Threshold exceeded" },
  { id: "3", timestamp: "2025-01-15T14:30:22Z", level: "info", category: "data", actor: "admin@company.com", action: "UPDATE", resource: "organizations/org_123" },
  { id: "4", timestamp: "2025-01-15T14:29:55Z", level: "error", category: "system", actor: "scheduler", action: "FAILED", resource: "cron/shift-reminder", details: "Timeout" },
  { id: "5", timestamp: "2025-01-15T14:28:10Z", level: "info", category: "auth", actor: "newuser@test.com", action: "SIGNUP", resource: "users/usr_456" },
  { id: "6", timestamp: "2025-01-15T14:27:33Z", level: "debug", category: "data", actor: "api", action: "QUERY", resource: "schedules", details: "45 results" },
];

function LevelBadge({ level }: { level: LogLevel }) {
  const styles = {
    info: "bg-schedule-blue/10 text-schedule-blue border-schedule-blue/20",
    warn: "bg-schedule-amber/10 text-schedule-amber border-schedule-amber/20",
    error: "bg-schedule-rose/10 text-schedule-rose border-schedule-rose/20",
    debug: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${styles[level]}`}>
      {level}
    </span>
  );
}

function CategoryIcon({ category }: { category: LogCategory }) {
  const icons = { auth: User, data: Database, system: Settings, security: Shield };
  const Icon = icons[category];
  return <Icon className="w-4 h-4 text-muted-foreground" />;
}

export default function LogsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">System activity and security audit trail.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-border text-muted-foreground">
            <Filter className="w-4 h-4 mr-2" />Filters
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-border text-muted-foreground">
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search logs by actor, action, or resource..."
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground font-mono uppercase text-xs">
            <tr>
              <th className="p-4 font-medium w-40">Timestamp</th>
              <th className="p-4 font-medium w-20">Level</th>
              <th className="p-4 font-medium w-10"></th>
              <th className="p-4 font-medium">Actor</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Resource</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono text-xs">
            {LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                <td className="p-4 text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-4"><LevelBadge level={log.level} /></td>
                <td className="p-4"><CategoryIcon category={log.category} /></td>
                <td className="p-4 text-foreground">{log.actor}</td>
                <td className="p-4"><span className="text-primary font-semibold">{log.action}</span></td>
                <td className="p-4 text-muted-foreground">
                  <div>{log.resource}</div>
                  {log.details && (
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {log.details}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing 1-6 of 1,284 entries</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
