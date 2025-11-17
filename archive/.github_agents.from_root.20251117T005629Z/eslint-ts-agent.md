# ESLint + TypeScript Agent

Purpose: continuously scan staged changes and open PR diffs for ESLint rule violations and TypeScript issues, annotate findings inline, and apply safe auto-fixes in parallel with normal development.

## Capabilities

- Run ESLint across monorepo workspaces using the root config and per-package configs
- Post inline PR review comments for violations (via Reviewdog)
- Attempt `--fix` for safe rules and push commits to the PR branch
- Run `pnpm -w typecheck` and summarize TS diagnostics in the workflow summary
- Use Model Context Protocol (MCP) servers for enhanced code search when proposing larger refactors

## MCP and tooling

- Primary tool: `eslint` via PNPM scripts and Reviewdog action
- Optional MCP servers available under `/mcp` and `packages/mcp-server` for deeper symbol/codebase querying. When needed, the agent should:
  - Use MCP to find repeated patterns causing violations
  - Propose consolidated fixes (e.g., shared utilities or rule exceptions with justification)

## Run modes

- On PR: annotate and (if possible) push auto-fix commits back to the same branch
- Manual: `workflow_dispatch` to run across the current HEAD when investigating broader lint debt

## Safe-guards

- Do not change public APIs or behavior without tests
- Keep `--fix` changes minimal; prefer comments for complex cases
- Never downgrade `@typescript-eslint` rule severity without explicit approval

## Success criteria

- Zero blocking ESLint errors on changed lines
- Reduced warnings over time (tracked in CI summaries)
- No TypeScript regressions
