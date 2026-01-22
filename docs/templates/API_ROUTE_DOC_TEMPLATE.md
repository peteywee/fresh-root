---
title: "API Route Documentation Template"
description: "Template for documenting API routes and endpoints"
keywords:
  - template
  - api
  - documentation
  - routes
category: "template"
status: "active"
audience:
  - developers
related-docs:
  - CODE_NEXT_API_ROUTE.md
  - ../standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md
---

# API Route Documentation Template

## Summary

- Route: `app/api/<...>/route.ts`
- Methods: GET/POST/PUT/DELETE
- Purpose: \[description]

## Contracts

- Request body schema: \[Zod schema reference]
- Response shape: \[response types]

## AuthN/Z

- Required claims/roles: `['admin','manager']` unless readonly
- Rate limit class: \[burst/sliding]

## Tests

- Link to TEST SPEC
- Expected error codes and messages
