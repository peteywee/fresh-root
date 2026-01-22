# Documentation Metadata Schema

> **Location**: `docs/_METADATA_SCHEMA.md`  
> **Purpose**: Defines YAML frontmatter format for all docs  
> **Last Updated**: January 15, 2026

---

## YAML Frontmatter Format

All markdown files in `/docs/` must include this frontmatter at the top:

```yaml
---
title: "Human-Readable Title"
description: "One-sentence purpose of this document"
keywords:
  - keyword1
  - keyword2
  - keyword3
category: "architecture|guide|standard|reference|decision|report|template|archive"
tags:
  - tag1
  - tag2
status: "active|draft|deprecated|archived"
audience:
  - developers
  - operators
  - architects
related-docs:
  - path/to/related1.md
  - path/to/related2.md
---
# Title (H1 header)
...content...
```

---

## Field Definitions

### `title` (required)

- **Type**: String
- **Purpose**: Human-readable document title
- **Length**: 4-100 characters
- **Example**: "SDK Factory Pattern Implementation Guide"

### `description` (required)

- **Type**: String
- **Purpose**: One-sentence purpose statement
- **Length**: 10-150 characters
- **Example**: "Complete guide to implementing the SDK factory pattern for type-safe API endpoints"

### `keywords` (required)

- **Type**: Array of strings
- **Purpose**: Searchable keywords for AI and human discovery
- **Count**: 3-10 keywords
- **Examples**: `["sdk", "factory", "typescript", "api-routes", "validation"]`
- **Rules**: Lowercase, hyphenated for multi-word terms

### `category` (required)

- **Type**: Enum - one of:
  - `architecture` - System design, architectural patterns, decisions
  - `guide` - How-to guides, tutorials, step-by-step procedures
  - `standard` - Coding standards, rules, patterns, best practices
  - `reference` - Quick reference, API docs, checklists
  - `decision` - Architecture Decision Records (ADRs)
  - `report` - Analysis reports, audits, retrospectives
  - `template` - Reusable templates, boilerplates
  - `archive` - Historical, deprecated, or completed work

### `tags` (optional)

- **Type**: Array of strings
- **Purpose**: Cross-cutting categorization beyond main category
- **Examples**:
  - `["security", "firebase", "performance", "testing"]`
  - `["p0", "breaking-change", "ai-focus"]`

### `status` (required)

- **Type**: Enum - one of:
  - `active` - Current, maintained, authoritative
  - `draft` - Work in progress, not finalized
  - `deprecated` - Superseded by newer doc, keep for reference
  - `archived` - Historical, completed, not actively used

### `audience` (required)

- **Type**: Array - one or more of:
  - `developers` - Software engineers writing code
  - `operators` - DevOps/SRE/Platform teams
  - `architects` - Solution architects, system designers
  - `ai-agents` - AI coding agents (GitHub Copilot, etc)
  - `stakeholders` - Product managers, executives
  - `teams` - All team members

### `related-docs` (optional)

- **Type**: Array of relative paths
- **Purpose**: Cross-reference related documents for navigation
- **Examples**:
  ```yaml
  related-docs:
    - architecture/API_SCHEMA_AUDIT.md
    - standards/CODING_RULES_AND_PATTERNS.md
    - guides/DEPLOYMENT.md
  ```

---

## Directory Structure

```
docs/
├── _METADATA_SCHEMA.md (this file)
├── _INDEX_KEYWORDS.md (keyword search index)
├── _INDEX_GRAPH.md (relationship graph for AI)
├── INDEX.md (master table of contents)
│
├── architecture/
│   ├── README.md (category intro)
│   ├── [individual .md files with metadata]
│   ├── decisions/ (ADRs)
│   └── patterns/ (architectural patterns)
│
├── guides/
│   ├── README.md (category intro)
│   ├── setup/ (local development)
│   ├── deployment/ (production deployment)
│   ├── operations/ (running in production)
│   └── [other guides]
│
├── standards/
│   ├── README.md (category intro)
│   ├── coding-rules.md
│   ├── patterns/ (coding patterns)
│   ├── validation/ (data validation)
│   └── [other standards]
│
├── reference/
│   ├── README.md (category intro)
│   ├── api-reference.md
│   ├── cli-reference.md
│   ├── checklists/ (deployment, security, etc)
│   └── [quick-reference docs]
│
├── reports/
│   ├── README.md (category intro)
│   ├── audits/ (security, code, infrastructure)
│   ├── retrospectives/ (post-mortems, lessons learned)
│   ├── analyses/ (performance, dependency, etc)
│   └── [individual reports]
│
├── templates/
│   ├── README.md (category intro)
│   ├── code/ (code templates)
│   ├── documents/ (document templates)
│   └── [other templates]
│
└── archive/
    ├── README.md (archive index)
    ├── deprecated/ (superseded docs)
    ├── historical/ (old work)
    └── migrations/ (completed migrations)
```

---

## Example File with Metadata

```yaml
---
title: "SDK Factory Pattern Implementation Guide"
description: "Complete guide to implementing the SDK factory pattern for type-safe API endpoints"
keywords:
  - sdk
  - factory
  - typescript
  - api-routes
  - validation
  - zod
  - next.js
category: "guide"
tags:
  - api
  - patterns
  - typescript
  - firebase
status: "active"
audience:
  - developers
  - ai-agents
related-docs:
  - standards/CODING_RULES_AND_PATTERNS.md
  - architecture/API_SCHEMA_AUDIT.md
  - templates/API_ROUTE_TEMPLATE.md
---
# SDK Factory Pattern Implementation Guide

[Content here]
```

---

## Migration Checklist

For each document:

- [ ] Add YAML frontmatter with all required fields
- [ ] Move to appropriate subdirectory
- [ ] Update all cross-references
- [ ] Add to category README.md
- [ ] Update master INDEX.md
- [ ] Add to keyword search index
- [ ] Add to relationship graph

---

## For AI Agents

When searching or indexing docs:

1. Always parse and use YAML frontmatter
2. Use `keywords` field for semantic search
3. Use `related-docs` to understand relationships
4. Use `category` and `tags` for classification
5. Use `status` to prioritize active docs over deprecated
6. Use `audience` to filter for relevance
7. Cross-reference via `_INDEX_GRAPH.md` for context
