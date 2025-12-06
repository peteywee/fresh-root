# L1 — System Architecture Overview
This section describes the **global system**: major capabilities, critical flows, and cross-cutting concerns.

**Consolidated From:** ARCHITECTURAL_REVIEW_PANEL_INPUTS.md (December 6, 2025)  
**Cross-Reference:** See `99_APPENDICES/architectural_review.md` for 9-panel expert model findings

## 1. High-Level Components
- **Web App (Fresh Schedules PWA)**
  - Next.js App Router, React, Tailwind.
  - Responsible for UI, UX, and client-side orchestration.

- **Backend / API Layer (Fresh Root services)**
  - Node/Express or serverless handlers.
  - Bridges web app to Firebase, 3rd-party services, and future SDKs.

- **Firebase Stack**
  - Auth for identity and sessions.
  - Firestore for primary data store.
  - Cloud Functions for denormalization, notifications, and consistency checks.
  - Firestore Rules for RBAC and tenant isolation.

- **CI/CD & Tooling**
  - Monorepo with pnpm workspaces and Turbo pipeline.
  - GitHub Actions for checks and deploys.
  - Docs and analysis agents (filetag/MCP/etc.) — **supporting**, not core runtime.

## 2. Critical Flows
1. **Onboarding Flow**
   - Create user profile → org → venue → membership → initial labor settings.

1. **5-Minute Schedule Creation Flow**
   - Select venue + week → ingest labor & forecast inputs → generate shifts → assign staff → review conflicts → publish → notify.

1. **Staff Lifecycle**
   - Add/edit employees → manage availability/preferences → track acknowledgments.

1. **Notification Flow**
   - Publish schedule → fan-out notifications (push/SMS/email) → track delivery status (where possible).

1. **RBAC & Data Access**
   - Authenticated calls → claims-based access → rules-verified reads/writes.

## 3. Cross-Cutting Concerns

### 3.1 Multi-Tenant Isolation Strategy ✅
**Design:** Network-scoped + Firestore rules enforcement (dual-layer)

**Architecture:**
- Layer 1: API request validation (org membership check)
- Layer 2: Firestore security rules (document-level RBAC)

**Status:** Production-ready with 7-role hierarchy (staff < corporate < scheduler < manager < admin < org_owner)

**Key Files:**
- Rules: `firestore.rules` (document-level access control)
- API Factory: `packages/api-framework/src/index.ts` (org context loading)
- RBAC Schemas: `packages/types/src/rbac.ts`

---

### 3.2 Security & Auth Strategy ✅  
**Pattern:** Firebase session cookies + hierarchical RBAC

**Flow:**
1. Client authenticates with Firebase JS SDK
2. Client exchanges ID token for session cookie (POST /api/session)
3. Server creates HttpOnly, Secure, SameSite=Lax cookie
4. SDK factory verifies cookie on each request
5. Organization membership + role loaded from Firestore

**Strengths:**
- ✅ Session-based auth with HttpOnly cookies
- ✅ Hierarchical RBAC (7 role levels with inheritance)
- ✅ Firestore rules as secondary enforcement
- ✅ Environment validation via Zod schemas

**Gaps & Roadmap:**
- ⏳ MFA enforcement only for managers+ (extend to all roles)
- ⏳ Add operation audit logging (compliance requirement)
- ⏳ Implement data encryption at rest strategy

---

### 3.3 Scaling Strategy ✅
**Current:** Single-instance production-ready  
**Target:** Multi-instance (3-5 nodes) within 60 days

**Critical Infrastructure:**
- ✅ Redis rate limiting (Upstash/self-hosted)
- ✅ OpenTelemetry tracing (distributed debugging)
- ⏳ Session affinity (required for multi-instance)
- ⏳ Circuit breaker for Firebase failures

**Roadmap:**
- Week 1-2: Configure Redis + OTEL backend
- Week 3: Load balancer session stickiness + canary deployment
- Week 4: Multi-instance validation & rollback procedures

---

### 3.4 Firebase Dependency Assessment
**Current State:** Heavily Firebase-dependent (Auth, Firestore, Functions)

**Strategic Assessment:**
- ✅ **Pragmatic Choice** - Firebase appropriate for current scale (single-instance MVP)
- ⏳ **Lock-In Risk** - Limited portability to other databases
- ✅ **Mitigation** - SDK factory abstraction reduces coupling (estimate: 200-300 hours to switch)

**Future Flexibility:** Abstraction layer in place; can migrate if needed post-Series-B

---

### 3.5 Disaster Recovery & Compliance
**Data Backup:** Firebase automatic backups (Google SLA)

**Compliance Strategy:**
- ✅ Multi-tenant isolation (network + rules)
- ⏳ Audit logging with immutable records (in progress)
- ⏳ Data retention & deletion policies (doc in progress)
- ⏳ SOC 2 certification roadmap (Q2 2026)

---

## 4. Critical Findings (from 9-Panel Expert Review)
- **Distributed Consistency**
  - Multi-document writes across orgs/venues/schedules/shifts must be transactional where possible, or have compensation mechanisms.

- **Security**
  - Deny-by-default RBAC.
  - No public endpoints that allow cross-tenant queries.
  - Secret management via env vars, not inline code.

- **Observability**
  - Structured logs for critical flows.
  - Metrics around schedule creation time and error rates.

- **Cost Awareness**
  - Firestore reads/writes minimized via careful modeling and denormalization.
  - Cloud Functions designed to avoid unnecessary hot paths.

The remainder of the report drills into each subsystem and component under this structure.
