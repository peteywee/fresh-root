---

title: "Documentation"
description: "Entry points and navigation for the documentation set"
keywords:

- documentation
- index
- onboarding
- navigation
category: "reference"
status: "active"
audience:
- developers
- operators
- stakeholders
- ai-agents
related-docs:
	- INDEX.md
	- PROJECT_OVERVIEW.md
	- guides/ONBOARDING.md

createdAt: "2026-01-31T00:00:00Z"
lastUpdated: "2026-01-31T00:00:00Z"

---

# Documentation

Start with the [Project Overview](./PROJECT_OVERVIEW.md) and the
[Onboarding Guide](./guides/ONBOARDING.md). For full navigation, use
[Documentation Index](./INDEX.md).

## Quick entry points

- [Project Overview](./PROJECT_OVERVIEW.md)
- [Onboarding Guide](./guides/ONBOARDING.md)
- [Guides](./guides/README.md)
- [Standards](./standards/README.md)
- [Reference](./reference/README.md)
- [Archived Docs](./archived/README.md)

## Contributor note

Keep READMEs focused on purpose and entry points. Avoid exhaustive inventories or change logs. pnpm
lint # Lint all code

# Testing

pnpm test # Run unit tests pnpm test:rules # Test Firebase security rules pnpm test:e2e # Run E2E
tests

# Deployment

pnpm deploy:firebase # Deploy to Firebase

````

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

See [Security Documentation](./docs/security.md) for complete security architecture and best
practices.

---

## 📊 Production Operations
The platform includes comprehensive operational support:

- **Structured Logging**: Centralized logging with retention policies
- **Error Tracking**: Real-time error reporting and aggregation
- **Distributed Tracing**: End-to-end request tracing for debugging
- **Automated Backups**: Regular Firestore exports with long-term retention
- **Runbooks**: Documented procedures for common operational tasks

See [Production Docs](./production/README.md) for operational guides.

---

## 🧪 Quality & Testing
Comprehensive test coverage ensures reliability:

- **Unit Tests**: Core logic and utilities (Vitest)
- **API Security Tests**: Authentication, authorization, rate limiting
- **Firebase Rules Tests**: Security rules validation for Firestore/Storage
- **E2E Tests**: User workflows and integrations (Playwright)
- **CI/CD Validation**: Automated testing on every commit

See [Automation & CI](./visuals/AUTOMATION_AND_CI.md) for quality gates and automation guidance.

---

## 🤝 Contributing
We welcome contributions! Please review [Standards Overview](./standards/README.md) and
[Guides Index](./guides/README.md) for:

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
````

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
