# Documentation Index

Welcome to the Fresh Root documentation. This directory is organized into the following categories.

---

## 🤖 Agent Instruction System (NEW)

The agent instruction system has been consolidated and modernized. All AI coding agents (GitHub Copilot, Claude, Cursor, etc.) should follow these consolidated instructions:

### Consolidated Instruction Files (`.github/instructions/`)

| File | Purpose | Loads When |
|------|---------|------------|
| `01_MASTER_AGENT_DIRECTIVE` | Core agent behavior, hierarchy, tool usage | Always (`**`) |
| `02_CODE_QUALITY_STANDARDS` | TypeScript, Object Calisthenics, performance | `*.{ts,tsx,js,jsx}` |
| `03_SECURITY_AND_SAFETY` | OWASP, AI safety, prompt injection prevention | All files (`*`) |
| `04_FRAMEWORK_PATTERNS` | Next.js, Firebase, Tailwind, SDK factory | `apps/**`, `packages/**` |
| `05_TESTING_AND_REVIEW` | Vitest, Playwright, code review | `*.{test,spec}.*`, `tests/**` |

### Slash Commands (`.github/prompts/`)

**Workflow Commands**

| Command | Purpose |
|---------|---------|
| `/plan` | Create implementation plans with TODO lists |
| `/implement` | Execute implementation with validation |

**Quality Commands**

| Command | Purpose |
|---------|---------|
| `/review` | Code review with priority tiers (Critical/Important/Suggestion) |
| `/test` | Generate and run tests |

**Security Commands**

| Command | Purpose |
|---------|---------|
| `/audit` | Security audit based on OWASP |
| `/red-team` | Red team attack analysis with Sr Dev review |

**DevOps & Documentation**

| Command | Purpose |
|---------|---------|
| `/deploy` | Build, validate, deploy workflow |
| `/document` | Generate JSDoc, README, API docs |

**Utility Commands**

| Command | Purpose |
|---------|---------|
| `/remember` | Persist learnings to memory instructions |
| `/github-copilot-starter` | Set up Copilot config for new project |

### Key Documentation

- **[Agent System Architecture](./visuals/AGENT_SYSTEM_ARCHITECTURE.md)** - Visual diagrams (mermaid) of the entire agent system
- **[Agent Instruction Overhaul](./agents/AGENT_INSTRUCTION_OVERHAUL.md)** - Master project plan with KPIs
- **[Red Team Workflow](./guides/crewops/07_RED_TEAM_WORKFLOW.md)** - Security handoff protocol

---

## 📚 [Standards](./standards/)

Core engineering standards, coding rules, and best practices that must be followed.

- **[Coding Rules & Patterns](./standards/CODING_RULES_AND_PATTERNS.md)** - The authoritative guide for coding standards.
- **[SDK Factory Guide](./standards/SDK_FACTORY_COMPREHENSIVE_GUIDE.md)** - Guide for the API SDK Factory pattern.
- **[Error Prevention](./standards/ERROR_PREVENTION_PATTERNS.md)** - Patterns to avoid common errors.
- **[Firebase Typing](./standards/FIREBASE_TYPING_STRATEGY.md)** - Strategy for type-safe Firebase usage.
- **[PNPM Enforcement](./standards/PNPM_ENFORCEMENT.md)** - Rules regarding package management.
- **[Memory Management](./standards/MEMORY_MANAGEMENT.md)** - Guidelines for memory usage.

## 🚀 [Production](./production/)

Guides, checklists, and validation steps for production deployment.

- **[Production Readiness](./production/PRODUCTION_READINESS.md)** - Core readiness checklist.
- **[Deployment Guide](./production/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions.
- **[Environment Validation](./production/PRODUCTION_ENV_VALIDATION.md)** - How to validate the production environment.
- **[Final Sign Off](./production/FINAL_SIGN_OFF.md)** - Sign-off procedures.

## 🏗️ [Architecture](./reports/architecture/)

System architecture, subsystems, and component documentation.

- **[Subsystems](./reports/architecture/subsystems/)** - Detailed analysis of system modules (Scheduling, Auth, etc.).
- **[Components](./reports/architecture/components/)** - Documentation of core components.

## 🎨 [Visuals](./visuals/)

Visual documentation, diagrams, and status dashboards.

- **[Visuals Index](./visuals/README.md)** - Overview of visual assets.

## 📖 [Guides](./guides/)

How-to guides, workflows, and developer setup.

- **[Quick Start](./guides/QUICK_START.md)** - Getting started with the repo.
- **[VS Code Tasks](./guides/VSCODE_TASKS.md)** - Guide to available VS Code tasks.
- **[CrewOps](./guides/crewops/README.md)** - Operational manuals for the crew.
- **[Prompt Workflow](./guides/FIREBASE_PROMPT_WORKFLOW.md)** - Workflow for Firebase prompting.

## 🤖 [Agents](./agents/)

Documentation for AI agents and automation systems.

- **[Agents Index](./agents/README.md)** - Overview of active agents.

## 📊 [Reports](./reports/)

Status reports, audits, and historical analysis.

- **[Dependency Remediation](./reports/DEPENDENCY_REMEDIATION_REPORT.md)** - Report on dependency health.
- **[Test Intelligence](./reports/TEST_INTELLIGENCE_SUMMARY.md)** - Summary of test intelligence.

## 🏛 [Archive](./archive/)

Historical documents, past migration logs, and deprecated guides.
