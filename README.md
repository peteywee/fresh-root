# Fresh Root

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Released:** November 6, 2025

A production-ready Progressive Web App (PWA) for staff scheduling with enterprise-grade security and reliability.
Built with Next.js, Firebase, and a monorepo architecture.

> **🎉 v1.0.0 Release - Blocks 1 & 2 Complete**
>
> - ✅ **Security Core**: Session auth, MFA, security middleware, comprehensive tests
> - ✅ **Reliability Core**: Winston logging, Sentry monitoring, OpenTelemetry, automated backups
> - ✅ **Code Quality**: Zero `any` types, zero console violations, technical debt tracking

## 🚀 What's New in v1.0.0

### Block 1: Security Core (9/9 Complete)

- **Session Authentication**: Secure cookie-based sessions with HttpOnly, Secure, SameSite
- **Multi-Factor Authentication**: TOTP-based MFA endpoints (`/api/auth/mfa/setup`, `/api/auth/mfa/verify`)
- **Security Middleware**: Rate limiting, CSRF protection, security headers
- **Comprehensive Tests**: 250+ lines of security test coverage

### Block 2: Reliability Core (10/10 Complete)

- **Structured Logging**: Winston logger with log levels, metadata, retention policies
- **Error Tracking**: Sentry integration (client, server, edge) with source maps
- **Observability**: OpenTelemetry instrumentation with distributed tracing
- **Automated Backups**: Cloud Scheduler + Firestore exports with retention
- **Production Runbooks**: Operational procedures for logging, backups, uptime monitoring

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

| Resource | Description |
| -------- | ----------- |
| 📖 **[Complete Technical Docs](./docs/COMPLETE_TECHNICAL_DOCUMENTATION.md)** | Architecture, setup, troubleshooting |
| 🏗️ **[Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAMS.md)** | System diagrams (data flow, CI/CD, auth) |
| 🔒 **[Security Documentation](./docs/security.md)** | Security architecture, MFA, session management |
| � **[SLO Summary](./docs/BLOCK1_SLO_SUMMARY.md)** | Service Level Objectives for Blocks 1 & 2 |
| 📈 **[Progress Tracking](./docs/BLOCK1_BLOCK2_PROGRESS.md)** | Detailed Block 1 & 2 implementation status |
| 🛠️ **[Technical Debt](./docs/TECHNICAL_DEBT.md)** | Current debt tracking (minimal) |
| 📘 **[Runbooks](./docs/runbooks/)** | Operations guides (logging, backups, uptime) |
| ⚙️ **[Setup Guide](./docs/SETUP.md)** | Step-by-step setup instructions |

## 🏗️ Project Structure

```text
fresh-root/
├── apps/
│   └── web/                     # Next.js PWA application
│       ├── app/
│       │   ├── api/             # API routes with security middleware
│       │   │   ├── _shared/     # Middleware, security, validation
│       │   │   ├── auth/mfa/    # MFA setup/verify endpoints
│       │   │   ├── internal/    # Backup endpoint
│       │   │   └── metrics/     # Metrics endpoint
│       │   ├── (app)/           # Protected app pages
│       │   ├── (auth)/          # Authentication pages
│       │   └── components/      # UI components
│       ├── src/
│       │   ├── lib/             # Logger, OTel, error reporting
│       │   └── __tests__/       # Security, MFA, session tests
│       ├── instrumentation.ts   # OpenTelemetry setup
│       └── sentry.*.config.ts   # Sentry configs (client, server, edge)
├── packages/
│   ├── types/                   # Shared TypeScript types
│   ├── ui/                      # UI component library
│   ├── rules-tests/             # Firebase rules testing
│   └── config/                  # Shared configs
├── services/
│   └── api/                     # Dockerized API service
│       ├── src/
│       │   ├── mw/              # Security, session, logger middleware
│       │   └── obs/             # Observability (logs, OTel, Sentry)
│       └── test/                # Security and RBAC tests
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

1. **Clone and install**:

   ```bash
   git clone https://github.com/peteywee/fresh-root.git
   cd fresh-root
   pnpm install --frozen-lockfile
   ```

1. **Configure environment**:

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

1. **Start development server**:

   ```bash
   pnpm dev
   ```

   `Open<http://localhost:3000>`

## 🛠️ Development

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

# Firebase
firebase emulators:start        # Start Firebase emulators
firebase deploy --only hosting  # Deploy to Firebase Hosting
firebase deploy --only firestore:rules  # Deploy Firestore rules
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

### VS Code Tasks

Use the Command Palette (`Ctrl+Shift+P`) to run tasks:

- **Typecheck** - Type checking across all workspaces
- **Lint** - ESLint with auto-fix
- **Build (all)** - Build all packages
- **Test Rules** - Firebase security rules tests
- **Deps: Check** - Verify no deprecated/unmet peer dependencies
- **Docs: Markdown Fix** - Auto-fix markdown lint errors
- **Tag: Auto-tag Files** - Add file header tags

### CI/CD Pipeline

Every push/PR triggers automated checks:

- ✅ **TypeScript** - Type checking across all workspaces
- ✅ **ESLint** - Linting with auto-fix where possible
- ✅ **Tests** - Unit tests, API tests, Firebase rules tests
- ✅ **Docker Build** - API service container build
- ✅ **CodeQL** - Security vulnerability scanning

See [`.github/workflows/`](./.github/workflows/) for workflow configurations.

## 🔐 Security

### Authentication & Authorization

- **Firebase Authentication** - Email/password, Google OAuth, anonymous auth
- **Session Management** - Secure HTTP-only cookies with SameSite protection
- **Multi-Factor Authentication** - TOTP-based MFA for enhanced security
- **Role-Based Access Control** - Firestore security rules enforce permissions

### API Security

- **Request Validation** - Zod schemas validate all API inputs
- **Rate Limiting** - Protect against abuse and DoS attacks
- **CSRF Protection** - Token-based CSRF validation
- **Security Headers** - CSP, HSTS, X-Frame-Options, etc.
- **Input Sanitization** - Prevent XSS and injection attacks

### Security Middleware Stack

```typescript
// apps/web/app/api/_shared/middleware.ts
- Session validation (verify auth tokens)
- Rate limiting (100 requests/15 min per IP)
- CSRF token validation
- Security headers injection
```

See [docs/security.md](./docs/security.md) for complete security documentation.

## 📊 Observability

### Logging

- **Winston Logger** - Structured logging with levels (error, warn, info, debug)
- **Log Metadata** - Request IDs, user IDs, timestamps, context
- **Retention Policy** - 30-day retention with archival to Cloud Storage

### Error Tracking

- **Sentry Integration**:
  - Client-side error tracking with breadcrumbs
  - Server-side exception monitoring
  - Edge runtime error capture
  - Source maps for readable stack traces

### Metrics & Tracing

- **OpenTelemetry** - Distributed tracing across services
- **Custom Metrics** - Business and performance metrics via `/api/metrics`
- **Health Checks** - `/api/health` endpoint for uptime monitoring

### Production Runbooks

Operational guides in [`docs/runbooks/`](./docs/runbooks/):

- **Logging & Retention** - Log management and analysis
- **Backup & Restore** - Automated backups and recovery procedures
- **Uptime Monitoring** - Cloud Monitoring alerts and response

## 🧪 Testing

### Test Structure

```bash
apps/web/src/__tests__/       # Unit tests (security, MFA, session, middleware)
tests/rules/                  # Firebase security rules tests (Firestore, Storage, MFA)
tests/e2e/                    # Playwright end-to-end tests
services/api/test/            # API service tests (security, RBAC, logging)
```

### Running Tests

```bash
# All unit tests
pnpm test

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage

# Firebase rules tests (requires emulators)
pnpm test:rules

# E2E tests
pnpm test:e2e
```

### Test Coverage

- **Security**: Session validation, MFA setup/verify, CSRF protection, rate limiting
- **API Routes**: Input validation, error handling, middleware execution
- **Firebase Rules**: RBAC permissions, MFA document access, storage permissions
- **Integration**: Auth flows, protected routes, data fetching

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**:
   - Set all `NEXT_PUBLIC_FIREBASE_*` vars
   - Configure `SENTRY_DSN` and `SENTRY_AUTH_TOKEN`
   - Set OpenTelemetry collector endpoint (if using)

1. **Build & Test**:

   ```bash
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```

1. **Deploy Firebase Rules**:

   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

1. **Deploy Application**:

   ```bash
   # Firebase Hosting
   firebase deploy --only hosting
   
   # Or Vercel
   vercel deploy --prod
   ```

1. **Operational Setup**:
   - Run `scripts/ops/logging-setup.sh` for log sinks
   - Run `scripts/ops/create-backup-scheduler.sh` for automated backups
   - Run `scripts/ops/create-uptime-check.sh` for monitoring

### Environment Variables

**Required for Production:**

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Optional: OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=
```

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

### Data Flow

```text
User Request
  → Next.js Middleware (auth check)
  → API Route Handler
  → Security Middleware (rate limit, CSRF, headers)
  → Zod Validation
  → Business Logic
  → Firebase (Firestore/Storage)
  → Security Rules (RBAC enforcement)
  → Response with logging/metrics
```

See [docs/ARCHITECTURE_DIAGRAMS.md](./docs/ARCHITECTURE_DIAGRAMS.md) for visual diagrams.

## 📦 Packages

### Workspaces

- **`apps/web`** - Next.js PWA application (main)
- **`packages/types`** - Shared TypeScript types (Role, User, Schedule, Org)
- **`packages/ui`** - UI component library (Button, Card, Input, Modal)
- **`packages/config`** - Shared configs (ESLint, TypeScript)
- **`packages/rules-tests`** - Firebase rules testing utilities
- **`services/api`** - Dockerized API service (optional)

### Adding a New Package

```bash
# Create package structure
mkdir -p packages/my-package/src
cd packages/my-package

# Initialize package.json
pnpm init

# Add to workspace dependencies
cd ../..
pnpm install
```

## 🤝 Contributing

### Development Workflow

1. **Fork and clone** the repository
1. **Create a branch**: `git checkout -b feature/my-feature`
1. **Make changes** and add tests
1. **Run quality checks**:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

1. **Commit** with conventional commits format
1. **Push** and create a Pull Request

### Code Standards

- **TypeScript**: Strict mode, no `any` types allowed
- **Validation**: Use Zod for all API input validation
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update docs for significant changes
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Pre-commit Hooks

Husky runs these checks before each commit:

1. File tagging script (adds header tags)
1. ESLint with auto-fix
1. Prettier formatting

### Quality Gates

All PRs must pass:

- ✅ TypeScript compilation
- ✅ ESLint (max 200 warnings)
- ✅ All tests passing
- ✅ No deprecated dependencies
- ✅ No unmet peer dependencies

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

**Build failures:**

```bash
# Clean build artifacts
pnpm clean  # if script exists
rm -rf .next apps/web/.next dist
pnpm build
```

### Getting Help

- 📖 **Documentation**: Check [`docs/`](./docs/) for detailed guides
- 🐛 **Issues**: Open an issue on GitHub for bugs
- 💬 **Discussions**: Use GitHub Discussions for questions

## 🗺️ Roadmap

### Completed (v1.0.0)

- ✅ Block 1: Security Core (session auth, MFA, security middleware)
- ✅ Block 2: Reliability Core (logging, Sentry, OTel, backups)
- ✅ Code Quality: Zero `any` types, zero console violations

### Upcoming

- 📅 **Block 3**: Data Foundation (Zod + Firestore rules matrix)
- 📅 **Block 4**: Backup & Restore (automated recovery testing)
- 📅 **Block 5**: Rules Testing (comprehensive security coverage)
- 📅 **Block 6**: Design System (component library standardization)
- 📅 **Block 7**: Scheduler UX (week grid interface)
- 📅 **Block 8**: E2E Testing (happy path coverage)
- 📅 **Block 9**: Blue-Green Deployment (zero-downtime releases)

See [docs/TODO-v13.md](./docs/TODO-v13.md) for detailed roadmap.

---

**Built with ❤️ by the Fresh Root team** | [GitHub](https://github.com/peteywee/fresh-root) | v1.0.0
