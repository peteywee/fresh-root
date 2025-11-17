# Project Bible v15 – Scope & Authority Declaration

**Version:** v15.0.0  
**Maintainer:** Lead Developer (Doc Owner)  
**CTO Oversight:** Patrick Craven  
**Effective Date:** 2025-11-11

---

## 1. Purpose

This document formally defines the scope, rules, and design authority for the **Fresh Schedules v15 release cycle**.  
Its intent is to freeze all ambiguous items, unify decision-making, and codify operational standards.

---

## 2. Confirmed v15 Scope

**IN SCOPE (for delivery):**

- ✅ Core data migration (v13.5 → v14 → v15)
- ✅ Tenant hierarchy: **Network → Corp → Org → Venue → Staff**
- ✅ Onboarding & Org join (create / invite / approve)
- ✅ Scheduling with labor budget hints (manual + simple guidance)
- ✅ Attendance tracking & reporting
- ✅ Firestore rules and RLS enforcement
- ✅ Integrity and schema validation
- ✅ PWA “offline-lite” installable shell

**OUT OF SCOPE (deferred → v15.1 +):**

- ❌ Full AI scheduling logic
- ❌ Predictive analytics or BI dashboards
- ❌ Mobile wrappers (Capacitor/Expo)
- ❌ UX experimentation outside golden-path flows

---

## 3. Platform & Agility Strategy

Firebase (Auth + Firestore + Functions + Hosting) remains the **primary platform**,  
but the **infrastructure and domain layers** must stay **provider-agnostic**.

**Design rule:** All data access passes through an abstract **Provider Adapter Interface** in `LAYER_01_INFRASTRUCTURE`.  
This enables future migration to Postgres / Supabase / other without rewriting business logic.

---

## 4. Tenant & RBAC Model

| Level       | Description                        | Example Entity                  |
| :---------- | :--------------------------------- | :------------------------------ |
| **Network** | Umbrella network / top parent      | “Top Shelf Service”             |
| **Corp**    | Business grouping inside a network | “Top Shelf Hospitality LLC”     |
| **Org**     | Operational tenant unit            | “Fresh Schedules – TX Division” |
| **Venue**   | Physical location or store         | “Dallas Store #1”               |
| **Staff**   | Individual user record             | Employee / Manager              |

**Roles (v15 enumeration):**

- `staff`
- `manager`
- `owner`
- `admin_internal` _(internal-use only)_

---

## 5. Org Discovery & Join Process

### 5.1 Staff → Org Discovery

Staff may **search** for organizations by:

- Name
- Tax ID
- Address / ZIP
- Org email or phone
- Person in charge / admin responsibility form

Search results are limited to `publicSearch = true` orgs.

### 5.2 Join Workflow

1. Staff submits join request via search.
2. Org manager/admin receives approval notice.
3. Approval issues an **invite token** and sends via email.
4. User completes onboarding with that token.

Implementation: `orgTokens` collection + `orgSearchIndex` helper.

---

## 6. Scheduling & Labor Logic

### Mode: `S2` – Manual + Simple Hints

Managers create shifts manually.  
System provides **labor % warnings** and **allowed hours/budget totals**.

### Labor Computation Level `L2`

- Base = forecasted sales × (labor % / 100) ÷ avg wage
- Forecasts imported via **CSV/XLSX/email**.
- A minimal **AI ingestion layer** performs file parsing and validation  
  (not conversational AI; headless logic only).

---

## 7. Offline / PWA Policy

**Offline-Lite (O2):**

- Cached shell + last known schedule.
- Reads when offline, writes fail gracefully.
- Installable manifest & icons verified.

---

## 8. MFA Policy

- **Managers / Owners:** MFA required.
- **Staff:** Optional.
- **Admin Internal:** System-only (enforced at auth level).

---

## 9. Migration Operations

- Acceptable downtime ≤ **3 hours (D2)**.
- Full restore to last known good export (**R1**) if failure occurs.

---

## 10. Performance & Testing

- Lighthouse ≥ **90 (P2)** on key screens.
- Testing = **T2** (Critical + Key Components).
  - Run only in CI (GitHub / Linux).
  - **No background servers** in VS Code.

---

## 11. Documentation Governance

- **Owner:** Lead Developer.
- Docs must be updated with every PR that alters behavior.
- AI assistants can draft; final approval = Lead Dev.

---

## 12. Enforcement & Freeze Authority

Once `Project_Bible_v15.0.0.md` and related checklists are complete,  
CTO (Patrick Craven) declares **v15 freeze**.  
After freeze: only hotfixes until post-v15.
