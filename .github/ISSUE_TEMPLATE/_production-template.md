## # Labels
name: "🔧 Production Work Item" about: Standardized work ticket for production readiness title:
"\[WORK-ID] Title" labels: \[] assignees: \[peteywee]

---

## Labels
- P\*:
- Area:

## Objective
Explain why this matters for production readiness.

## Scope
**In:** **Out:**

## Files / Paths
- path/to/file – description

## Commands
```bash
## deterministic steps
```

## Acceptance Criteria
- \[ ]

## Success KPIs
## Definition of Done
- \[ ] CI green
- \[ ] Docs updated
- \[ ] Tests ≥ 85 %
- \[ ] Security audit clear
- \[ ] Linked in roadmap
- \[ ] All lint/format errors auto-fixed before commit/PR (any language)

## Explanation / Rationale
Why this task exists, dependencies, and production impact.

---

### 6️⃣ Why This Ties Directly to Production Readiness
| Capability                 | Enabled By                 | Effect                               |
| -------------------------- | -------------------------- | ------------------------------------ |
| **Reproducibility**        | Commands + Files + Scope   | “Works on my machine” eliminated     |
| **Traceability**           | Labels + Paths + Rationale | Audit trail & postmortem evidence    |
| **Observability Maturity** | KPIs + DoD                 | Links code output → SLO targets      |
| **Automation**             | Labels + AC                | GitHub Actions can parse and gate    |
| **Governance**             | DoD + CI + Docs            | Enforces “All Green Before You Push” |

---

### 7️⃣ Meta Acceptance Criteria (for this framework itself)
- \[x] Every future response must include **Labels, Objective, Scope, Files/Paths, Commands,
  Acceptance Criteria, Success KPIs, Definition of Done**.
- \[x] Template stored in `.github/ISSUE_TEMPLATE/_production-template.md`.
- \[x] GitHub Actions validate presence of these sections (optional extension).

---

### ✅ Definition of Done (for this framework)
- This framework is documented and committed.
- It governs every subsequent answer.
- Missing any section = invalid response.
- The repo can generate a new ticket or deliverable from this template automatically.

---

Would you like me to now generate the **`.github/workflows/validate-template.yml`** that
automatically fails CI if any PR description or issue lacks these required headings? That turns this
philosophy into enforceable policy.

| Section                 | Why it must exist                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Labels                  | Drive automation, dashboards, CI gating, and triage visibility. Missing labels block workflow metrics. |
| Objective               | Defines “why this work matters.” Prevents scope creep and misaligned effort.                           |
| Scope                   | Prevents accidental coupling or half-baked integrations.                                               |
| Files / Paths           | Enables deterministic rebuilds and traceable file history.                                             |
| Commands                | Ensures reproducibility on any system or CI runner.                                                    |
| Acceptance Criteria     | Converts subjective “done” into binary truth.                                                          |
| Success KPIs            | Translates engineering work into measurable ops impact.                                                |
| Definition of Done      | Locks delivery gates: tests, docs, security, and CI states.                                            |
| Explanation / Rationale | Captures architectural intent for future maintainers and audits.                                       |

#### Acceptance Benchmarks (Global Defaults)
Unless overridden in a specific issue:

- CI: must pass lint, typecheck, unit, and integration suites.
- Docs: must be updated or linked in docs/.
- Coverage: ≥ 85 % for critical paths.
- Runtime health: p95 latency < 250 ms for API, < 2.5 s TTI for web.
- Security: 0 critical/high vulnerabilities on pnpm audit.
- Rollbacks: tested and documented for release work.
