# Process — Change Control, DoD, Reviews

Version: 12.0.x
Motto: 5 < Live

## 1) Change Control

1. Proposal: explicit redline/new text.
1. Impact Analysis: list affected sections/files.
1. Approval: commit docs; bump version.
1. Implementation: code strictly per updated spec.

### 1.1 Reviewer Empowerment (Bible Amend/Append)

A Code Reviewer **may** add a section to the Bible only if:

- Provides an **exhaustive, definitive argument** linked to GOALS/OKRs & SCOPE.
- Includes acceptance criteria, risks, and mitigations.
- Links to PR where implementation will occur.

  Upon approval, the reviewer **amends/appends** the Bible in the same PR.

## 2) Definition of Done (DoD)

- DoD1: Auth flows loop-free (Google/email link); `/auth/callback` exempt.
- DoD2: Onboarding → profile + org membership (Manager/Member).
- DoD3: Planning inputs confirmed or skipped fast-path; MonthView adherence visible.
- DoD4: Publish flips state + creates message; receipts permitted by rules.
- DoD5: Firestore/Storage rules pass allow/deny tests; zero cross-org leakage.
- DoD6: CI all green; **no unmet/peer dependency warnings**.
- DoD7: E2E (login→publish→logout) **p95 ≤ 5:00** (Jest + Playwright).
- DoD8: Error bus wired; Sentry (if DSN) captures critical flows.
- DoD9: AI docs/prompt packs updated for behavior changes.

## 3) Reviews

- Code review: must cite Bible sections.
- Rule review: add allow/deny tests for all impacted paths.
- Prompt review: regression check via `docs/ai` packs.
