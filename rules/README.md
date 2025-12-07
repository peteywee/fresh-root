# Rules & Governance

This directory contains canonical rules, governance frameworks, compliance standards, and security patterns that govern all development within Fresh Schedules.

## Overview

- **Purpose**: Define non-negotiable rules for code quality, security, compliance, and authorization
- **Scope**: Development standards, RBAC, security policies, error prevention, organizational hierarchy
- **Maintenance**: CI/CD automated (`maintain-docs.yml`)
- **Quality**: 10/10 compliance enforced

## Core Areas

### Development Rules & Patterns

- [CODING_RULES_AND_PATTERNS.md](./CODING_RULES_AND_PATTERNS.md) - Canonical development standards
- [ERROR_PREVENTION_PATTERNS.md](./ERROR_PREVENTION_PATTERNS.md) - Safeguard patterns and error detection

### Security & Authorization

- RBAC_AND_SECURITY.md - Role-based access control and security policies
- COMPLIANCE.md - Regulatory and compliance requirements

### Organization & Structure

- ORG_HIERARCHY.md - Organizational structure and team definitions

## Structure

```
rules/
├── README.md                           (this file)
├── CODING_RULES_AND_PATTERNS.md       (canonical standards)
├── ERROR_PREVENTION_PATTERNS.md       (safeguard patterns)
├── RBAC_AND_SECURITY.md               (authorization policies)
├── COMPLIANCE.md                       (compliance requirements)
└── ORG_HIERARCHY.md                    (organizational structure)
```

## Quick Navigation

- **Development standards?** Start with [CODING_RULES_AND_PATTERNS.md](./CODING_RULES_AND_PATTERNS.md)
- **Error prevention?** See [ERROR_PREVENTION_PATTERNS.md](./ERROR_PREVENTION_PATTERNS.md)
- **Security policies?** Check [RBAC_AND_SECURITY.md](./RBAC_AND_SECURITY.md)
- **Team structure?** Read [ORG_HIERARCHY.md](./ORG_HIERARCHY.md)

## Hard Rules (Must Follow)

These rules are enforced by CI/CD and development workflows:

1. ✅ All code must pass type checking (TypeScript strict mode)
2. ✅ All inputs must be validated (Zod schemas)
3. ✅ All API routes must use SDK factory pattern
4. ✅ All organization queries must be scoped to `orgId`
5. ✅ All errors must be logged with context before returning to client
6. ✅ All deployments must follow production standards
7. ✅ All documentation must be maintained by CI/CD
8. ✅ All quality scores must be 10/10 (no exceptions)

## CI/CD Maintenance

This directory is maintained by `.github/workflows/maintain-docs.yml`:

- **Validates**: All README.md files exist and are current
- **Generates**: Quality metrics and compliance reports
- **Enforces**: 10/10 quality gates
- **Updates**: Cross-links to root-level `/RULES.md`

## Quality Standards

- ✅ All files follow self-explanatory code commenting guidelines
- ✅ Cross-references validated (0 broken links)
- ✅ 10/10 quality score maintained
- ✅ Last updated: December 7, 2025

---

**Breadcrumb**: [Home](../) > **Rules** · [AI](../ai/) · [Infrastructure](../infrastructure/)
