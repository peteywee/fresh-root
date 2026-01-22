---
title: "Document Templates"
description: "Reusable templates for documents, code, and processes"
keywords:
  - templates
  - boilerplate
  - scaffolding
  - reusable
category: "template"
status: "active"
audience:
  - developers
  - teams
---

# Document Templates

This section contains reusable templates for documents, code, and processes.

## Document Templates

- **Architecture Decision Record (ADR)** - Template for recording design decisions
- **Incident Report** - Template for post-mortem analysis
- **Meeting Notes** - Template for recording decisions and action items
- **RFC (Request for Comments)** - Template for proposing major changes

## Code Templates

- **API Route Template** - Boilerplate for new API endpoints
- **React Component Template** - Component boilerplate with hooks
- **Test Template** - Unit test boilerplate
- **Page Component** - Next.js page component template

## Process Templates

- **Deployment Checklist** - Pre-deployment verification steps
- **Code Review Checklist** - PR review items
- **Onboarding Checklist** - New team member setup
- **Release Checklist** - Release process steps

---

**See also**: [Guides](../guides/) for step-by-step instructions, [Standards](../standards/) for
best practices

# New TS module

node scripts/gen/scaffold-from-template.mjs CODE_TS_MODULE packages/types/src/widgets.ts
"Name=Widget" "Owner=core" "Description=Domain entity"

# New API route

node scripts/gen/scaffold-from-template.mjs CODE_NEXT_API_ROUTE apps/web/app/api/foobar/route.ts
"Name=FooBar" "Description=Foobar endpoint"

# New Firestore rule

node scripts/gen/scaffold-from-template.mjs CODE_FIRESTORE_RULES firestore.rules.tpl
"Name=Organizations"

# New spec document

node scripts/gen/scaffold-from-template.mjs DOC_SPEC docs/specs/feature-x.md "Feature=Feature X"
"Owner=platform" "Goal=Do X"

````

## Available Templates
- **CODE\_TS\_MODULE.md** – Generic TS module (headers, error shape, logging hooks)
- **CODE\_NEXT\_API\_ROUTE.md** – Next.js App Router route with security/lint guards
- **CODE\_FIRESTORE\_RULES.md** – Firestore RLS baseline (org membership + claims)
- **CODE\_ZOD\_SCHEMA.md** – Domain schema + index export pattern
- **DOC\_RUNBOOK.md** – Operations runbook (SLOs, paging, rollback)
- **DOC\_ADR.md** – Architecture Decision Record
- **DOC\_SPEC.md** – Feature spec with Acceptance Criteria
- **CI\_WORKFLOW\_TEMPLATE.yml** – Hardened minimal CI job

---

## Usage
All templates use `${VarName}` syntax for substitution. Pass key-value pairs as arguments:

```bash
node scripts/gen/scaffold-from-template.mjs CODE_TS_MODULE out.ts "Name=MyModule" "Owner=alice" "Description=Does X"
````

Any unmatched variables will be left empty in the output.
