# Fresh Schedules Repository Information

---

description: Repository Information Overview
alwaysApply: true

---

## Fresh Schedules Repository Information (2)

## Repository Summary

Fresh Schedules is a modern, production-ready Progressive Web App (PWA) for staff scheduling built with a pnpm monorepo architecture. It integrates Next.js 16 frontend with Firebase backend services (Authentication, Firestore, Cloud Storage), Turbo for build orchestration, and TypeScript for full type safety. The project emphasizes type-safe API validation with Zod, efficient server state management via React Query, and comprehensive testing coverage across Firestore security rules, unit tests, and end-to-end scenarios using Playwright.

## Repository Structure

The monorepo is organized into four main workspace groups configured in `pnpm-workspace.yaml`:

- **apps/** - Web application (Next.js frontend with React 18, App Router)
- **packages/** - Shared utilities and components (UI library, types, configuration, MCP server)
- **functions/** - Firebase Cloud Functions backend for server-side logic
- **tools/** - Development utilities including authentication simulation and data seeding scripts

### Main Repository Components

- **Package Manager**: pnpm v9.12.0 (configured via corepack for environment consistency)
- **Build Orchestrator**: Turbo for efficient multi-package build pipeline with dependency management
- **Testing Strategy**: Jest for Firebase security rules testing, Vitest for web app unit/component tests, Playwright for E2E testing
- **Backend Services**: Firebase (Authentication, Firestore database, Cloud Storage, Cloud Functions)
- **Code Quality**: ESLint for linting, TypeScript for type safety, Prettier compatibility (implicitly)
- **Styling**: Tailwind CSS with PostCSS pipeline for utilities and animations

## Projects

### Web Application (@apps/web)

**Configuration File**: `apps/web/package.json`
**Entry Points**: `apps/web/app/` (Next.js App Router), `apps/web/src/lib/` (utilities)

#### Language & Runtime

**Language**: TypeScript 5.6.3
**Runtime**: Node.js 20 or higher (enforced via .nvmrc)
**Framework**: Next.js 16.0.0 with App Router and Server Actions
**Package Manager**: pnpm 9.12.0

#### Dependencies

**Main Dependencies**:

- next 16.0.0 (web framework with built-in optimization and deployment)
- react 18.3.1, react-dom 18.3.1 (UI library foundation)
- firebase 10.12.3 (client SDK), firebase-admin 13.5.0 (server SDK), firebaseui 6.0.0 (pre-built UI)
- @tanstack/react-query 5.59.0 (server state, caching, background sync, pagination)
- zustand 4.5.2 (lightweight client state management alternative)
- tailwindcss 3.4.13 (utility-first CSS framework)
- zod 3.24.1 (runtime schema validation for API contracts)
- clsx 2.1.0 (conditional CSS class composition)
- idb 7.1.1 (IndexedDB utilities)

**Development Dependencies**:

- vitest 4.0.3, @vitest/ui 4.0.3, @vitest/coverage-v8 4.0.3 (testing framework)
- @testing-library/react 16.3.0, @testing-library/jest-dom 6.9.1
- eslint 9.38.0, @typescript-eslint packages (code quality and linting)
- autoprefixer 10.4.20, postcss 8.4.47 (CSS processing pipeline)
- happy-dom 20.0.8 (lightweight DOM for testing)

#### Build & Installation

```bash
pnpm install                    # Install all dependencies across workspaces
pnpm dev                        # Start development server on port 3000
pnpm build                      # Build for production
pnpm start -p 3000             # Run production server
pnpm typecheck                  # TypeScript type checking
pnpm lint                       # ESLint linting across files
```

#### Testing

**Framework**: Vitest with React Testing Library and happy-dom environment
**Test Location**: `apps/web/**/*.{spec,test}.{ts,tsx}`
**Configuration**: `apps/web/vitest.config.ts` with React plugin and path aliases
**Run Commands**:

```bash
pnpm --filter @apps/web test          # Run tests once
pnpm --filter @apps/web test:watch    # Watch mode for development
pnpm --filter @apps/web test:ui       # Interactive Vitest UI dashboard
pnpm --filter @apps/web test:coverage # Generate coverage reports
```

### Firebase Functions (@functions/app)

**Configuration File**: `functions/package.json`
**Main Entry**: `functions/src/index.ts`

#### Language & Runtime (2)

**Language**: TypeScript 5.6.3
**Runtime**: Node.js 20+
**Framework**: Firebase Functions v5.0.1 (second-generation Cloud Functions)
**Package Manager**: pnpm 9.12.0

#### Dependencies (2)

**Main Dependencies**:

- firebase-functions 5.0.1 (Cloud Functions SDK)
- firebase-admin 12.6.0 (Admin SDK for Firestore, Auth, Storage operations)

### Shared Packages

#### UI Library (@fresh-schedules/ui)

**Location**: `packages/ui`
**Main Entry**: `packages/ui/src/index.ts`
Reusable React UI components styled with Tailwind CSS and clsx for conditional classes.
**Dependencies**: React 18.3.1, tailwindcss 3.4.13, clsx 2.1.0

#### Types Package (@fresh-schedules/types)

**Location**: `packages/types`
**Build Process**: TypeScript compilation from `packages/types/src` to `packages/types/dist`
Shared TypeScript type definitions and Zod validation schemas for API contracts.
**Build Command**: `tsc -p tsconfig.json`
**Dependencies**: zod 3.23.8

#### Config Package (@fresh-schedules/config)

**Location**: `packages/config`
Centralized configuration utilities and constants shared across packages.

#### MCP Server (@packages/mcp-server)

**Location**: `packages/mcp-server`
**Main Entry**: `packages/mcp-server/src/index.ts`
**Build Output**: `packages/mcp-server/dist/index.js`
Model Context Protocol server implementation for external integrations.
**Dependencies**: fast-glob 3.3.2, jsonrpc-lite 2.2.0, ts-node 10.9.2

## Firebase Backend Configuration

**Firebase Project**: fresh-schedules-dev (defined in `.firebaserc`)

**Local Emulator Configuration** (`firebase.json`):

- Firestore Emulator: port 8080
- Authentication Emulator: port 9099
- Cloud Storage Emulator: port 9199
- Emulator UI: port 4000 (browser-accessible dashboard)

**Security Rules**:

- Firestore: `firestore.rules` (database access control)
- Cloud Storage: `storage.rules` (file access control)

**Rules Testing**:

```bash
pnpm test:rules              # Run Firebase security rules tests
firebase emulators:exec -- "jest --config=jest.rules.config.js"
```

Test files: `tests/rules/*.spec.ts` with 30-second timeout.

## Testing & Quality Assurance

**All Tests**:

```bash
pnpm test  # Sequential: Firebase rules → web app tests
```

**E2E Tests**: Playwright

```bash
pnpm test:e2e  # Located in tests/e2e/*.spec.ts
```

**Type Checking**:

```bash
pnpm typecheck  # Runs tsc across all workspaces
```

## Build Pipeline (Turbo Orchestration)

Configuration: `turbo.json` manages efficient task execution with caching

Task Pipeline:

- lint, typecheck: parallel execution
- test: generates coverage outputs
- build: depends on typecheck and upstream package builds
- e2e: runs after successful build

## Development Workflow

```bash
##  Initial setup
pnpm install
corepack enable

##  Development with local emulators
pnpm dev
firebase emulators:start
export NEXT_PUBLIC_USE_EMULATORS=true

##  Quality checks before commit
pnpm typecheck && pnpm lint && pnpm test

##  Production deployment
pnpm build
firebase deploy
```

## Environment Variables

**Web App** (`.env.local`):

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_USE_EMULATORS` - Enable Firebase emulators (true/false)

## Key Development Patterns

- **API Validation**: Use Zod schemas in `packages/types` and `apps/web/app/api/_shared/validation.ts`
- **Server State**: React Query hooks follow `useXxx` pattern in `apps/web/src/lib`
- **Protected Routes**: Use `ProtectedRoute` components for authentication checks
- **Authentication**: Firebase Auth with multiple providers (Email/Password, Google, Anonymous)
