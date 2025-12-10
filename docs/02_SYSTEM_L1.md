# L1 — System Architecture Overview

This section describes the **global system**: major capabilities, critical flows, and cross-cutting concerns.

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
