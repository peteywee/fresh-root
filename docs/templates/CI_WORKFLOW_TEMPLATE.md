---

title: "CI Workflow Template"
description: "Template for GitHub Actions CI/CD workflows with security best practices"
keywords:
- template
- ci-cd
- github-actions
- workflow
- automation
category: "template"
status: "active"
audience:
- developers
- devops
related-docs:
- ../guides/DEPLOYMENT.md
- ../production/README.md

createdAt: "2026-01-31T12:00:00Z"
lastUpdated: "2026-01-31T12:00:00Z"

---

# Template: CI_WORKFLOW_TEMPLATE

```yaml
name: ci-minimal-secure

on:
  pull_request:
    branches: [main, develop]

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Nesting audit
        run: node scripts/audit/nesting-audit.mjs
      - name: Lint (ignore legacy)
        run: pnpm -w run lint
      - name: Typecheck
        run: pnpm -w run typecheck
```
