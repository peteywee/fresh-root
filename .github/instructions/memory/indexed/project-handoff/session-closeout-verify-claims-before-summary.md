---
description: "Closeout workflow for long sessions: verify implementations and avoid false claims"
applyTo: ["docs/**", ".github/**"]
tags: ["workflow", "documentation", "handoff", "verification"]
type: "workflow"
domain: "project-handoff"
priority: 2
created: "2025-12-28"
updated: "2025-12-28"
classification: "NON-TRIVIAL"
relatedDomains: ["ci-cd", "performance"]
relatedLessons: []
keywords: ["session summary", "PR description", "verification", "handoff notes", "issue closure"]
---

# Session closeout: verify before you summarize

_When a session touches many issues/files, summaries must be backed by real code/docs._

## Problem

In long implementation sessions (many issues, many files), it’s easy to accidentally over-claim progress (“done” when it’s not) or misstate what was shipped.

## Solution

Before posting a final PR/session summary:

- Verify each claimed issue completion against real files (code + docs)
- Capture exact locations for key implementations (paths and what they contain)
- Record what remains, with a clear next priority and why
- Keep scope notes for the next developer/session (handoff)

A good closeout includes:

- ✅ What was verified complete (issue list)
- ✅ What was changed (high-level; avoid noisy file lists unless needed)
- 🔄 Next priority with estimated effort and risks
- 🧭 Guardrails: what must not be broken (e.g., existing CI gates)

## Why

Accurate closeout reduces churn and rework, makes review easier, and prevents broken assumptions from propagating to future work.

## Example

A strong end-of-session summary format:

- “Verified Issue #208 is complete; performance module exported and documented.”
- “Current status: 11/24 issues complete (46%).”
- “Next priority: Issue #215 CI/CD enhancements (~20h); requires deployment workflows, blue-green strategy, rollback automation, release automation, notifications.”
- “Existing CI is production-ready; enhancements must be incremental to avoid breaking it.”
