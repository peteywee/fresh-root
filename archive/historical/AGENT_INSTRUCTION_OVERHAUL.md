---
title: Agent Instruction System Overhaul - Master Project Plan
version: 1.0.0
date_created: 2025-12-08
status: In Progress
owner: TopShelfService LLC
tags: [architecture, agents, documentation, overhaul, governance]
---

# Agent Instruction System Overhaul

![Status: In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

## Executive Summary

Complete restructuring of the AI agent instruction system from 14 fragmented instruction files to a
dynamic, hierarchical loading system with slash commands, red team workflow handoffs, and
streamlined quality gates aligned to actual repository CI/validation.

---

## 🎯 Project KPIs & Success Metrics

### Primary KPIs

| KPI                                | Target                   | Measurement Method                    | Current State        |
| ---------------------------------- | ------------------------ | ------------------------------------- | -------------------- |
| **Instruction File Count**         | ≤5 consolidated files    | File count in `.github/instructions/` | 14 files             |
| **Dynamic Loading Coverage**       | 100% context-aware       | Slash command invocation logs         | 0% (static load)     |
| **Red Team Handoff Adoption**      | 100% non-trivial prompts | Workflow execution logs               | 0% (not implemented) |
| **Quality Gate Alignment**         | 100% match to CI         | Diff between docs and `ci.yml`        | ~60% aligned         |
| **Slash Command Coverage**         | ≥8 core workflows        | Prompt file count                     | 5 prompt files       |
| **Agent Response Validation Rate** | 100% non-trivial         | Handoff completion logs               | 0% (not implemented) |

### Secondary KPIs

| KPI                           | Target                  | Measurement Method           |
| ----------------------------- | ----------------------- | ---------------------------- |
| Context Load Time             | <2s per instruction set | Token count optimization     |
| Instruction Redundancy        | 0% duplicate rules      | Semantic deduplication audit |
| Agent Error Rate (3x pattern) | 0 new safeguards needed | Error pattern detection logs |
| Documentation Freshness       | <7 days stale           | Last modified timestamps     |

---

## ✅ Acceptance Criteria

### AC-1: Instruction Consolidation

- [ ] 14 instruction files consolidated to ≤5 files
- [ ] Each file has clear `applyTo` scope (no overlapping `**`)
- [ ] No duplicate rules across files
- [ ] All files follow standard frontmatter format
- [ ] Dynamic loading triggers documented

### AC-2: Slash Command System

- [ ] ≥8 slash commands created in `.github/prompts/`
- [ ] Each command has explicit tool declarations
- [ ] Commands cover: plan, implement, review, audit, document, test, deploy, red-team
- [ ] User can invoke any workflow with single command
- [ ] Commands integrate with CrewOps protocol

### AC-3: Red Team Workflow

- [ ] Documented handoff protocol (Agent → Red Team → Sr Dev → User)
- [ ] Red Team attack vectors defined (security, logic, patterns)
- [ ] Sr Dev correction criteria documented
- [ ] Workflow can execute within single response (simulated)
- [ ] Manual workflow documented for complex cases

### AC-4: Quality Gate Alignment

- [ ] All gates in docs match actual CI/CD workflows
- [ ] Pattern validator thresholds documented correctly
- [ ] Tier system (0-3) reflected in documentation
- [ ] Blocking vs non-blocking gates clearly marked
- [ ] Rollback procedures documented

### AC-5: Visual Documentation

- [ ] Mermaid mind map of instruction hierarchy
- [ ] Mermaid workflow diagram for red team handoff
- [ ] Mermaid architecture diagram for agent system
- [ ] All diagrams render in GitHub/VS Code

### AC-6: Integration Verification

- [ ] All new files pass lint/format checks
- [ ] Pattern validator accepts new structure (≥90 score)
- [ ] No TypeScript errors introduced
- [ ] Existing workflows unaffected

---

## 📋 TODO List (Execution Plan)

### Phase 1: Discovery & Consolidation Design (Batch 1)

| ID  | Task                                         | Status      | Dependencies | Parallelizable |
| --- | -------------------------------------------- | ----------- | ------------ | -------------- |
| 1.1 | Audit all 14 instruction files for overlap   | ✅ Complete | None         | No             |
| 1.2 | Map `applyTo` patterns to identify conflicts | ✅ Complete | 1.1          | No             |
| 1.3 | Design 5-file consolidation structure        | ✅ Complete | 1.2          | No             |
| 1.4 | Define dynamic loading triggers              | ✅ Complete | 1.3          | Yes            |
| 1.5 | Create consolidation mapping document        | ✅ Complete | 1.3          | Yes            |

### Phase 2: Instruction File Consolidation (Batch 2)

| ID  | Task                                          | Status         | Dependencies | Parallelizable |
| --- | --------------------------------------------- | -------------- | ------------ | -------------- |
| 2.1 | Create MASTER_AGENT_DIRECTIVE.instructions.md | 🔄 In Progress | 1.5          | No             |
| 2.2 | Create CODE_QUALITY_STANDARDS.instructions.md | 🔄 In Progress | 1.5          | Yes            |
| 2.3 | Create SECURITY_AND_SAFETY.instructions.md    | 🔄 In Progress | 1.5          | Yes            |
| 2.4 | Create FRAMEWORK_PATTERNS.instructions.md     | 🔄 In Progress | 1.5          | Yes            |
| 2.5 | Create TESTING_AND_REVIEW.instructions.md     | 🔄 In Progress | 1.5          | Yes            |
| 2.6 | Archive deprecated instruction files          | ⏳ Not Started | 2.1-2.5      | No             |

### Phase 3: Slash Command Implementation (Batch 3)

| ID  | Task                            | Status         | Dependencies | Parallelizable |
| --- | ------------------------------- | -------------- | ------------ | -------------- |
| 3.1 | Create /plan slash command      | 🔄 In Progress | 2.1          | Yes            |
| 3.2 | Create /implement slash command | 🔄 In Progress | 2.1          | Yes            |
| 3.3 | Create /review slash command    | 🔄 In Progress | 2.1          | Yes            |
| 3.4 | Create /audit slash command     | 🔄 In Progress | 2.1          | Yes            |
| 3.5 | Create /red-team slash command  | 🔄 In Progress | 2.1          | Yes            |
| 3.6 | Create /document slash command  | ⏳ Not Started | 2.1          | Yes            |
| 3.7 | Create /test slash command      | ⏳ Not Started | 2.1          | Yes            |
| 3.8 | Create /deploy slash command    | ⏳ Not Started | 2.1          | Yes            |

### Phase 4: Red Team Workflow (Batch 4)

| ID  | Task                               | Status         | Dependencies | Parallelizable |
| --- | ---------------------------------- | -------------- | ------------ | -------------- |
| 4.1 | Define Red Team attack vectors     | 🔄 In Progress | None         | No             |
| 4.2 | Document handoff protocol          | 🔄 In Progress | 4.1          | No             |
| 4.3 | Create simulated workflow template | 🔄 In Progress | 4.2          | No             |
| 4.4 | Integrate with CrewOps Phase E     | ⏳ Not Started | 4.3          | No             |
| 4.5 | Test workflow end-to-end           | ⏳ Not Started | 4.4          | No             |

### Phase 5: Quality Gate Alignment (Batch 5)

| ID  | Task                            | Status         | Dependencies | Parallelizable |
| --- | ------------------------------- | -------------- | ------------ | -------------- |
| 5.1 | Audit ci.yml vs documentation   | 🔄 In Progress | None         | No             |
| 5.2 | Update gate documentation       | ⏳ Not Started | 5.1          | No             |
| 5.3 | Align pattern validator docs    | ⏳ Not Started | 5.1          | Yes            |
| 5.4 | Document tier system accurately | ⏳ Not Started | 5.1          | Yes            |
| 5.5 | Verify rollback procedures      | ⏳ Not Started | 5.2          | No             |

### Phase 6: Visual Documentation (Batch 6)

| ID  | Task                                     | Status         | Dependencies | Parallelizable |
| --- | ---------------------------------------- | -------------- | ------------ | -------------- |
| 6.1 | Create instruction hierarchy mind map    | 🔄 In Progress | 2.1-2.5      | Yes            |
| 6.2 | Create red team workflow diagram         | 🔄 In Progress | 4.2          | Yes            |
| 6.3 | Create agent system architecture diagram | 🔄 In Progress | All          | No             |
| 6.4 | Verify all diagrams render               | ⏳ Not Started | 6.1-6.3      | No             |

### Phase 7: Validation & Deployment (Batch 7)

| ID  | Task                  | Status         | Dependencies | Parallelizable |
| --- | --------------------- | -------------- | ------------ | -------------- |
| 7.1 | Run pattern validator | ⏳ Not Started | All          | No             |
| 7.2 | Run typecheck         | ⏳ Not Started | All          | Yes            |
| 7.3 | Run lint              | ⏳ Not Started | All          | Yes            |
| 7.4 | Manual workflow test  | ⏳ Not Started | 7.1-7.3      | No             |
| 7.5 | Commit and push       | ⏳ Not Started | 7.4          | No             |

---

## 🗺️ Consolidation Mapping

### Current State (14 Files)

```
.github/instructions/
├── ai-prompt-engineering-safety-best-practices.instructions.md  → SECURITY_AND_SAFETY
├── code-review-generic.instructions.md                          → TESTING_AND_REVIEW
├── firebase-typing-and-monorepo-memory.instructions.md          → FRAMEWORK_PATTERNS
├── github-actions-ci-cd-best-practices.instructions.md          → MASTER_AGENT_DIRECTIVE
├── nextjs-tailwind.instructions.md                              → FRAMEWORK_PATTERNS
├── nextjs.instructions.md                                       → FRAMEWORK_PATTERNS
├── object-calisthenics.instructions.md                          → CODE_QUALITY_STANDARDS
├── performance-optimization.instructions.md                      → CODE_QUALITY_STANDARDS
├── playwright-typescript.instructions.md                         → TESTING_AND_REVIEW
├── production-development-directive.instructions.md              → MASTER_AGENT_DIRECTIVE
├── security-and-owasp.instructions.md                            → SECURITY_AND_SAFETY
├── self-explanatory-code-commenting.instructions.md              → CODE_QUALITY_STANDARDS
├── taming-copilot.instructions.md                                → MASTER_AGENT_DIRECTIVE
└── typescript-5-es2022.instructions.md                           → CODE_QUALITY_STANDARDS
```

### Target State (5 Files)

```
.github/instructions/
├── 01_MASTER_AGENT_DIRECTIVE.instructions.md     # Core agent behavior, hierarchy, tool usage
│   └── applyTo: "**"
│   └── Sources: production-development-directive, taming-copilot, github-actions-ci-cd
│
├── 02_CODE_QUALITY_STANDARDS.instructions.md     # Code style, TypeScript, commenting, perf
│   └── applyTo: "**/*.{ts,tsx,js,jsx}"
│   └── Sources: typescript-5-es2022, object-calisthenics, self-explanatory, performance
│
├── 03_SECURITY_AND_SAFETY.instructions.md        # OWASP, AI safety, prompt engineering
│   └── applyTo: "*"
│   └── Sources: security-and-owasp, ai-prompt-engineering-safety
│
├── 04_FRAMEWORK_PATTERNS.instructions.md         # Next.js, Firebase, Tailwind, monorepo
│   └── applyTo: "apps/**,packages/**"
│   └── Sources: nextjs, nextjs-tailwind, firebase-typing-and-monorepo
│
└── 05_TESTING_AND_REVIEW.instructions.md         # Code review, Playwright, test patterns
    └── applyTo: "**/*.{test,spec}.{ts,tsx},tests/**"
    └── Sources: code-review-generic, playwright-typescript
```

---

## 🔄 Dynamic Loading Strategy

### Trigger Conditions

| Context                | Files Loaded           | Trigger                                   |
| ---------------------- | ---------------------- | ----------------------------------------- |
| Any file edit          | 01_MASTER (always)     | Default                                   |
| TypeScript/JavaScript  | 01 + 02_CODE_QUALITY   | File extension match                      |
| API routes, auth code  | 01 + 02 + 03_SECURITY  | Path contains `api/`, `auth/`             |
| Next.js, Firebase code | 01 + 02 + 04_FRAMEWORK | Path contains `apps/`, `packages/`        |
| Test files             | 01 + 02 + 05_TESTING   | Path contains `test`, `spec`, `__tests__` |
| Security audit         | 01 + 03_SECURITY       | Slash command `/audit`                    |
| Red team review        | 01 + 03 + 05           | Slash command `/red-team`                 |

### Implementation

Agent checks file path → loads minimal required instructions → reduces token overhead.

---

## 📊 Risk Assessment

| Risk                                  | Probability | Impact | Mitigation                              |
| ------------------------------------- | ----------- | ------ | --------------------------------------- |
| Instruction loss during consolidation | Medium      | High   | Full backup before changes, diff review |
| Breaking existing workflows           | Low         | High   | Test all slash commands before deploy   |
| Agent behavior regression             | Medium      | Medium | A/B test with old vs new instructions   |
| Documentation drift                   | High        | Medium | Automated doc freshness checks          |
| Over-consolidation (too few files)    | Low         | Medium | Keep 5 file minimum, split if needed    |

---

## 📁 Deliverables Checklist

- [x] `docs/agents/AGENT_INSTRUCTION_OVERHAUL.md` - This file
- [ ] `.github/instructions/01_MASTER_AGENT_DIRECTIVE.instructions.md`
- [ ] `.github/instructions/02_CODE_QUALITY_STANDARDS.instructions.md`
- [ ] `.github/instructions/03_SECURITY_AND_SAFETY.instructions.md`
- [ ] `.github/instructions/04_FRAMEWORK_PATTERNS.instructions.md`
- [ ] `.github/instructions/05_TESTING_AND_REVIEW.instructions.md`
- [ ] `docs/guides/crewops/07_RED_TEAM_WORKFLOW.md`
- [ ] `.github/prompts/plan.prompt.md`
- [ ] `.github/prompts/implement.prompt.md`
- [ ] `.github/prompts/audit.prompt.md`
- [ ] `.github/prompts/red-team.prompt.md`
- [ ] `docs/visuals/AGENT_SYSTEM_ARCHITECTURE.md`
- [ ] Updated `docs/README.md` with new structure

---

## 🔗 Related Documents

- [BATCH_PROTOCOL_OFFICIAL.md](/.github/BATCH_PROTOCOL_OFFICIAL.md) - Execution protocol
- [CrewOps Manual](/docs/guides/crewops/01_CREWOPS_MANUAL.md) - Agent operating manual
- [Activation Framework](/docs/guides/crewops/02_ACTIVATION_FRAMEWORK.md) - Auto-activation
- [Global Cognition Agent](/docs/agents/GLOBAL_COGNITION_AGENT.md) - Agent spec

---

**Last Updated**: December 8, 2025  
**Owner**: TopShelfService LLC  
**Status**: In Progress - Phase 2-6 Executing
