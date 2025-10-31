# Workspace Rules and Quality Gates

This repository enforces strict dependency hygiene and editor consistency to keep CI green and onboarding smooth. These rules are non-negotiable for all PRs and automated agents.

## Dependency hygiene

- No deprecated dependencies allowed
  - Definition: Any package listed as deprecated by its maintainer (pnpm prints a "deprecated" warning during install or list).
  - Enforcement: Treat any "deprecated" warning from pnpm as a failure. Replace or remove the package before merging.

- No unmet peer dependencies allowed
  - Definition: pnpm reports "Issues with peer dependencies found" or similar; this indicates incompatible or missing peer ranges.
  - Enforcement: Fix by aligning versions or adding the required peer deps. Do not suppress with overrides unless accompanied by a rationale in the PR.

- Lockfile integrity
  - `packageManager` is pinned in the root `package.json`; use the exact pnpm version.
  - Installs must not mutate `pnpm-lock.yaml` unexpectedly. If it changes, explain why in the PR.

### How to check locally

- Install (should be clean — no deprecated or peer warnings):
  - Run VS Code task: "Deps: Check (no deprecated/peers)" or run `pnpm install` from the root.
- Audit dependency tree for deprecations:
  - `pnpm ls --depth 0` should not contain deprecation notices.
- CI will fail PRs that introduce deprecations or peer issues.

## Editor/VS Code consistency

- Use the committed `.vscode` settings. Do not add deprecated editor settings.
- Keep recommended extensions installed; avoid workspace-specific hacks if a tool can be configured project-wide.

## PR checklist additions

- [ ] No deprecated packages introduced (verified locally)
- [ ] No unmet peer dependencies (verified locally)
- [ ] Lockfile changes are intentional and explained
- [ ] CI: typecheck/tests pass locally before pushing

## Notes

- Prefer upgrading or replacing deprecated libraries with maintained alternatives.
- If a deprecation cannot be immediately removed (e.g., upstream blocked), open a tracking issue and add a code comment with the issue link at the import site; include a suppression window and plan.
