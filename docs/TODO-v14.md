# Project Bible v14.0.0 – Tenancy & Onboarding Implementation

**Status**: 🔄 In Progress
**Started**: November 7, 2025
**Target Completion**: TBD

> **Note**: All `[TEN-*]` and `[ONB-*]` tasks are P0/P1 for enabling Block 4.
> This represents Block 3.5 / Block 0 for multi-tenancy implementation.

## Progress Overview

- **Roadmap A (Network + Onboarding)**: 2/40 tasks complete (5%)
- **Roadmap B4 (Block 4 - UX & Scheduling)**: 0/10 tasks complete
- **Roadmap B5 (Block 5 - PWA & Deployment)**: 0/9 tasks complete
- **Total**: 2/59 tasks complete (3%)

---

## Roadmap A – Implement v14 + Network + Secure Onboarding

**Goal**: Take the "Network + graph + admin form + onboarding" design and make it real in the codebase and docs.

### A.0 Meta / Tracking

- [x] **[META-01]** Create a v14 TODO file
  - ✅ Create `docs/TODO-v14.md` (this file) _(completed Nov 7, 2025)_
  - ✅ Add header: "Project Bible v14.0.0 – Tenancy & Onboarding Implementation"
  - ✅ Add note: "All [TEN-*] and [ONB-*] tasks are P0/P1 for enabling Block 4"

- [x] **[META-02]** Document specification gaps
  - ✅ Create `docs/bible/GAPS_v14.0.0.md` _(completed Nov 7, 2025)_
  - ✅ Identified 5 critical gaps: Cross-Network User Scoping, MFA Enforcement, OrgVenueAssignment semantics, Firestore Rules helpers, Block 4 UX spec
  - ✅ Assigned owners and deadlines for each gap

### A.1 Bible & Docs Integration

These are about making the spec the source of truth.

- [ ] **[BIB-01]** Add v14 Bible file to repo
  - [ ] Save `docs/bible/Project_Bible_v14.0.0.md` using the exhaustive draft
  - [ ] Cross-link from `docs/README.md` → reference v14 as "current spec"
  - [ ] Add to `docs/bible/index.md` → add v14 with a one-line summary
  - [ ] Ensure previous Bible versions (v13.5, v13.6) remain for historical context

- [ ] **[BIB-02]** Update block overview docs
  - [ ] In `docs/BLOCK3_IMPLEMENTATION.md`, add note: "v14 introduces Network tenancy; implementation in progress"
  - [ ] Add new `docs/BLOCK4_PLANNING.md` that references v14 for Network + onboarding requirements

- [ ] **[BIB-03]** Document Network types and paths
  - [ ] Create `docs/schema-network.md` with:
    - [ ] Network (`networks/{networkId}`)
    - [ ] Corporate, Org, Venue
    - [ ] corpOrgLinks
    - [ ] orgVenueAssignments
    - [ ] AdminResponsibilityForm
  - [ ] Add path map table for each entity: Path, Owner, Used by blocks, Status (implemented/planned)

### A.2 Types & Schemas (Zod / TypeScript)

Add all the new shapes to `packages/types`.

- [ ] **[TEN-01]** Network schema
  - [ ] Create `packages/types/src/networks.ts` with:
    - [ ] `NetworkSchema`
    - [ ] `CreateNetworkSchema` (what onboarding uses)
    - [ ] `UpdateNetworkSchema`
    - [ ] Enums: `NetworkKind`, `NetworkSegment`, `NetworkStatus`, `NetworkPlan`, `BillingMode`
  - [ ] Export from central `index.ts`

- [ ] **[TEN-02]** Corporate / Org / Venue schemas (Network-aware)
  - [ ] Update `corporates.ts` (or create if missing) to include `networkId`
  - [ ] Update `orgs.ts` to include `networkId` and remove "org is tenant" assumptions in comments
  - [ ] Update `venues.ts`:
    - [ ] Add `networkId`
    - [ ] Make `orgId` optional or remove in favor of `OrgVenueAssignment`
  - [ ] Ensure all three export: Main schema, Create/Update schemas, Types inferred from Zod

- [ ] **[TEN-03]** Link schemas
  - [ ] Create `packages/types/src/links/corpOrgLinks.ts`:
    - [ ] `CorpOrgLinkSchema`
    - [ ] Types for `relationshipType`, `status`
  - [ ] Create `packages/types/src/links/orgVenueAssignments.ts`:
    - [ ] `OrgVenueAssignmentSchema`
  - [ ] Export from barrel file(s)

- [ ] **[TEN-04]** AdminResponsibilityForm schema
  - [ ] Create `packages/types/src/compliance/adminResponsibilityForm.ts`:
    - [ ] Full shape for form (legal name, taxId, acceptance flags, etc.)
    - [ ] `CreateAdminResponsibilityFormSchema` for inbound API payload
  - [ ] Add to top-level export

- [ ] **[TEN-05]** Tests for new schemas
  - [ ] Under `packages/types/src/__tests__/` add:
    - [ ] `networks.test.ts`
    - [ ] `corpOrgLinks.test.ts`
    - [ ] `orgVenueAssignments.test.ts`
    - [ ] `adminResponsibilityForm.test.ts`
  - [ ] Cover:
    - [ ] Valid payloads
    - [ ] Missing required fields
    - [ ] Invalid enum values
    - [ ] Edge cases for tax IDs and boolean flags

### A.3 Firestore Paths & Rules Migration Plan

Don't flip everything at once; define a clear migration phase.

- [ ] **[TEN-06]** Write a migration design doc
  - [ ] Create `docs/migrations/MIGRATION_NETWORK_TENANCY.md`
  - [ ] Describe:
    - [ ] Current org-centric paths (e.g. `/orgs/{orgId}/...`)
    - [ ] Target network-centric paths (`/networks/{networkId}/orgs/{orgId}`)
    - [ ] Strategy (gradual vs big-bang)
    - [ ] Migration tool responsibilities

- [ ] **[TEN-07]** Extend Firestore rules with network root
  - [ ] Add `match /networks/{networkId}/...` skeleton, as in Bible v14
  - [ ] Ensure:
    - [ ] Networks cannot be created/updated/deleted directly by clients
    - [ ] Compliance subcollection locked down
    - [ ] Memberships read/write still handled via backend

- [ ] **[TEN-08]** Transitional rules
  - [ ] Keep existing `/orgs/{orgId}/...` rules in place for now
  - [ ] Add comments and TODOs indicating which collections will move under `/networks/{networkId}` later

- [ ] **[TEN-09]** Rules unit tests
  - [ ] Add `tests/rules/networks.spec.ts`:
    - [ ] Verify: No client can create a network
    - [ ] Verify: Only service account or super-admin can read compliance doc
    - [ ] Verify: Regular network member can read their profile and allowed collections

### A.4 Onboarding Backend APIs

APIs to implement the flow we designed.

- [ ] **[ONB-01]** `/api/onboarding/verify-eligibility`
  - [ ] Input: none, uses auth token + user profile
  - [ ] Logic:
    - [ ] Check `request.auth != null`
    - [ ] Check email verified flag
    - [ ] Fetch user profile (`selfDeclaredRole`) and assert allowed roles for network creation
    - [ ] Rate-limit: N attempts per user per day
  - [ ] Returns: OK or error with human-readable reason

- [ ] **[ONB-02]** `/api/onboarding/admin-form`
  - [ ] Input: `CreateAdminResponsibilityFormSchema`
  - [ ] Logic:
    - [ ] Validate payload via Zod
    - [ ] Validate tax ID format by country
    - [ ] Call external tax validation service (mock initially)
    - [ ] Store temporary pre-network record or session token
  - [ ] Returns: `formToken` or `sessionId` for create-network later

- [ ] **[ONB-03]** `/api/onboarding/create-network-org`
  - [ ] Input: `orgName`, `industry`, `approxLocations`, `hasCorporateAboveYou`, `venueName`, location fields, `formToken`
  - [ ] Logic:
    - [ ] Re-validate eligibility via verify-eligibility logic
    - [ ] Resolve AdminResponsibilityForm via `formToken`
    - [ ] In a transaction:
      - [ ] Create Network (`status = "pending_verification"`)
      - [ ] Write AdminResponsibilityForm into `networks/{networkId}/compliance/...`
      - [ ] Create Org
      - [ ] Create Venue
      - [ ] Create memberships (`network_owner`, `org_owner`)
      - [ ] Create OrgVenueAssignment if applicable
    - [ ] Optionally run tax ID check sync/async
    - [ ] Compute whether Network can be immediately active
  - [ ] Returns: `networkId`, `orgId`, `venueId`, `status`

- [ ] **[ONB-04]** `/api/onboarding/create-network-corporate`
  - [ ] Similar to org version but:
    - [ ] Accepts `corporateName`, `brandName`, `ownsLocations`, `worksWithFranchisees`, etc.
    - [ ] Creates Corporate node instead of Org (or in addition)
    - [ ] Applies stricter email/role criteria

- [ ] **[ONB-05]** `/api/onboarding/activate-network` (maybe internal)
  - [ ] Used by:
    - [ ] Async verification worker, or
    - [ ] Manual review tool
  - [ ] Sets `network.status = "active"` if all preconditions satisfied

- [ ] **[ONB-06]** `/api/onboarding/join-with-token`
  - [ ] Refine existing join-token route (if present) to:
    - [ ] Resolve to `networkId`, `orgId`, `venueId` under the new model
    - [ ] Create memberships scoped by `networkId`

### A.5 Onboarding Frontend (Wizard Skeleton)

We don't fully flesh out Block 4 UI here, but we need enough to support the Network flows.

- [ ] **[UI-ONB-01]** Wizard route scaffolding
  - [ ] Add routes:
    - [ ] `/onboarding/profile`
    - [ ] `/onboarding/intent`
    - [ ] `/onboarding/join`
    - [ ] `/onboarding/create-network-org`
    - [ ] `/onboarding/create-network-corporate`
    - [ ] `/onboarding/admin-responsibility`
  - [ ] Ensure protected route layout (requires login)

- [ ] **[UI-ONB-02]** Profile step
  - [ ] Components: Full Name, phone, language, timezone, Role picker
  - [ ] On submit:
    - [ ] Call existing "update profile" API or create one if missing
    - [ ] Navigate to `/onboarding/intent`

- [ ] **[UI-ONB-03]** Intent step
  - [ ] Three cards: Join, Set up my team, Corporate/HQ
  - [ ] Route based on selection

- [ ] **[UI-ONB-04]** Org network wizard
  - [ ] Step 1: Org basics
  - [ ] Step 2: Initial venue
  - [ ] Step 3: Admin Responsibility form
  - [ ] Step 4: "Creating your workspace…" + redirect to main app

- [ ] **[UI-ONB-05]** Corporate wizard
  - [ ] Same pattern, with corporate-specific fields

- [ ] **[UI-ONB-06]** Error/blocked states
  - [ ] Screen for "You're staff; you need an invite instead"
  - [ ] Screen for "Email not verified"
  - [ ] Screen for "Network pending verification" if they log in before activation

### A.6 Tests & CI

- [ ] **[TEST-01]** API tests for onboarding routes
  - [ ] Add integration tests (Vitest/Jest) that:
    - [ ] Exercise: `verify-eligibility`, `admin-form`, `create-network-org`, `create-network-corporate`
    - [ ] Assert that invalid roles/emails are blocked
    - [ ] Assert that `networkId` is created and status is correct

- [ ] **[TEST-02]** E2E skeleton for wizard
  - [ ] Using Playwright/Cypress:
    - [ ] Simulate signup → profile → org wizard → first login
    - [ ] Check that user ends up with Network and Org membership

- [ ] **[CI-01]** Wire new tests into pipeline
  - [ ] Update CI config to run onboarding API tests and new rules tests
  - [ ] Make them required for merge

---

## Roadmap B – Block 4 & Block 5 Breakdown (Built on v14)

Now, assuming Roadmap A is in-progress or done, let's break Blocks 4 and 5 so you can see the runway.

### Block 4 – UX & Scheduling Core (WT-004-ish)

**Goal**: A new user (owner/manager) can complete secure onboarding, land in a schedule builder, and create/publish a basic weekly schedule in < 5 minutes.

#### B4.1 Foundation & Navigation

- [ ] **[B4-01]** UX layout shell
  - [ ] Define main app layout after onboarding:
    - [ ] Left nav (Home, Schedule, People, Settings)
    - [ ] Top bar (Network/Org/Venue selector, user menu)
  - [ ] Implement context selector that shows:
    - [ ] Current Network name (from v14 model)
    - [ ] Org (if multiple)
    - [ ] Venue (if multiple)

- [ ] **[B4-02]** Design system tokens
  - [ ] Solidify typography, spacing, colors in Tailwind config
  - [ ] Establish base components:
    - [ ] Button, Input, Select, Modal, Card
  - [ ] Add stories or examples if using Storybook

#### B4.2 Onboarding Experience Polishing (Building on Roadmap A)

- [ ] **[B4-03]** Polish wizard UX
  - [ ] Copy & microcopy that clearly explains:
    - [ ] Why we ask for tax ID
    - [ ] Why they must accept admin responsibility
  - [ ] Show step indicator ("Step 1 of 4")
  - [ ] Friendly success screen: "Your workspace is ready"

- [ ] **[B4-04]** "Join existing team" flow polish
  - [ ] Slim, fast path: paste invite link → confirm org/venue → "You're in"
  - [ ] Dedicated "My Shifts" view for staff

#### B4.3 Schedule Builder UI

- [ ] **[B4-05]** Data model hooks
  - [ ] Confirm API endpoints for:
    - [ ] Fetching schedules for a venue
    - [ ] Creating/updating shifts
    - [ ] Publishing schedule
  - [ ] Ensure they are network-aware (`networkId`, `orgId`, `venueId`)

- [ ] **[B4-06]** Week view schedule grid
  - [ ] Layout:
    - [ ] Days on top
    - [ ] Staff (or positions) down the side
  - [ ] Shift cards:
    - [ ] Time range
    - [ ] Assigned person
    - [ ] Role/position
  - [ ] Interactions:
    - [ ] Create shift (click/drag)
    - [ ] Edit shift (click card)
    - [ ] Delete/cancel shift

- [ ] **[B4-07]** Publish/cancel workflow
  - [ ] Button: "Publish week"
  - [ ] Modal to confirm
  - [ ] State indicator: Draft vs Published schedule
  - [ ] Basic notifications stub (later can tie into messaging)

#### B4.4 Labor & Constraints (Minimal)

- [ ] **[B4-08]** Labor inputs
  - [ ] Screen to set:
    - [ ] `defaultAverageWage` (from Network)
    - [ ] Weekly labor budget or percentage
  - [ ] Connect those values into schedule view (basic totals)

- [ ] **[B4-09]** Validation
  - [ ] Warnings if:
    - [ ] Shift length < min or > max
    - [ ] Hours per staff > threshold
  - [ ] Non-blocking for v1, just warnings

#### B4.5 UX Acceptance Tests

- [ ] **[B4-10]** UX acceptance runbook
  - [ ] Document a manual scenario:
    - [ ] New owner signs up
    - [ ] Completes org wizard
    - [ ] Creates first schedule with 3–5 shifts
    - [ ] Publishes week
  - [ ] Turn into an E2E test once stable

### Block 5 – PWA & Deployment

**Goal**: Turn the app into an installable, offline-friendly PWA with a reliable deployment story.

#### B5.1 PWA Shell

- [ ] **[B5-01]** Manifest & icons
  - [ ] Create `manifest.json`:
    - [ ] `name`, `short_name`, `theme_color`, `icons`, `start_url`
  - [ ] Generate icon set (192, 512, etc.)
  - [ ] Wire manifest into the `<head>`

- [ ] **[B5-02]** Service Worker
  - [ ] Decide between:
    - [ ] Workbox, or
    - [ ] Custom SW with simple caching
  - [ ] Implement:
    - [ ] Cache app shell (JS, CSS, fonts)
    - [ ] Network-first for dynamic data (Firestore / APIs)
  - [ ] Show offline banner or fallback page

#### B5.2 Performance & Budgets

- [ ] **[B5-03]** Performance budget
  - [ ] Define targets:
    - [ ] TTI < ~2s on mid-tier device
    - [ ] JS bundle size budget
  - [ ] Measure via Lighthouse

- [ ] **[B5-04]** Bundle optimization
  - [ ] Code-splitting for heavy routes (schedule builder, admin settings)
  - [ ] Tree-shake unused dependencies
  - [ ] Ensure images and icons optimized

#### B5.3 Deployment & Env Management

- [ ] **[B5-05]** Environments / configs
  - [ ] Define:
    - [ ] dev, staging, production Firebase projects & env vars
  - [ ] Store config in `.env` or appropriate secret store

- [ ] **[B5-06]** CI/CD pipeline
  - [ ] Build steps:
    - [ ] typecheck, lint, tests, rules tests, E2E (smoke)
  - [ ] Deploy steps:
    - [ ] Deploy to staging on merge to develop
    - [ ] Deploy to production on tagged releases (e.g. v1.2.0)

- [ ] **[B5-07]** Blue/Green or canary
  - [ ] Choose simple strategy first:
    - [ ] Deploy to staging
    - [ ] Manual smoke test
    - [ ] Promote to production
  - [ ] Later: automated canary or traffic splitting

#### B5.4 Monitoring & Recovery

- [ ] **[B5-08]** Error monitoring
  - [ ] Hook up:
    - [ ] Sentry or similar for frontend errors
    - [ ] Logs for backend API

- [ ] **[B5-09]** Backups / rollbacks
  - [ ] Confirm:
    - [ ] Firestore backup schedule
    - [ ] Strategy for config rollback (tags, release notes)
  - [ ] Ensure documented in `docs/ops/DEPLOYMENT.md`

---

## Progress Tracking

### Weekly Checkpoints

#### Week of Nov 7, 2025

- ✅ Created TODO-v14.md
- 🔄 In progress: [List active tasks]
- 📋 Planned for next week: [List upcoming tasks]

#### Week of [Date]

- ...

### Blockers & Risks

| ID  | Blocker | Impact | Mitigation | Owner | Status |
| --- | ------- | ------ | ---------- | ----- | ------ |
| -   | -       | -      | -          | -     | -      |

### Dependencies

- **Roadmap A** must be substantially complete before Block 4 UI work can begin
- **Network schemas** (TEN-01 to TEN-04) are prerequisites for onboarding APIs
- **Firestore rules** (TEN-07 to TEN-09) must be in place before production onboarding

---

## Notes & Decisions

### Architecture Decisions

1. **Network as tenant root**: All data scoped under `/networks/{networkId}`
2. **Gradual migration**: Keep existing `/orgs/` paths during transition
3. **Backend-only network creation**: Clients cannot create networks directly
4. **Tax validation**: Mock initially, integrate real service in Phase 2

### Open Questions

- [ ] Which tax validation service to use? (Stripe Tax, TaxJar, custom)
- [ ] Timeline for migration from org-centric to network-centric paths?
- [ ] How to handle existing orgs without networks during migration?

---

## Related Documentation

- [Project Bible v14.0.0](./bible/Project_Bible_v14.0.0.md) - Full specification (when created)
- [Specification Gaps v14.0.0](./bible/GAPS_v14.0.0.md) - **NEW**: Critical gaps and action items
- [Project Bible v13.5](./bible/Project_Bible_v13.5.md) - Previous version
- [Block 3 Implementation](./BLOCK3_IMPLEMENTATION.md) - Integrity Core
- [Schema Map](./schema-map.md) - Current data model
- [CI Workflow Standards](./CI_WORKFLOW_STANDARDS.md) - CI/CD patterns

---

**Last Updated**: November 7, 2025
**Maintained By**: Patrick Craven
**Status**: Living document - update weekly
