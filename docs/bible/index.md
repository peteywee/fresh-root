# Project Bible Index

This directory contains the authoritative Project Bible documents for Fresh Schedules.
Each Bible version represents a major milestone in the project's evolution.

## Current Version

### [Project Bible v14.0.0](./Project_Bible_v14.0.0.md) ⭐ **ACTIVE**

**Status:** Production-Ready Specification
**Released:** November 2025
**Summary:** Comprehensive multi-tenant architecture with Network as tenant root, Admin Responsibility Forms,
tax ID handling, secure onboarding wizard, and production readiness gates. Includes complete specifications
for Blocks 1-3 (Security, Reliability, Integrity) and roadmap through Blocks 4-8.

**Key Features:**

- Network as true tenant boundary (multi-tenancy)
- Corporate / Organization / Venue graph relationships
- Admin Responsibility Form with legal/compliance hooks
- Tax ID verification and MFA enforcement
- Secure onboarding wizard (org-centric and corporate-centric paths)
- Complete Firestore rules with helper functions
- Production readiness KPIs and definition of done

**Related Documents:**

- [Specification Gaps v14.0.0](./GAPS_v14.0.0.md) - Critical gaps and resolutions
- [TODO v14](../TODO-v14.md) - Implementation task tracking

---

## Previous Versions

### [Project Bible v13.5](./Project_Bible_v13.5.md)

**Status:** Superseded
**Released:** November 2025
**Summary:** Expanded edition with Corporate Staff Path, comprehensive appendices, and Blocks 1-5 specifications.
Introduced Network concept at design level.

**Key Features:**

- Five core scopes (Auth & Identity, Org & Membership, Scheduling Core, Finance & Analytics, Experience Layer)
- Corporate Staff Path for HQ users
- RBAC matrix with three roles (manager, corporate, staff)
- Onboarding wizard flows and data contracts
- Performance KPIs and success benchmarks

---

## Version History

| Version | Release Date  | Status     | Key Theme                                   |
| ------- | ------------- | ---------- | ------------------------------------------- |
| 14.0.0  | November 2025 | ✅ Active  | Production-ready multi-tenancy & compliance |
| 13.6    | November 2025 | Superseded | Network design (not fully implemented)      |
| 13.5    | November 2025 | Superseded | Expanded edition with Corporate Staff Path  |
| 13.x    | October 2025  | Archived   | Earlier iterations                          |

---

## How to Use This Index

### For Architects

Start with v14.0.0 sections:

- Section 2: Core Concepts & Mental Model
- Section 3: Data Model – Network and Graph
- Section 5: Firestore Rules

### For Engineers

Focus on v14.0.0 sections:

- Section 4: Network Creation, Onboarding Wizard, and Admin Responsibility
- Section 5.3: Firestore Security Rules – Helper Functions
- Section 6: Blocks 1–3 (Completed) and Beyond

### For Product/Legal

Review v14.0.0 sections:

- Section 1: Purpose, Non-Goals, and Audience
- Section 2.3: Security & Responsibility Principles
- Section 4.3: Admin Responsibility Form – Spec
- Section 8: KPIs & Definition of "Production-Ready"

### For Implementers

Check the task tracking:

- [TODO v14](../TODO-v14.md) - Detailed task breakdown with progress
- [GAPS v14.0.0](./GAPS_v14.0.0.md) - Specification gaps to address

---

## Maintenance

- **Maintainer:** Patrick Craven (Product & Architecture)
- **Review Cycle:** After each major block completion
- **Update Policy:** Proposal → Impact Analysis → Explicit Update → Implementation
- **Cross-References:** Keep TODO, GAPS, and implementation docs in sync

---

**Last Updated:** November 7, 2025
