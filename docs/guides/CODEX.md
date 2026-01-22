---
title: "Codex Workflow Guide"
description: "How to use Codex effectively in the Fresh Schedules repo"
keywords:
  - codex
  - ai
  - tools
  - mcp
  - automation
category: "guide"
status: "active"
audience:
  - developers
  - ai-agents
---

# Codex Workflow Guide

This guide documents the repo-specific Codex setup and helper tools for Fresh Schedules.

## Quick Start

Use the repo wrapper to ensure Codex runs with the correct working directory:

```bash
scripts/codex/codex.sh
```

## Repo Helper Tools

| Tool | Purpose |
| --- | --- |
| scripts/codex/codex.sh | Launch Codex in repo root |
| scripts/codex/validate.sh | Run pattern validator + typecheck |
| scripts/codex/quality-gates.sh | Run validator + typecheck + lint + tests |

### Examples

```bash
scripts/codex/validate.sh
```

```bash
scripts/codex/quality-gates.sh
```

## MCP Tools

Repo MCP servers are configured in `.mcp.json` at the repo root. This enables always-on GitHub,
Repomix, and Firebase MCP tools and supports on-demand Chrome DevTools.

## Notes

- Codex global config lives at `~/.codex/config.toml`.
- Use the wrapper scripts to keep execution consistent across contributors.
