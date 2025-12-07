# Repository Rules & Governance

**🔗 Primary Source**: `/rules/CODING_RULES_AND_PATTERNS.md`  
**Auto-maintained by**: `.github/workflows/maintain-docs.yml`  
**Last Synced**: December 7, 2025

---

This is a maintained copy of the canonical rules that govern all development in Fresh Schedules.

## Quick Links

### Core Rules

- [Full Rules Documentation](/rules/CODING_RULES_AND_PATTERNS.md)
- [Error Prevention Patterns](/rules/ERROR_PREVENTION_PATTERNS.md)
- [Security & RBAC](/rules/RBAC_AND_SECURITY.md)
- [Compliance Requirements](/rules/COMPLIANCE.md)

### Related Guidance

- [Development Patterns](/patterns/README.md)
- [Testing Standards](/tests/README.md)
- [Repository State](/STATE.md)

## The Hard Rules (Non-Negotiable)

1. ✅ **Type Safety** - TypeScript strict mode enforced
2. ✅ **Input Validation** - Zod schemas required for all inputs
3. ✅ **SDK Factory** - All API routes use SDK factory pattern
4. ✅ **Organization Isolation** - All queries scoped to `orgId`
5. ✅ **Error Logging** - Context logged before every error response
6. ✅ **Production Standards** - All deployments follow checklist
7. ✅ **Documentation** - All changes must be documented
8. ✅ **Quality** - 10/10 scores enforced (no exceptions)

## For Full Context

👉 Read the complete rules at `/rules/CODING_RULES_AND_PATTERNS.md`

---

**ℹ️  This file is automatically maintained. Changes should be made to `/rules/CODING_RULES_AND_PATTERNS.md`.**
