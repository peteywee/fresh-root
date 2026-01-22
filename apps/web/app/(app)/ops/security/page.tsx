import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, Lock, Users, Key } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Security & Access</h1>
        <p className="text-muted-foreground">
          Manage RBAC policies and system-wide security settings.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="solid" className="border-l-4 border-l-schedule-green">
          <CardHeader>
            <Shield className="w-8 h-8 text-schedule-green mb-2" />
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
        </Card>
        <Card variant="solid" className="border-l-4 border-l-primary">
          <CardHeader>
            <Lock className="w-8 h-8 text-primary mb-2" />
            <CardTitle>2FA Enforcement</CardTitle>
            <CardDescription>Enabled for Admin roles</CardDescription>
          </CardHeader>
        </Card>
        <Card variant="solid" className="border-l-4 border-l-schedule-amber">
          <CardHeader>
            <Users className="w-8 h-8 text-schedule-amber mb-2" />
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>24 concurrent admin sessions</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="bg-card border border-border p-6 rounded-sm space-y-6">
        <h2 className="text-xl font-heading font-bold">Role-Based Access Control (RBAC)</h2>

        <div className="space-y-4">
          {["Super Admin", "Ops Manager", "Support Agent", "Viewer"].map((role) => (
            <div
              key={role}
              className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary flex items-center justify-center rounded-full">
                  <Key className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{role}</h3>
                  <p className="text-xs text-muted-foreground">Inherits standard permissions</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-border">
                Configure
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
