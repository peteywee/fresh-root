# Master Docs Index — Consolidated Navigation

This master index consolidates the most important documentation across the repository so that contributors can quickly find key guides, runbooks, checklists and migration steps. Use this file when onboarding or preparing releases.

---

## Architecture & System

- `ARCHITECTURE_DIAGRAMS.md` — Visual system overview and mermaid diagrams for architecture components.
- `COMPLETE_TECHNICAL_DOCUMENTATION.md` — Full, detailed technical documentation and architectural narrative.
- `FINAL_SUMMARY.md` — End-to-end project summary and key takeaways.

## Project Bible & Migration

- `bible/Project_Bible_v15.0.0.md` — The v15 project bible: scope, decisions, and major milestones.
- `bible/Project_Bible_v15_MIGRATION_PLAN.md` — High-level plan for migration to v15.
- `bible/Project_Bible_v15_SCOPE_AND_AUTHORITY.md` — Scope and ownership guiding the project.

## Blocks & Releases

- `blocks/BLOCK1_OVERVIEW.md` — Block 1 overview and goals.
- `blocks/BLOCK1_STATUS.md` — Status and metrics for Block 1.
- `blocks/BLOCK2_OVERVIEW.md` — Block 2 overview and goals.
- `blocks/BLOCK2_STATUS.md` — Status and metrics for Block 2.
- `blocks/BLOCK3_OVERVIEW.md` — Block 3 overview and goals.
- `BLOCK3_QUICK_START.md` — Quick start for Block 3 testing and verification.
- `BLOCK3_SUMMARY.md` — Summary of Block 3 implementation.
- `BLOCK3_COMPLETION_MANIFEST.md` — Completion checklist and artifacts for Block 3.
- `BLOCK3_FINAL_SUMMARY.md` — Final Block 3 delivery notes.
- `BLOCK3_SIGN_OFF.md` — Sign-off / executive summary that confirms deliverable readiness.

## Layers & Contracts

- `layers/LAYER_00_DOMAIN_KERNEL.md` — Domain kernel boundary and domain modeling.
- `layers/LAYER_01_INFRASTRUCTURE.md` — Infrastructure responsibilities and requirements.
- `layers/LAYER_02_APPLICATION_LIBS.md` — Application-level reusable libraries.
- `layers/LAYER_03_API_EDGE.md` — API edge patterns and route standards.
- `layers/LAYER_04_UI_UX.md` — UX patterns and design standards.

## AI & Agents

- `ai/README.md` — Overview of agent-driven workflows and RAG integration.
- `ai/CHAT_CONTEXT.md` — Ordered chat context loader rules.
- `ai/SYSTEM_PROMPT.md` — System prompt patterns for AI assistants.
- `ai/TOOLS.md` — List & configuration for AI tools and MCP manifests.
- `ai/AGENTS/Builder.md` — Builder agent: responsibilities and guardrails for code generation.
- `ai/AGENTS/QA.md` — QA agent: testing responsibilities and coverage rules.
- `ai/AGENTS/ReleaseManager.md` — Release manager agent: CI enforcement rules.

## Onboarding & API

- `onboarding/ONBOARDING_API.md` — Onboarding API guide and endpoints.
- `onboarding/ONBOARDING_BACKEND_QUICKREF.md` — Quick references and validators for backend onboarding.
- `onboarding/ONBOARDING_BACKEND_COMPLETION.md` — Completed backend tasks for onboarding.

## MCP & Firecrawl

- `mcp/FIRECRAWL_MCP_SETUP.md` — How to run the Firecrawl MCP server locally.
- `mcp/mcp.json` — MCP manifest & services.

## Migration & Crosswalks

- `migration/v15/PHASE2_SCHEMA_CROSSWALK.md` — Schema crosswalk for Phase 2 migration.
- `migration/v15/PHASE2_SPEC_CROSSWALK.md` — Specification crosswalk.
- `migration/v15/PHASE3_CODE_MIGRATION_CHECKLIST.md` — Code migration checklist.
- `migration/v15/PHASE3_DATA_MIGRATION_CHECKLIST.md` — Data migration checklist.
- `migration/v15/PHASE4_HARDENING_AND_FREEZE.md` — Release freeze and hardening steps.

## Quality & Standards

- `quality/AUTO_TAGGING.md` — File tagging & auto-tagging process.
- `quality/CONSOLIDATION_OPPORTUNITIES.md` — Docs that can be consolidated or removed.
- `quality/PERFORMANCE.md` — Performance notes and optimizations.
- `quality/TAGGING_SYSTEM.md` — Tagging system & meaning of tags.
- `quality/TECHNICAL_DEBT.md` — Known debt and cleanup plan.
- `standards/FILE_HEADER_STANDARD.md` — File headers, tags and standard formatting.
- `standards/IMPORT_STANDARD.md` — Import patterns & conventions.
- `standards/SCHEMA_CATALOG_STANDARD.md` — Schema catalog standards.
- `standards/v15/40_DATA_ACCESS_POLICY_STANDARD.md` — Database-agnostic canonical policy and `packages/types/src/policy.auth.ts`.
- `standards/v15/41_EXCEPTION_PROTOCOL_STANDARD.md` — Principled Exception Protocol for auditable exceptions and the `@DOCTRINE_EXCEPTION` annotation.
- `standards/v15/42_STANDARD_CLASSIFICATION_STANDARD.md` — Tiered classification of standards (Tier 1/Tier 2).

## Tooling & Runbooks

- `tooling/CI_WORKFLOW_STANDARDS.md` — CI workflow policies.
- `tooling/CONTRIBUTING.md` — Contribution guide & test expectations.
- `tooling/SETUP.md` — Setup guide for new developers.
- `runbooks/publish-notify.md` — Publish & notify runbook.
- `runbooks/backup-scheduler.md` — Backup scheduling & restore steps.
- `runbooks/logging-retention.md` — Log retention & monitoring.

## Security

- `security/security.md` — Overall security stance.
- `security/SECURITY_ASSESSMENT.md` — Assessment notes and actions.
- `security/SECURITY_HARDENING_2025-11-06.md` — Hardening log & steps (Nov 6, 2025).

---

If you'd like, I can:

- Generate short summaries for each file (one-line) by scanning file headers
- Add links from `docs/DOCS_INDEX.md` to this master index
- Combine and compress less-critical docs into a smaller number of canonical files

Next steps: update `docs/DOCS_INDEX.md` to link to `MASTER_DOCS_INDEX.md` for centralized navigation.
