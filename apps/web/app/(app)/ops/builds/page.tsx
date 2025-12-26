export default function BuildsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Build Pipeline</h1>
        <p className="text-muted-foreground">CI/CD Status and Deployment History.</p>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground font-mono uppercase text-xs">
            <tr>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Commit</th>
              <th className="p-4 font-medium">Branch</th>
              <th className="p-4 font-medium">Time</th>
              <th className="p-4 font-medium text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {[
              { status: "success", commit: "a9f2b3", msg: "feat: update schedule colors", branch: "main", time: "10m ago", dur: "2m 14s" },
              { status: "running", commit: "88c1d2", msg: "fix: nav layout", branch: "dev", time: "15m ago", dur: "Running..." },
              { status: "failed", commit: "7b2a11", msg: "chore: db migration", branch: "feat/db", time: "1h ago", dur: "45s" },
              { status: "success", commit: "6c5d44", msg: "docs: update readme", branch: "main", time: "3h ago", dur: "1m 30s" },
            ].map((build, i) => (
              <tr key={i} className="group hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                    ${build.status === 'success' ? 'bg-schedule-green/20 text-schedule-green' : 
                      build.status === 'running' ? 'bg-schedule-blue/20 text-schedule-blue animate-pulse' :
                      'bg-schedule-rose/20 text-schedule-rose'
                    }`}>
                    {build.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-mono text-primary">{build.commit}</div>
                  <div className="text-muted-foreground text-xs">{build.msg}</div>
                </td>
                <td className="p-4 font-mono text-xs">{build.branch}</td>
                <td className="p-4 text-muted-foreground">{build.time}</td>
                <td className="p-4 text-right font-mono text-xs">{build.dur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
