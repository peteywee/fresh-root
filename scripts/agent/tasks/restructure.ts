import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Result = { created: string[]; ensured: string[] };

export async function ensureMonorepo({ root, planOnly }: { root: string; planOnly: boolean; }) {
  const dirs = ["apps/web", "services/api", "packages/types", "tests/rules"];
  const created: string[] = [];
  const ensured: string[] = [];
  for (const d of dirs) {
    const p = join(root, d);
    if (!existsSync(p)) {
      if (!planOnly) mkdirSync(p, { recursive: true });
      created.push(d);
    } else {
      ensured.push(d);
    }
  }

  // Minimal workspace file if missing
  const ws = join(root, "pnpm-workspace.yaml");
  if (!existsSync(ws)) {
    const content = `packages:\n  - "apps/*"\n  - "services/*"\n  - "packages/*"\n`;
    if (!planOnly) writeFileSync(ws, content, "utf8");
    created.push("pnpm-workspace.yaml");
  } else {
    ensured.push("pnpm-workspace.yaml");
  }

  return { created, ensured };
}
export function plannedChangesSummary(r: Result) {
  return [
    "Planned changes:",
    `- Created: ${r.created.length ? r.created.join(", ") : "(none)"}`,
    `- Ensured: ${r.ensured.length ? r.ensured.join(", ") : "(none)"}`
  ].join("\n");
}
