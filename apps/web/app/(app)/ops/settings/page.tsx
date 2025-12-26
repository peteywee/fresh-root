import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bell, Database, Globe, Shield, Save } from "lucide-react";

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <button className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "left-6" : "left-1"}`} />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure Ops Center preferences and integrations.</p>
        </div>
        <Button className="bg-primary text-primary-foreground font-semibold">
          <Save className="w-4 h-4 mr-2" />Save Changes
        </Button>
      </div>

      <Card variant="solid">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Critical Alerts", desc: "Immediate notifications for system failures", on: true },
            { label: "Build Failures", desc: "Notify when CI/CD pipelines fail", on: true },
            { label: "Security Events", desc: "Alert on suspicious activity", on: true },
            { label: "Weekly Digest", desc: "Summary of ops metrics every Monday", on: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-sm">
              <div>
                <h3 className="font-medium text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Toggle enabled={item.on} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card variant="solid">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>Configure how long data is stored</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Build Metrics", value: "90 days" },
              { label: "Audit Logs", value: "1 year" },
              { label: "Security Scans", value: "90 days" },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-background border border-border/50 rounded-sm">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</label>
                <div className="mt-2 text-foreground font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="solid">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connected services and webhooks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "GitHub Actions", abbr: "GH", connected: true },
            { name: "Slack Notifications", abbr: "SL", connected: false },
            { name: "PagerDuty", abbr: "PD", connected: false },
          ].map((svc) => (
            <div key={svc.name} className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-xs font-bold">{svc.abbr}</div>
                <div>
                  <h3 className="font-medium text-foreground">{svc.name}</h3>
                  <p className={`text-xs ${svc.connected ? "text-schedule-green" : "text-muted-foreground"}`}>
                    {svc.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">{svc.connected ? "Configure" : "Connect"}</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card variant="outline" className="border-schedule-rose/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-schedule-rose" />
            <div>
              <CardTitle className="text-schedule-rose">Danger Zone</CardTitle>
              <CardDescription>Irreversible operations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-schedule-rose/5 border border-schedule-rose/20 rounded-sm">
            <div>
              <h3 className="font-medium text-foreground">Purge All Build Data</h3>
              <p className="text-xs text-muted-foreground">Permanently delete all historical build metrics</p>
            </div>
            <Button variant="outline" size="sm" className="border-schedule-rose/50 text-schedule-rose hover:bg-schedule-rose/10">
              Purge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
