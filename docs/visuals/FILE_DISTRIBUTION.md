---
title: "File Distribution Analysis"
description: "Visual analysis of file types and distribution in the repository"
keywords:
  - file-distribution
  - visual
  - analysis
  - repository
  - metrics
category: "report"
status: "active"
audience:
  - developers
  - architects
related-docs:
  - REPO_STATE.md
  - ../architecture/DEPENDENCY_GRAPH.md
---

# File Distribution

```mermaid
pie title File Types in Repository
    "TypeScript/TSX (76664)" : 76664
    "Tests (1152)" : 1152
    "Documentation (124)" : 124
    "Config & Other" : 50
```

## Codebase Metrics

- **TypeScript Files**: 76664
- **Test Files**: 1152
- **Documentation**: 124 files
- **Test Coverage**: Target 80%+

## File Organization

```
apps/
  web/
    app/              # Next.js App Router
    src/lib/          # Client utilities
    src/components/   # React components

packages/
  api-framework/     # SDK Factory pattern
  types/             # Zod schemas
  ui/                # Component library
  config/            # Shared configs

functions/           # Cloud Functions
tests/               # Integration & E2E tests
docs/                # Documentation
```
