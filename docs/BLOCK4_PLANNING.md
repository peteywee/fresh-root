# Block 4 Planning – UX & Scheduling Core

**Status:** 🟡 Planning / Spec-Approved
**Started:** November 7, 2025
**Dependencies:** Blocks 1-3 (complete), Bible v14.0.0 (complete)
**Target Completion:** TBD

---

## Purpose

Block 4 delivers the **user-facing experience** that turns Fresh Schedules from a technical foundation into a usable product. This includes:

1. **Secure Onboarding Wizard** – implementing Network creation, Admin Responsibility Form, and activation gates as defined in Bible v14.0.0
2. **Schedule Builder UI** – enabling managers to create, edit, and publish schedules in ≤ 5 minutes
3. **Labor Management** – basic budget tracking and labor cost visualization

---

## Bible v14.0.0 Alignment

Block 4 implementation MUST adhere to [Project Bible v14.0.0](./bible/Project_Bible_v14.0.0.md), specifically:

- **Section 4:** Network Creation, Onboarding Wizard, and Admin Responsibility
- **Section 4.5:** Onboarding Wizard – User Flows (Detailed)
- **Section 2.4:** User Scoping & Multi-Network Context (GAP-1 resolution)
- **Section 4.5.6:** Activation Logic & MFA Gates (GAP-2 resolution)

All UI flows, API endpoints, and data writes must match the Bible specification.

---

## Key Requirements

### 1. Onboarding Wizard

#### 1.1 Phases (from Bible v14.0.0 §4.5)

1. **Identity & Profile** (`/onboarding/profile`)
   - Capture: fullName, phone, preferredLanguage, timeZone, selfDeclaredRole
   - Write to: `/users/{uid}`
   - No Network created yet

2. **Intent Selector** (`/onboarding/intent`)
   - Three paths:
     - "Join existing team" → `/onboarding/join`
     - "Set up my team" → `/onboarding/create-network-org`
     - "Corporate/HQ" → `/onboarding/create-network-corporate`

3. **Join Existing Team** (no Network creation)
   - Input: invite link or join code
   - API: `POST /api/onboarding/join-with-token`
   - Creates memberships only

4. **Org-Centric Network Creation**
   - Step 1: Security pre-check (`POST /api/onboarding/verify-eligibility`)
   - Step 2: Org & Network basics form
   - Step 3: Initial venue details
   - Step 4: Admin Responsibility Form (`POST /api/onboarding/admin-form`)
   - Step 5: Network creation (`POST /api/onboarding/create-network-org`)
   - Step 6: Activation (background process)

5. **Corporate-Centric Network Creation**
   - Similar to org flow with stricter email validation
   - API: `POST /api/onboarding/create-network-corporate`

#### 1.2 API Endpoints Required

- [ ] `POST /api/onboarding/verify-eligibility`
  - Check: auth, emailVerified, selfDeclaredRole
  - Returns: OK or error with reason

- [ ] `POST /api/onboarding/admin-form`
  - Input: AdminResponsibilityForm payload
  - Validate: legalEntityName, taxIdNumber, businessEmail, etc.
  - Store temporary form or session token
  - Returns: `formToken` for network creation

- [ ] `POST /api/onboarding/create-network-org`
  - Input: org details, venue details, formToken
  - Transaction:
    - Create Network (status: "pending_verification")
    - Write AdminResponsibilityForm to compliance subcollection
    - Create Org, Venue, Memberships
  - Returns: networkId, orgId, venueId, status

- [ ] `POST /api/onboarding/create-network-corporate`
  - Similar to org creation with corporate-specific fields

- [ ] `POST /api/onboarding/join-with-token`
  - Input: join token or code
  - Resolve: networkId, orgId, venueId, roles
  - Create: Network membership, org membership

- [ ] Background activation function
  - Check: Tax ID verified, MFA enabled, venue exists
  - Update: network.status = "active" if all conditions met

#### 1.3 UI Components Required

- [ ] Profile form with role picker
- [ ] Intent selector (3-card layout)
- [ ] Join flow (token input + confirmation)
- [ ] Org wizard (multi-step form)
- [ ] Corporate wizard (extended fields)
- [ ] Admin Responsibility Form component
- [ ] Progress indicator ("Setting up your workspace…")
- [ ] Pending verification banner (shows blockers)

### 2. Schedule Builder

#### 2.1 Core Features

- **Week view grid**
  - Days across top
  - Staff or positions down the side
  - Shift cards showing time range, role, assigned person

- **Create shift**
  - Click/drag to create
  - Modal form: time, role, venue, pay rate
  - Assign staff or leave as open shift

- **Edit shift**
  - Click card to open edit modal
  - Update time, role, assignment
  - Message history & notes

- **Publish schedule**
  - Button: "Publish week"
  - Confirmation modal
  - State indicator: Draft vs Published
  - Basic notifications (stub for now)

#### 2.2 Data Model (from Bible v14.0.0 §3)

Paths under `/networks/{networkId}/`:

- `schedules/{scheduleId}` – weekly schedule container
- `shifts/{shiftId}` – individual shift records
- `events/{eventId}` – calendar events (optional)
- `attendance/{attendanceId}` – clock-in/out records (future)

#### 2.3 API Endpoints Required

- [ ] `GET /api/schedules?networkId={networkId}&venueId={venueId}&week={week}`
  - Returns: schedule data for the week

- [ ] `POST /api/shifts`
  - Input: networkId, scheduleId, venueId, start, end, assignedUserId, etc.
  - Creates: shift document

- [ ] `PATCH /api/shifts/{shiftId}`
  - Updates: shift fields

- [ ] `DELETE /api/shifts/{shiftId}`
  - Soft delete or hard delete (TBD)

- [ ] `POST /api/schedules/{scheduleId}/publish`
  - Sets: schedule.status = "published"
  - Triggers: notifications (stub)

#### 2.4 UI Components Required

- [ ] Week view grid component
- [ ] Shift card component
- [ ] Create shift modal
- [ ] Edit shift modal
- [ ] Staff picker dropdown
- [ ] Publish confirmation dialog
- [ ] Schedule status indicator

### 3. Labor Management (Basic)

#### 3.1 Features

- **Labor inputs**
  - Screen to set: defaultAverageWage, weekly labor budget
  - Connect to: network.defaultAverageWage (from Bible v14.0.0 §3.1)

- **Labor totals**
  - Calculate: total scheduled hours, estimated labor cost
  - Display: in schedule view sidebar or footer

- **Validation warnings**
  - Show warnings (non-blocking):
    - Shift length < min or > max
    - Staff hours > threshold
    - Budget exceeded

#### 3.2 API Endpoints Required

- [ ] `GET /api/labor/budget?networkId={networkId}&week={week}`
  - Returns: budget data, actuals, variance

- [ ] `PATCH /api/networks/{networkId}/settings`
  - Updates: labor-related settings (wage, budget)

#### 3.3 UI Components Required

- [ ] Labor settings form
- [ ] Budget display widget (hours, cost, percentage)
- [ ] Validation warning badges

---

## Routing Structure

### Protected Routes

All Block 4 routes require authentication and appropriate roles.

```text
/onboarding/
  /profile               # Step 1: User profile
  /intent                # Step 2: Path selector
  /join                  # Join existing team
  /create-network-org    # Org-centric wizard
  /create-network-corporate # Corporate wizard
  /admin-responsibility  # Admin form step

/dashboard/
  /overview              # Post-onboarding landing (network summary)
  /schedule/week         # Main schedule builder
  /schedule/shift/{shiftId} # Edit shift details
  /labor-hub             # Labor management
  /staff                 # Team directory
  /settings/network      # Network settings
  /settings/venue/{venueId} # Venue configuration
```

### Route Guards

- `/onboarding/*` – requires: `auth`, redirect if already onboarded
- `/dashboard/*` – requires: `auth`, `network membership`, `status=active`
- Pending verification – show banner, disable scheduling actions

---

## Testing Strategy

### 1. API Tests

- [ ] Onboarding eligibility checks
- [ ] Admin form validation (invalid tax ID, missing fields)
- [ ] Network creation transaction (success and rollback)
- [ ] Join token resolution
- [ ] Shift CRUD operations
- [ ] Schedule publish workflow

### 2. E2E Tests (Playwright)

- [ ] Signup → profile → org wizard → first login
- [ ] Join flow with token
- [ ] Create shift → assign staff → publish schedule
- [ ] Corporate wizard with stricter validations

### 3. Rules Tests

- [ ] Network members can read schedules
- [ ] Non-members cannot read schedules
- [ ] Only backend can create networks
- [ ] Compliance documents are read-restricted

---

## Dependencies & Blockers

### Required Before Block 4 Start

- ✅ Blocks 1-3 complete (v1.1.0)
- ✅ Bible v14.0.0 finalized
- ✅ GAPS v14.0.0 documented
- [ ] Network schemas created (`packages/types/src/networks.ts`)
- [ ] Firestore rules updated for `/networks/{networkId}`
- [ ] Admin Responsibility Form schema defined

### External Dependencies

- Firebase Auth (MFA enforcement)
- Tax ID validation service (mock initially, integrate later)
- Email service (for activation notifications)

---

## Success Criteria

Block 4 is considered **complete** when:

1. **Onboarding:**
   - A new user can complete the org wizard in ≤ 5 minutes
   - Network is created with status="pending_verification"
   - Activation occurs automatically when conditions are met
   - All APIs match Bible v14.0.0 spec

2. **Schedule Builder:**
   - Manager can create 5 shifts in ≤ 3 minutes
   - Publish workflow completes successfully
   - Draft/published state is correctly reflected

3. **Labor Management:**
   - Labor budget is visible and updates dynamically
   - Warnings appear for constraint violations

4. **Tests:**
   - API tests cover all onboarding and scheduling endpoints
   - E2E test covers full user journey
   - Rules tests enforce network-scoped access

5. **Documentation:**
   - All APIs documented in OpenAPI/Swagger
   - UX flows match Bible v14.0.0 diagrams
   - Known limitations documented

---

## Timeline (Estimate)

| Week | Focus Area                              | Deliverables                                       |
| ---- | --------------------------------------- | -------------------------------------------------- |
| 1    | Network schemas & types                 | `networks.ts`, `corporates.ts`, `orgs.ts`, `venues.ts` |
| 2    | Onboarding API (eligibility, admin form) | `/api/onboarding/verify-eligibility`, `/api/onboarding/admin-form` |
| 3    | Network creation APIs                   | `/api/onboarding/create-network-org`, corporate variant |
| 4    | Onboarding UI (profile, intent, forms)  | UI routes and components for wizard               |
| 5    | Schedule builder API                    | CRUD endpoints for schedules and shifts           |
| 6    | Schedule builder UI (week view)         | Grid component, shift cards                       |
| 7    | Labor management                        | Budget API, labor totals, validation warnings     |
| 8    | Testing & polish                        | E2E tests, API tests, bug fixes                   |

**Total Estimated Duration:** 8 weeks (adjustable based on team size and velocity)

---

## Related Documentation

- [Project Bible v14.0.0](./bible/Project_Bible_v14.0.0.md) – Authoritative spec
- [TODO v14](./TODO-v14.md) – Detailed task breakdown
- [Specification Gaps v14.0.0](./bible/GAPS_v14.0.0.md) – Resolved gaps
- [BLOCK3_IMPLEMENTATION.md](./BLOCK3_IMPLEMENTATION.md) – Previous block context
- [schema-network.md](./schema-network.md) – Network entity documentation (to be created)

---

**Last Updated:** November 7, 2025
**Maintained By:** Patrick Craven
**Status:** Living document – update as Block 4 progresses
