# Monorepo Standards & Reproducibility

Version: 12.0.x
Motto: 5 < Live

## 1) Structure

.
├─ apps/
│ └─ web/ # Next.js (App Router)
├─ functions/ # Optional Firebase Functions
├─ packages/
│ ├─ types/ # Shared Zod schemas & TS types
│ ├─ config/ # ESLint/TS/Prettier shared configs
│ └─ mcp-server/ # Local MCP server for AI tool calls
├─ tools/
│ └─ sim/ # Monte Carlo (outputs gitignored)
├─ docs/ # Bible, AI prompts, agents, runbooks
├─ .github/ # workflows, templates
├─ turbo.json # Turborepo pipeline
├─ pnpm-workspace.yaml # pnpm workspaces
├─ firestore.rules
├─ storage.rules
├─ package.json # workspace root scripts
└─ .gitignore

## 2) Workspaces

- apps/web, functions, packages/_, tools/_ are pnpm workspaces.
- Node 20; pnpm strict; lockfile committed.

## 3) Repro

```bash
pnpm install
pnpm -r build
pnpm dev:web
# optional: firebase emulators:start

4) CI Policy


Stages: install → lint → typecheck → unit → rules → jest e2e → build.


Fail on unmet/peer deps or outdated lockfile.


Auto-update workflow opens PR with dependency bumps.
```
