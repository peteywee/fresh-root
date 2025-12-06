---
**UPDATED**: Restructured for better navigation
**Update Date**: December 6, 2025
**Changes**: Added active/archived separation, improved navigation
---

# Fresh Root Documentation

**Status:** ✅ Production Ready | **Version:** 1.1.0 | **Architecture Cleanup:** December 6, 2025

A production-ready Progressive Web App (PWA) for staff scheduling with enterprise-grade security and reliability.

---

## 🚀 Active Documentation (Use These)

### Getting Started
- [**Quick Start Guide**](./QUICK_START.md) - Setup and development workflow
- [**Coding Rules & Patterns**](./CODING_RULES_AND_PATTERNS.md) - Development standards
- [**Architecture Overview**](./visuals/ARCHITECTURE.md) - System design & topology

### Production
- [**Production Deployment Guide**](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Deployment checklist
- [**Production Readiness KPI**](./PRODUCTION_READINESS_KPI.md) - Quality metrics
- [**Production Environment Validation**](./PRODUCTION_ENV_VALIDATION.md) - Environment setup

### Architecture & Design
- **[Mega Architecture Report (Consolidated)](./mega-book/fresh_root_mega_report_A/)** - L0-L4 hierarchical architecture
  - [L0 — Mission & Non-Negotiables](./mega-book/fresh_root_mega_report_A/01_SYSTEM_L0.md)
  - [L1 — System Architecture](./mega-book/fresh_root_mega_report_A/02_SYSTEM_L1.md) ✨ *Recently enhanced with 9-panel review*
  - [L2 — Subsystems](./mega-book/fresh_root_mega_report_A/03_SUBSYSTEMS_L2/)
  - [L3 — Components](./mega-book/fresh_root_mega_report_A/04_COMPONENTS_L3/)
  - [L4 — Tasks & Deployment](./mega-book/fresh_root_mega_report_A/05_TASKS_L4/)

### Reference & Analysis
- [**Codebase Architectural Index**](./CODEBASE_ARCHITECTURAL_INDEX.md) - Complete infrastructure map
- [**Architectural Review Panel Inputs**](./ARCHITECTURAL_REVIEW_PANEL_INPUTS.md) - 9-panel expert model findings
- [**Error Prevention Patterns**](./ERROR_PREVENTION_PATTERNS.md) - Common pitfalls & safeguards
- [**Firebase Typing Strategy**](./FIREBASE_TYPING_STRATEGY.md) - Type modernization roadmap
- [**Firebase Prompt Workflow**](./FIREBASE_PROMPT_WORKFLOW.md) - AI-assisted development templates

---

## 📦 Archived Documentation (Historical Reference)

**Historical phase reports, migration documents, and development session notes have been archived.**

See [**archive/README.md**](./archive/README.md) for historical reference.

**Archive Date**: December 6, 2025
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
