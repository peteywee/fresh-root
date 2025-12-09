<<<<<<< HEAD
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
=======
# Fresh Root

**Status:** ✅ Production Ready | **Version:** 1.1.0 | **Last Updated:** November 10, 2025

A production-ready Progressive Web App (PWA) for staff scheduling with enterprise-grade security and reliability.
Built with Next.js, Firebase, and a modern monorepo architecture.

---

## 🎯 Overview

Fresh Root is an enterprise scheduling platform designed for teams that need reliable, secure, and
observable staff management. Built with security-first principles and comprehensive monitoring,
logging, and operational support.

**Key Capabilities:**

- 🔒 Enterprise-grade authentication (session-based + MFA)
- 📊 Production observability (structured logs, error tracking, distributed tracing)
- ⚡ Intuitive scheduling interface for rapid team coordination
- 📱 Progressive Web App with offline support and mobile optimization
- 🔐 Type-safe, fully tested codebase with continuous integration
- 🏗️ Scalable monorepo architecture for team collaboration

---

## � Documentation

For comprehensive information, refer to the **[Documentation Index](./docs/DOCS_INDEX.md)**.

**Quick Links:**

| Topic               | Resource                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Getting Started** | [Setup Guide](./docs/SETUP.md) · [Contributing](./docs/CONTRIBUTING.md)                                                 |
| **Architecture**    | [Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAMS.md) · [Technical Docs](./docs/COMPLETE_TECHNICAL_DOCUMENTATION.md) |
| **Operations**      | [CI Standards](./docs/CI_WORKFLOW_STANDARDS.md) · [Runbooks](./docs/runbooks/)                                          |
| **Security**        | [Security Documentation](./docs/security.md) · [Standards](./docs/REPO_STANDARDS.md)                                    |
| **Development**     | [Full Doc Index](./docs/DOCS_INDEX.md)                                                                                  |

---

## 🏗️ Architecture

Fresh Root follows a monorepo structure with clear separation of concerns:

- **`apps/web/`** — Next.js PWA application with API routes and UI
- **`packages/`** — Shared libraries: types, UI components, testing utilities
- **`services/`** — Microservices and backend integrations
- **`scripts/`** — Operational and development automation
- **`tests/`** — Test suites: rules, E2E, integration tests
- **`docs/`** — Comprehensive documentation and guides

For a complete architecture overview, see [Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAMS.md).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- pnpm (version pinned in `package.json`)
- Firebase CLI
- Git

### Quick Setup

1. **Clone and install:**

   ```bash
   git clone https://github.com/peteywee/fresh-root.git
   cd fresh-root
   pnpm install --frozen-lockfile
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env.local
   # Update with your Firebase configuration
   ```

3. **Start development server:**

   ```bash
   pnpm dev
   ```

4. **Run tests:**

   ```bash
   pnpm test              # Unit tests
   pnpm test:rules        # Firebase rules tests
   pnpm test:e2e          # End-to-end tests
   ```

For detailed setup instructions, see [Setup Guide](./docs/SETUP.md).

---

## 💻 Development Workflow

### Common Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm typecheck          # Type checking across workspaces
pnpm lint               # Lint all code

# Testing
pnpm test               # Run unit tests
pnpm test:rules         # Test Firebase security rules
pnpm test:e2e           # Run E2E tests

# Deployment
pnpm deploy:firebase    # Deploy to Firebase
```

### Branch Strategy

- `main` — Stable release branch (protected)
- `dev` — Active development (protected)
- Feature branches — Create from `dev`, merge via PR

See [Contributing Guide](./docs/CONTRIBUTING.md) for detailed workflow.

---

## 🔒 Security

Fresh Root prioritizes security across all layers:

- **Authentication**: Secure session management with TOTP-based MFA
- **Authorization**: Role-based access control (RBAC) via Firebase rules
- **Data Protection**: Encrypted in transit and at rest
- **API Security**: Rate limiting, CSRF protection, input validation
- **Monitoring**: Comprehensive audit logging and alerting

See [Security Documentation](./docs/security.md) for complete security architecture and best practices.

---

## 📊 Production Operations

The platform includes comprehensive operational support:

- **Structured Logging**: Centralized logging with retention policies
- **Error Tracking**: Real-time error reporting and aggregation
- **Distributed Tracing**: End-to-end request tracing for debugging
- **Automated Backups**: Regular Firestore exports with long-term retention
- **Runbooks**: Documented procedures for common operational tasks

See [Runbooks](./docs/runbooks/) for operational guides.

---

## 🧪 Quality & Testing

Comprehensive test coverage ensures reliability:

- **Unit Tests**: Core logic and utilities (Vitest)
- **API Security Tests**: Authentication, authorization, rate limiting
- **Firebase Rules Tests**: Security rules validation for Firestore/Storage
- **E2E Tests**: User workflows and integrations (Playwright)
- **CI/CD Validation**: Automated testing on every commit

See [CI Workflow Standards](./docs/CI_WORKFLOW_STANDARDS.md) for quality gates.

---

## 🤝 Contributing

We welcome contributions! Please review [Contributing Guidelines](./docs/CONTRIBUTING.md) for:

- Code standards and conventions
- Development setup
- Pull request process
- Testing requirements
- Git workflow

---

## 📋 Project Structure

### Key Directories

```text
fresh-root/
├── apps/web/              # Next.js PWA application
├── packages/              # Shared libraries and types
│   ├── types/            # TypeScript type definitions
│   ├── ui/               # UI component library
│   ├── config/           # Shared configuration
│   └── rules-tests/      # Firebase rules test infrastructure
├── services/             # Microservices and APIs
├── scripts/              # Development and operational automation
├── tests/                # Test suites (rules, E2E)
├── docs/                 # Documentation
├── firestore.rules       # Firestore security rules
├── storage.rules         # Cloud Storage security rules
└── package.json          # Workspace dependencies and scripts
```

For detailed structure, see [Documentation Index](./docs/DOCS_INDEX.md).

---

## 📞 Support & Resources

- **GitHub Issues** - Report bugs or request features
- **Documentation** - Complete guides in [docs/DOCS_INDEX.md](./docs/DOCS_INDEX.md)
- **Contributing** - See [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📄 License

This project is licensed under the terms specified in [LICENSE](./LICENSE).

---

## 🔗 Related Resources

- [Setup Guide](./docs/SETUP.md) - Get started locally
- [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute
- [Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAMS.md) - System overview
- [Security Documentation](./docs/security.md) - Security practices
- [Full Documentation Index](./docs/DOCS_INDEX.md) - All available resources

---

**Last Updated:** November 10, 2025
>>>>>>> pr-128
