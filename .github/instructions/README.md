# GitHub Copilot Instructions

This directory contains specialized instruction files that guide AI coding agents (GitHub Copilot, Claude Code, etc.) when working on the Fresh Schedules codebase.

---

## Primary Instructions

**[copilot-instructions.md](./copilot-instructions.md)** ⭐ **START HERE**

Comprehensive guide for AI agents working on the codebase. Covers:

- Quick start & essential context
- Architecture overview
- SDK Factory pattern (current standard)
- Type safety & validation
- Authentication & authorization
- Security patterns
- Data layer & Firebase
- Testing patterns
- Development workflows
- Hard rules (must follow)
- Common patterns & examples
- File organization
- Troubleshooting & quick reference

---

## Specialized Instructions by Domain

### AI Safety & Prompt Engineering

- **[ai-prompt-engineering-safety-best-practices.instructions.md](./ai-prompt-engineering-safety-best-practices.instructions.md)**
  - Comprehensive AI safety frameworks
  - Bias mitigation strategies
  - Responsible AI usage patterns

### Code Review

- **[code-review-generic.instructions.md](./code-review-generic.instructions.md)**
  - Generic code review guidelines
  - Quality standards across all domains
  - Review priorities & principles

### Framework-Specific

#### TypeScript & ES2022

- **[typescript-5-es2022.instructions.md](./typescript-5-es2022.instructions.md)**
  - TypeScript 5.x standards
  - ES2022 output targets
  - Type safety best practices

#### Next.js & Tailwind

- **[nextjs-tailwind.instructions.md](./nextjs-tailwind.instructions.md)**
  - Next.js + Tailwind development
  - Component patterns
  - CSS integration

- **[nextjs.instructions.md](./nextjs.instructions.md)**
  - Core Next.js patterns
  - App Router standards
  - API route best practices

#### Firebase & Data Layer

- **[firebase-typing-and-monorepo-memory.instructions.md](./firebase-typing-and-monorepo-memory.instructions.md)**
  - Firebase SDK v12 typing strategy
  - Monorepo dependency resolution
  - Memory management patterns

### Quality & Testing

#### Testing Frameworks

- **[playwright-typescript.instructions.md](./playwright-typescript.instructions.md)**
  - Playwright test generation
  - TypeScript testing best practices
  - Test structure & assertions

#### Security & OWASP

- **[security-and-owasp.instructions.md](./security-and-owasp.instructions.md)**
  - OWASP Top 10 compliance
  - Secure coding practices
  - All languages/frameworks

#### Performance

- **[performance-optimization.instructions.md](./performance-optimization.instructions.md)**
  - Frontend, backend, database optimization
  - Performance budgets
  - Measurement & profiling
  - Pro tips & troubleshooting

#### Object-Oriented Design

- **[object-calisthenics.instructions.md](./object-calisthenics.instructions.md)**
  - Object Calisthenics principles
  - Business domain code standards
  - Clean code enforcement

### Operations & Deployment

#### CI/CD

- **[github-actions-ci-cd-best-practices.instructions.md](./github-actions-ci-cd-best-practices.instructions.md)**
  - GitHub Actions workflows
  - CI/CD pipeline standards
  - Deployment automation

#### pnpm & Package Management

- **[pnpm-enforcement.instructions.md](./pnpm-enforcement.instructions.md)** (if exists)
  - pnpm-only policy
  - Monorepo structure
  - Dependency management

### Development Philosophy

#### Self-Explanatory Code

- **[self-explanatory-code-commenting.instructions.md](./self-explanatory-code-commenting.instructions.md)**
  - Commenting guidelines
  - Self-documenting code principles
  - When to comment (and when not to)

#### Production-Grade Standards

- **[production-development-directive.instructions.md](./production-development-directive.instructions.md)**
  - Hierarchical thinking
  - Tool usage (proactive, not reactive)
  - TODO list discipline
  - Concurrent execution strategies
  - Error pattern detection
  - Production code standards
  - Validation & verification
  - Decision framework

#### Copilot Taming

- **[taming-copilot.instructions.md](./taming-copilot.instructions.md)**
  - Core directives & hierarchy
  - Code on request only
  - Minimalist generation
  - Surgical code modification
  - Intelligent tool usage

---

## Cross-References to Documentation

For runtime documentation, see:

- **[/docs/README.md](../../docs/README.md)** - Documentation entry point with decision tree
- **[/docs/QUICK_START.md](../../docs/QUICK_START.md)** - Getting started guide
- **[/docs/CODING_RULES_AND_PATTERNS.md](../../docs/CODING_RULES_AND_PATTERNS.md)** - Canonical rules & patterns
- **[/docs/PRODUCTION_READINESS.md](../../docs/PRODUCTION_READINESS.md)** - Production verification
- **[/docs/PRODUCTION_DEPLOYMENT_GUIDE.md](../../docs/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Deployment steps

---

## How to Use These Instructions

### For GitHub Copilot

These files are automatically picked up by GitHub Copilot when working in this repository. Place custom instructions at the repository root or `.github/copilot-instructions.md` for highest priority.

### For Other AI Agents

Reference the appropriate instruction file based on your task:

1. Start with **copilot-instructions.md** for general guidance
2. Add domain-specific files for your particular work
3. Cross-reference with `/docs/` for runtime documentation

### For Code Review

Use **code-review-generic.instructions.md** as the standard checklist for all PRs.

### For New Developers

1. Read **copilot-instructions.md** (5-10 min overview)
2. Follow **QUICK_START.md** in /docs/ (environment setup)
3. Review **CODING_RULES_AND_PATTERNS.md** before first commit
4. Reference **production-development-directive.instructions.md** for operational standards

---

## Instruction File Governance

**Last Updated:** December 6, 2025  
**Total Files:** 14 active instruction files  
**Coverage:** All major domains (AI, security, testing, performance, operations, development philosophy)

**Principles:**

- Each file is purpose-focused and domain-specific
- No duplication across files (each instruction file is a single source of truth)
- Clear cross-references between related files
- Regular updates aligned with codebase changes (Phase 2: consolidated for clarity)

---

## Questions or Feedback

For updates to these instructions, see:

- **Code changes:** Reference the codebase and instruction files during PR review
- **Pattern updates:** Update `copilot-instructions.md` first, then domain files
- **New domains:** Create new instruction file following the naming convention
