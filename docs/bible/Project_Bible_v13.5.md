# 🧭 Fresh Schedules v13.5 — Production Release Bible (Expanded Edition)

---

**Version:** 13.5
**Status:** Executable Production Specification
**Last Updated:** November 2025
**Authoritative Source:** docs/bible/Project_Bible_v13.5.md
**Change Process:** Proposal → Impact Analysis → Explicit Update → Implementation
**Motto:** "<5 to live"

---

## 0️⃣ Introduction & Mission Alignment

### Purpose

This Bible is the authoritative reference for the _Fresh Schedules_ platform—an AI-assisted,
Firebase-backed, multi-tenant staff-scheduling PWA enabling a manager to produce a
publish-ready schedule in ≤ 5 minutes.

### Core Goals

- **Speed:** Sub-5-minute scheduling workflow.
- **Integrity:** Single source of truth across Auth → Org → Scheduling.
- **Security:** Zero orphan users; strict rules enforcement.
- **Reliability:** All green CI/CD pipeline; automated rollback support.
- **Scalability:** Multi-org, multi-venue, enterprise-ready.

### Architecture Summary

- **Frontend:** Next.js (App Router) + Tailwind CSS + PWA manifest.
- **Backend:** Firebase (Auth, Firestore, Functions, Storage).
- **Infra:** Node 20 + pnpm workspaces + Cloud Run + systemd services.
- **Monitoring:** Sentry + OpenTelemetry + Lighthouse automation.

---

## 1️⃣ Core Scopes Overview

|  #  | Scope                   | Description                                   | Primary Owner                 |
| :-: | :---------------------- | :-------------------------------------------- | :---------------------------- |
|  1  | **Auth & Identity**     | User auth, role derivation, claims, MFA.      | Firebase Auth / Middleware    |
|  2  | **Org & Membership**    | Org creation, venues, positions, memberships. | Firestore Rules / Zod Schemas |
|  3  | **Scheduling Core**     | Events, shifts, zones, attendance.            | Scheduler Service             |
|  4  | **Finance & Analytics** | Budget calc, forecasting, labor reports.      | Ledger / Analytics Module     |
|  5  | **Experience Layer**    | UI flows, onboarding, dashboards.             | Next.js App Router            |

Each feature explicitly declares a **primary scope** (its logic owner) and optional **secondary scopes** (dependent interfaces).
This prevents hidden coupling and clarifies governance.

---

## 2️⃣ Auth & Identity Scope (Primary Foundation)

### 2.1 Purpose

Controls the entire user lifecycle from registration through role assignment.
Every other scope consumes its outputs (`uid`, `role`, `claims`, `onboarded`).

### 2.2 Key Entities

- `users/{uid}` — canonical identity record.
- `memberships/{uid_orgId}` — role link to org.
- `joinTokens/{orgId}` — controlled entry points.

### 2.3 Security Policy

- Enforce MFA for managers and corporate roles.
- Require email verified before write access.
- Deny all writes without matching `request.auth.uid`.

### 2.4 Role Derivation Matrix

| Role        | Description                   | Authority             |
| ----------- | ----------------------------- | --------------------- |
| `manager`   | Org creator / scheduler owner | Full read/write       |
| `staff`     | Hourly employee               | Read-own data only    |
| `corporate` | HQ / admin analyst            | Read-only cross-venue |

### 2.5 Argument

Keeping role derivation entirely within this scope ensures zero drift between API, Firestore, and UI.
Roles become declarative, not implicit.

---

## 3️⃣ Org & Membership Scope

### 3.1 Entities

- **orgs/{orgId}** – name, industry, timezone, budget params.
- **venues/{venueId}** – physical location group.
- **positions/{posId}** – role templates + wage bands.
- **memberships/{uid_orgId}** – user/org link + role metadata.

### 3.2 Access Model

````js
allow read: if hasRole(uid, ['manager','corporate']);
allow write: if hasRole(uid, ['manager']);
3.3 Argument
A consistent membership contract guarantees referential integrity for scheduling, budgets, and analytics.

4️⃣ Scheduling Core Scope
4.1 Purpose
Automates shift planning, publication, and attendance.
Anchored in Firestore collections schedules, shifts, events.

4.2 Critical Calculations
ruby
Copy code
allowed$ = forecastSales * (laborPct / 100)
allowedHours = allowed$ / avgWage
4.3 Performance Benchmarks
Render MonthView < 200 ms.

Maintain ≥ 55 FPS with 1 k rows.

4.4 Argument
This scope operationalizes the product's promise: "publish a schedule in five minutes."
Every KPI feeds back into Finance for budget control.

5️⃣ Finance & Analytics Scope
5.1 Purpose
Transforms raw scheduling data into actionable budget intelligence.

5.2 Features
Forecast adjustment (+/- weekly trend).

Labor % and wage optimization.

Automated alerts for budget overruns.

5.3 Read/Write Policy
Managers and Corporate roles → read; only Managers → write.

5.4 Argument
Separating read and write by role enforces financial integrity while maintaining visibility for HQ.

6️⃣ Experience Layer Scope
6.1 Purpose
Delivers all front-end UX flows: authentication, onboarding, dashboards, and AI assistants.

6.2 Design System
Tailwind tokens for color roles.

Responsive breakpoints mobile → desktop.

Accessible components (ARIA, keyboard nav).

6.3 Routing Guards
ts
Copy code
if (!user) redirect('/signin');
else if (!user.onboarded) redirect('/onboarding');
else next();
6.4 Argument
Centralized guards remove redundant checks and enforce consistent user state handling.

7️⃣ Integrity Core (Block 3)
7.1 Purpose
Validate data flows through Zod schemas and unit tests.

7.2 Tasks
Expand packages/types with org, membership, schedule schemas.

Add API-level Zod validation for writes.

Implement rules test matrix (≥ 1 allow + 3 deny per collection).

Enforce pnpm typecheck && pnpm lint pre-commit.

7.3 Argument
Data validation is the bedrock of "Integrity Core." It prevents production drift and enables trustworthy AI-generated tasks.

8️⃣ Onboarding Wizard (Block 4, §7.1)
(see linked Appendix G for flow charts)

8.1 Objective
Capture all information necessary to fully materialize a user, organization, and membership record in ≤ 3 minutes.

8.2 Dual Paths
Manager (Corporate Creation)

Staff (Join Existing Org)

8.3 Corporate Staff Subpath
Third option for HQ roles; extends Profile Step with department and venuesAccess.

8.4 Data Contracts (Zod)
ts
Copy code
ProfileSchema, OrgSchema, MembershipSchema
8.5 Routing & Redirects
Action: Generate README or project onboarding materials (see below for action prompt) → progressive steps; post-completion flag onboarded = true.

8.6 KPIs
Metric  Target
Completion time  ≤ 3 min
Validation accuracy  ≥ 98 %
Redirect correctness  100 %

8.7 Argument
Without this wizard, users exist unauthorized and data-incomplete.
It is the bridge between authentication and operational participation.

9️⃣ Corporate Staff Path (§C.3)
(Linked from Scopes Appendix C)

Summary
Introduces role:"corporate" for HQ staff needing read-only visibility.
Primary scope: Auth & Identity.
Secondary scopes: Org & Membership, Finance & Analytics, Experience Layer.

Routing

manager → /overview

staff → /my-shifts

corporate → /analytics

KPIs

Metric  Target
Role-selection success  ≥ 98 %
Completion time  ≤ 2 min
Data consistency  100 %

Argument
Fills the organizational gap for administrative users; achieves enterprise scalability without complicating RBAC.

🔟 Reliability Core (Block 2)
Structured JSON logging (Sentry + OTel).

Automated backups & uptime alerts.

Blue/Green deploy pipeline with rollback.

CI gate fails deploy on E2E failure.

Argument: Reliability Core ensures recoverability under load and creates auditable trails for compliance.

1️⃣1️⃣ Security Core (Block 1)
Session-cookie auth flow + MFA.

Middleware guards for API routes.

Secrets managed via .env template.

Argument: Security Core is the P0 foundation; no component builds above until its checks are green.

1️⃣2️⃣ Validation & Release (Block 5)
Playwright E2E tests (auth → onboard → org → plan → publish).

CI gate → fail deploy if E2E fails.

Blue/Green promote workflow.

Release dashboard (build #, branch, E2E status).

Argument: Validation Core proves that everything above is truly production-ready.

🔚 Success Benchmarks (KPIs)
Dimension  Target
TTI (prod)  < 1.8 s
Lighthouse Score  ≥ 90 overall / ≥ 95 a11y
MonthView Render  < 200 ms
Avg Onboarding Time  ≤ 3 min
Schedule Creation Time  ≤ 5 min KPI

🧩 Linked Appendices
Appendix A – Environment Variables

Appendix B – Firestore Rules

Appendix C – Scopes Matrix (C.3 Corporate Staff Path)

Appendix D – RBAC Table

Appendix E – Performance KPIs

Appendix G – Onboarding Flow Charts

✅ Definition of Done for v13.5
All Blocks (1 → 5) implemented and passing checks.

Corporate Staff Path registered in Auth & Identity scope.

Onboarding Wizard (Manager/Staff/Corporate) live and redirecting correctly.

CI/CD pipeline validated with E2E and Lighthouse reports.

Bible committed to docs/bible/Project_Bible_v13.5.md and tagged in repo.

End of Project Bible v13.5

yaml
Copy code

---

✅ **Deliverable:** Paste the above into
`docs/bible/Project_Bible_v13.5.md`
and push on your `develop` branch.

✅ **Linked Appendices:** maintain them as modular Markdown files under `docs/bible/appendices/`.

Once committed, tag the release:

```bash

git add docs/bible/Project_Bible_v13.5.md
git commit -m "docs(bible): add Fresh Schedules Project Bible v13.5 (Expanded Edition)"
git push origin develop
git tag -a v13.5 -m "Fresh Schedules Bible v13.5 Production Release"
git push origin v13.5
Appendix A — Environment Variable Matrix

Path: docs/bible/appendices/Appendix_A_EnvMatrix.md

## Appendix A — Environment Variable Matrix (v13.5)

This table defines all required and optional environment variables for both development and production.
Each variable is validated at build-time; missing `required: true` vars cause a hard failure.

| Variable | Scope | Required | Description |
|-----------|--------|-----------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | ✅ | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | ✅ | Firebase Authentication domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | ✅ | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | ✅ | Firebase Storage bucket name |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | ✅ | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Client | ❌ | Analytics tracking ID |
| `NEXT_PUBLIC_USE_EMULATORS` | Client | ⚙️ Dev | Toggles local emulator suite |
| `FIREBASE_ADMIN_PROJECT_ID` | Server | ✅ | Used by Admin SDK to verify service credentials |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server | ✅ | Base64-encoded private key |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server | ✅ | Client email from service account |
| `NEXT_PUBLIC_SENTRY_DSN` | Client | ❌ | Sentry DSN for frontend error tracking |
| `SENTRY_AUTH_TOKEN` | Server | ❌ | Used by GitHub Actions for release annotation |
| `OPENAI_API_KEY` | Server | ❌ | Optional; used for AI fallback functions |
| `GEMINI_API_KEY` | Server | ⚙️ Dev | Used by local test harness for AI task breakdown |
| `NODE_ENV` | Both | ✅ | Defines runtime environment (`development` / `production`) |

## Enforcement

- All vars checked via `zodEnvSchema` at runtime.
- Production builds reject missing required variables.
- Dev builds auto-inject emulator toggles when `.env.local` present.

## Argument

A deterministic environment ensures reproducibility across Firebase Studio, local Docker, and CI runners.

📁 Appendix B — Firestore Rules

Path: docs/bible/appendices/Appendix_B_Rules.md

## Appendix B — Firestore Rules (v13.5)

Rules enforce zero orphan users, minimal privilege, and safe read/write segregation.

```js

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- Utility Function ---
    function hasRole(uid, roles) {
      return get(/databases/$(database)/documents/users/$(uid)).data.role in roles;
    }

    // --- User Profiles ---
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // --- Organizations ---
    match /orgs/{orgId} {
      allow read: if hasRole(request.auth.uid, ['manager','corporate']);
      allow write: if hasRole(request.auth.uid, ['manager']);
    }

    // --- Memberships ---
    match /memberships/{uid_orgId} {
      allow read: if hasRole(request.auth.uid, ['manager','corporate']);
      allow write: if hasRole(request.auth.uid, ['manager']);
    }

    // --- Schedules / Shifts ---
    match /schedules/{scheduleId} {
      allow read: if hasRole(request.auth.uid, ['manager','corporate','staff']);
      allow write: if hasRole(request.auth.uid, ['manager']);
    }

    // --- Finance Data ---
    match /finance/{doc=**} {
      allow read: if hasRole(request.auth.uid, ['manager','corporate']);
      allow write: if hasRole(request.auth.uid, ['manager']);
    }

    // --- Join Tokens ---
    match /joinTokens/{tokenId} {
      allow read: if true;
      allow write: if hasRole(request.auth.uid, ['manager']);
    }
  }
}

Audit Requirements

Rule sets are tested by Integrity Core test matrix (≥ 1 allow + 3 deny per collection).

CI job firebase:emulators:exec must pass before deploy.

Argument

Centralized role evaluation ensures parity across all data collections, prevents escalation, and simplifies regression testing.


---

## 📁 Appendix C — Scopes Matrix

**Path:** `docs/bible/appendices/Appendix_C_Scopes.md`

```markdown

## Appendix C — Scopes Matrix (v13.5)

| Scope | Definition | Primary Function | Linked Sections |
|--------|-------------|------------------|-----------------|
| **Auth & Identity** | Authentication, role derivation, claims | Defines `role` field, MFA, onboarding redirect | §2 |
| **Org & Membership** | Org structure and relationships | Manages venues, positions, membership roles | §3 |
| **Scheduling Core** | Shift planning and publishing | Calendar logic, labor-hour optimization | §4 |
| **Finance & Analytics** | Budgeting, forecasting, reports | Read/write financials, analytics dashboards | §5 |
| **Experience Layer** | User interface and routing | UX flows, dashboards, modals, onboarding | §6 |

---

## C.3 – Corporate Staff Path (Extended Role Derivation)

**Primary Scope:** Auth & Identity
**Secondary Scopes:** Org & Membership, Finance & Analytics, Experience Layer

**Definition:**
HQ-level users who require cross-venue visibility without scheduling authority.

**Core Data Fields**

```ts

role: "corporate"
department: string
venuesAccess: string[]
privileges: string[]


Routing Map

Role  Redirect  Component
manager  /dashboard/overview  ManagerDashboard
staff  /dashboard/my-shifts  StaffDashboard
corporate  /dashboard/analytics  CorporateDashboard

Argument:
This extension creates enterprise scalability while maintaining strict least-privilege boundaries.


---

## 📁 Appendix D — RBAC Table

**Path:** `docs/bible/appendices/Appendix_D_RBAC.md`

```markdown

## Appendix D — RBAC Matrix (v13.5)

| Capability | Manager | Corporate | Staff |
|-------------|----------|------------|-------|
| Create/Edit Schedules | ✅ | ❌ | ❌ |
| View Schedules | ✅ | ✅ | ✅ |
| View Labor/Budget | ✅ | ✅ | ❌ |
| Export Payroll | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Update Org Settings | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| Join Org | ✅ (via invite) | ✅ (via invite) | ✅ (via invite) |

**RBAC Enforcement Locations**

1. Firestore Rules (`hasRole` function)
1. API Handlers (route-level guards)
1. Frontend Route Middleware

**Argument**
Defining a simple three-role matrix ensures static auditability, quick rule parsing, and minimal cognitive load for both code and policy reviews.

📁 Appendix E — Performance & KPI Benchmarks

Path: docs/bible/appendices/Appendix_E_KPIs.md

## Appendix E — Performance & KPI Benchmarks (v13.5)

| Metric | Description | Target |
|---------|--------------|--------|
| TTI (Production) | Time to interactive (cold load) | ≤ 1.8 s |
| Lighthouse Score | Accessibility ≥ 95, Performance ≥ 90 | ✅ |
| MonthView Render | Max render time for calendar | < 200 ms |
| Onboarding Duration | Average user completion time | ≤ 3 min |
| Schedule Creation Time | Manager from dashboard → publish | ≤ 5 min |
| Data Integrity | Schema validation pass rate | 100 % |
| CI Stability | Passing green pipeline ratio | 100 % |
| Rollback Recovery | Blue/Green switchback latency | < 30 s |

**Argument**
These quantitative metrics convert design goals into verifiable engineering OKRs.
Every deployment must meet or exceed these to qualify as "All Green."

📁 Appendix G — Onboarding Flow Charts

Path: docs/bible/appendices/Appendix_G_Onboarding.md

## Appendix G — Onboarding Flow Charts (v13.5)

## Diagram 1 — Global Flow Overview

```text

[ Sign In ]
     ↓
[ Role Selection ]
     ├── Manager → [ Create Org → Venue Setup → Budget Inputs ]
     │               ↓
     │          [ Invite Team → Finish → Dashboard ]
     │
     ├── Staff → [ Enter Code → Confirm Org → Profile → Availability ]
     │             ↓
     │        [ Finish → Dashboard ]
     │
     └── Corporate → [ Enter Code → Confirm Org → Department + Venues ]
                     ↓
                [ Permissions Preview → Finish → Analytics Dashboard ]

Diagram 2 — Data Commit Sequence (Manager Path)

1. users/{uid} ← profile
1. orgs/{orgId} ← org data
1. memberships/{uid_orgId} ← link (role=manager)
1. joinTokens/{orgId} ← generated token

Diagram 3 — Data Commit Sequence (Staff/Corporate Path)

1. users/{uid} ← profile (role=staff|corporate)
1. memberships/{uid_orgId} ← link
1. joinTokens/{tokenId} ← marked usedBy


Argument
Visualizing flows prevents drift between UX design, Firestore structure, and rules enforcement.
These charts serve as training diagrams for both engineering and product teams.


---

✅ **Usage Instructions**

- Place each of the above Markdown blocks into `docs/bible/appendices/`.
- Link them exactly as referenced in `Project_Bible_v13.5.md`.
- GitHub will auto-render links when browsing documentation.

---

That set completes your **documentation-grade appendices** for **Bible v13.5** — ready for commit and publication.
````
