# Feature Guides & Domain Documentation

This directory contains comprehensive guides and documentation for major features and business domains within Fresh Schedules.

## Overview

- **Purpose**: Provide complete feature documentation, workflows, and domain knowledge
- **Scope**: Scheduling, labor planning, staff management, notifications, billing, onboarding, UI/UX
- **Maintenance**: CI/CD automated (`maintain-docs.yml`)
- **Quality**: 10/10 compliance enforced

## Featured Domains

### Workforce Management
- SCHEDULING.md - Shift and schedule management
- LABOR_PLANNING.md - Workforce planning and forecasting
- STAFF_MANAGEMENT.md - Staff profiles, roles, and management

### Operations
- NOTIFICATIONS.md - Alert and notification systems
- BILLING_AND_PRICING.md - Billing models and pricing strategy
- SHIFT_COMPLIANCE.md - Compliance and regulatory requirements

### User Experience
- ONBOARDING.md - New user onboarding workflows
- UI_UX.md - User interface and experience guidelines

## Structure

```
guides/
├── README.md                           (this file)
├── SCHEDULING.md                       (shift/schedule management)
├── LABOR_PLANNING.md                   (workforce planning)
├── STAFF_MANAGEMENT.md                 (staff management)
├── NOTIFICATIONS.md                    (alert systems)
├── BILLING_AND_PRICING.md              (billing models)
├── SHIFT_COMPLIANCE.md                 (compliance)
├── ONBOARDING.md                       (user onboarding)
└── UI_UX.md                            (UX guidelines)
```

## Quick Navigation

- **Managing shifts?** Start with [SCHEDULING.md](./SCHEDULING.md)
- **Planning workforce?** See [LABOR_PLANNING.md](./LABOR_PLANNING.md)
- **Managing staff?** Check [STAFF_MANAGEMENT.md](./STAFF_MANAGEMENT.md)
- **Billing questions?** Read [BILLING_AND_PRICING.md](./BILLING_AND_PRICING.md)
- **New user experience?** Browse [ONBOARDING.md](./ONBOARDING.md)

## Guide Organization

Each guide includes:
- ✅ Business context and purpose
- ✅ Key workflows and processes
- ✅ Data models and relationships
- ✅ API endpoints and integration points
- ✅ Common patterns and best practices
- ✅ Troubleshooting and edge cases

## CI/CD Maintenance

This directory is maintained by `.github/workflows/maintain-docs.yml`:
- **Validates**: All README.md files exist and are current
- **Generates**: Guide completeness reports
- **Enforces**: 10/10 quality gates
- **Updates**: Cross-links to root-level guides index

## Quality Standards

- ✅ All files follow self-explanatory code commenting guidelines
- ✅ Cross-references validated (0 broken links)
- ✅ 10/10 quality score maintained
- ✅ Last updated: December 7, 2025

---

**Breadcrumb**: [Home](../) > **Guides** · [Infrastructure](../infrastructure/) · [Visuals](../visuals/)
