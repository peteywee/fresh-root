# Fresh Schedules

**Status:** ✅ Production Ready | **Version:** 1.1.0 | **Released:** November 7, 2025

A production-ready Progressive Web App (PWA) for staff scheduling with enterprise-grade security and reliability.
Built with Next.js, Firebase, and a monorepo architecture.

## ✨ Core Features

- **🔒 Enterprise Security**: Session auth, MFA, security middleware, RBAC with Firestore rules
- **📊 Production Observability**: Structured logging, error tracking, distributed tracing, metrics
- **⚡ Sub-5-minute Scheduling**: Streamlined staff schedule creation interface
- **📱 Progressive Web App**: Installable, offline-capable, mobile and desktop ready
- **🏗️ Monorepo Architecture**: pnpm workspaces, shared types, organized codebase
- **🔐 Type-Safe**: Full TypeScript, Zod validation, zero `any` types
- **🧪 Tested**: Unit tests, API security tests, Firebase rules tests, E2E tests
- **🔄 CI/CD**: Automated testing, linting, security scanning via GitHub Actions

## 📚 Documentation

| Resource                                                                     | Description                                    |
| ---------------------------------------------------------------------------- | ---------------------------------------------- |
| 📖 **[Complete Technical Docs](./docs/COMPLETE_TECHNICAL_DOCUMENTATION.md)** | Architecture, setup, troubleshooting           |
| 🏗️ **[Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAMS.md)**              | System diagrams (data flow, CI/CD, auth)       |
| 🔒 **[Security Documentation](./docs/security.md)**                          | Security architecture, MFA, session management |
| 📊 **[SLO Summary](./docs/BLOCK1_SLO_SUMMARY.md)**                           | Service Level Objectives for Blocks 1–2        |
| 📈 **[Progress Tracking](./docs/BLOCK1_BLOCK2_PROGRESS.md)**                 | Detailed Block 1–2 implementation status       |
| 🧩 **[Block 3 Implementation](./docs/BLOCK3_IMPLEMENTATION.md)**             | Integrity Core summary and rules matrix        |
| 🤖 **[CI Workflow Standards](./docs/CI_WORKFLOW_STANDARDS.md)**              | Canonical workflow template and quality gates  |
| 📏 **[Repo Standards](./docs/REPO_STANDARDS.md)**                            | Required tooling, versions, and policies       |
| 🧰 **[Runbooks](./docs/runbooks/)**                                          | Operations guides (logging, backups, uptime)   |
| ⚙️ **[Setup Guide](./docs/SETUP.md)**                                        | Step-by-step local setup                       |
| 📦 **[Service Worker & PWA](./apps/web/docs/SERVICE_WORKER.md)**             | PWA/service worker notes for the app           |

## 🏗️ Project Structure

```text
fresh-root/
├── apps/
│   ├── web/                     # Next.js PWA application
│   └── server/                  # Standalone Node.js server (optional)
├── packages/
│   ├── types/                   # Shared TypeScript types
│   ├── ui/                      # UI component library
│   ├── rules-tests/             # Firebase rules testing
│   └── config/                  # Shared configs
├── services/
│   └── api/                     # Dockerized API service
├── scripts/
│   └── ops/                     # Operational scripts (backups, uptime)
├── tests/
│   ├── e2e/                     # Playwright E2E tests
│   └── rules/                   # Firebase security rules tests (MFA)
├── docs/                        # Comprehensive documentation
├── .github/workflows/           # CI/CD pipelines
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules (RBAC)
└── storage.rules                # Storage security rules
```

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 20.10.0
- **pnpm** >= 9.1.0 (managed via corepack)
- **Git** >= 2.20
- **Firebase CLI** (for deployment): `npm install -g firebase-tools`

### Installation

1. **Enable pnpm**:

   ```bash
   corepack enable
   ```

2. **Clone and install**:

   ```bash
   git clone https://github.com/peteywee/fresh-root.git
   cd fresh-root
   pnpm install --frozen-lockfile
   ```

3. **Configure environment**:

   Create `apps/web/.env.local`:

   ```env
   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Development (optional)
   NEXT_PUBLIC_USE_EMULATORS=false

   # Observability (production)
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   SENTRY_AUTH_TOKEN=your_sentry_auth_token
   ```

4. **Start development server**:

   ```bash
   pnpm dev
   ```

   Open <http://localhost:3000>

## 🛠️ Development & Testing

### Available Scripts

```bash
# Development
pnpm dev              # Start Next.js dev server (port 3000)
pnpm build            # Build all packages for production
pnpm start            # Start production server

# Quality Checks
pnpm typecheck        # Run TypeScript compiler checks
pnpm lint             # Run ESLint (auto-fix enabled)
pnpm format           # Run Prettier formatting

# Testing
pnpm test             # Run Vitest unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
pnpm test:rules       # Run Firebase security rules tests
pnpm test:e2e         # Run Playwright E2E tests
```

### Development with Emulators

For local development with Firebase emulators:

```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Set env var and start app
export NEXT_PUBLIC_USE_EMULATORS=true
pnpm dev
```

The app will automatically connect to:

- Auth Emulator: `localhost:9099`
- Firestore Emulator: `localhost:8080`
- Storage Emulator: `localhost:9199`

### CI/CD Pipeline

Every push/PR triggers automated checks:

- ✅ **TypeScript** - Type checking across all workspaces
- ✅ **ESLint** - Linting with auto-fix where possible
- ✅ **Tests** - Unit tests, API tests, Firebase rules tests
- ✅ **Docker Build** - API service container build
- ✅ **CodeQL** - Security vulnerability scanning

See [`.github/workflows/`](./.github/workflows/) for workflow configurations.

## 🏛️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **State Management**: React Query (TanStack Query)
- **Validation**: Zod schemas for type-safe runtime validation
- **Logging**: Winston (structured logging)
- **Monitoring**: Sentry (error tracking), OpenTelemetry (tracing)
- **Testing**: Vitest, Playwright, Firebase Emulator Suite
- **CI/CD**: GitHub Actions
- **Package Manager**: pnpm (monorepo with workspaces)

### Key Design Decisions

- **Monorepo**: Shared types, UI components, and configs across apps/packages
- **Type Safety**: Zero `any` types, Zod validation, TypeScript strict mode
- **Security First**: Middleware stack, MFA, RBAC, security tests
- **Observability**: Structured logging, distributed tracing, error tracking
- **Progressive Enhancement**: PWA features, offline capability, installable

See [docs/ARCHITECTURE_DIAGRAMS.md](./docs/ARCHITECTURE_DIAGRAMS.md) for visual diagrams.

## 🤝 Contributing

### Development Workflow

1. **Fork and clone** the repository
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Make changes** and add tests
4. **Run quality checks**:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

5. **Commit** with conventional commits format
6. **Push** and create a Pull Request

### Code Standards

- **TypeScript**: Strict mode, no `any` types allowed
- **Validation**: Use Zod for all API input validation
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update docs for significant changes
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

## 🆘 Support & Troubleshooting

### Common Issues

**Emulator connection errors:**

- Ensure `NEXT_PUBLIC_USE_EMULATORS=true` is set
- Verify emulators are running: `firebase emulators:start`
- Check firewall/network settings

**Type errors after updates:**

```bash
pnpm install
pnpm typecheck
# If issues persist, delete node_modules and reinstall
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install --frozen-lockfile
```

### Getting Help

- 📖 **Documentation**: Check [`docs/`](./docs/) for detailed guides
- 🐛 **Issues**: Open an issue on GitHub for bugs
- 💬 **Discussions**: Use GitHub Discussions for questions

---

**Built with ❤️ by the Fresh Root team** | [GitHub](https://github.com/peteywee/fresh-root) | v1.1.0
