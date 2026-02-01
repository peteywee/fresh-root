---

title: "Schema Documentation Template"
description: "Template for documenting database schemas and data models"
keywords:
- template
- schema
- documentation
- database
- zod
category: "template"
status: "active"
audience:
- developers
- architects
related-docs:
- CODE\_ZOD\_SCHEMA.md
- ../standards/SDK\_FACTORY\_COMPREHENSIVE\_GUIDE.md

createdAt: "2026-01-31T12:00:00Z"
lastUpdated: "2026-01-31T12:00:00Z"

---

# Schema Documentation Template

## Domain Definition

- Problem it models:
- Critical invariants:

## Shape (Zod)

- File: `packages/types/src/<...>.ts`
- Export: `export const <Name>Schema = z.object({ ... })`

## Usage Map

- API routes using it:
- UI forms using it:
- Rules referencing properties:

## Tests

- Link to TEST SPEC
- Valid/invalid examples
