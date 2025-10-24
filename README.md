# Fresh Schedules

A modern, production-ready Progressive Web App (PWA) for staff scheduling, built with Next.js, Firebase, and a monorepo architecture using pnpm.

## Features

- **Sub-5-minute scheduling**: Streamlined interface for quick staff schedule creation after onboarding
- **PWA-ready**: Installable on mobile and desktop with offline capabilities
- **Firebase integration**: Authentication, Firestore database, and Cloud Storage
- **Monorepo architecture**: Organized with pnpm workspaces for scalable development
- **Type-safe**: Full TypeScript support with Zod validation
- **Modern stack**: Next.js 16, React 18, Tailwind CSS, React Query

## Project Structure

```
fresh-root/
├── apps/
│   └── web/                 # Next.js web application
│       ├── app/             # Next.js app router
│       ├── components/      # Reusable UI components
│       ├── lib/             # Client-side utilities
│       └── public/          # Static assets
├── packages/
│   └── types/               # Shared TypeScript types
├── firebase.json            # Firebase configuration
├── pnpm-workspace.yaml      # Monorepo configuration
└── tsconfig.json           # Root TypeScript config
```

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

1. **Enable pnpm corepack** (if not already enabled):

   ```bash
   corepack enable
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   Create `.env.local` in `apps/web/` with your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**:

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`.

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication, Firestore, and Storage

### 2. Authentication Configuration

1. Go to Authentication > Sign-in method
2. Enable desired providers (Email/Password, Google, etc.)
3. Configure authorized domains (add `localhost` for development)

### 3. Firestore Security Rules

The project includes pre-configured Firestore rules in `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

### 4. Storage Security Rules

Storage rules are configured in `storage.rules`. Deploy them:

```bash
firebase deploy --only storage
```

## Development

### Available Scripts

From the root directory:

```bash
# Start development server
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Linting (placeholder)
pnpm lint
```

### Web App Scripts

From `apps/web/` directory:

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck
```

### Firebase Emulators (Optional)

For local development with emulators:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Start emulators: `firebase emulators:start`
3. The app will automatically connect to emulators when `NEXT_PUBLIC_USE_EMULATORS=true`

## Usage Guide

### Authentication

The app includes Firebase Authentication with multiple providers:

- **Email/Password**: Traditional sign-in
- **Google**: OAuth sign-in
- **Anonymous**: Guest access

Use the `FirebaseSignIn` component to integrate authentication UI.

### API Routes

The app includes example API routes with validation:

- `GET /api/health` - Health check endpoint
- `GET /api/items` - List items (demo)
- `POST /api/items` - Create item with validation

All API routes use Zod schemas for type-safe validation and consistent error responses.

### Protected Routes

Use the `ProtectedRoute` component to guard pages requiring authentication:

```tsx
import ProtectedRoute from "./components/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Data Fetching

The app uses React Query for server state management:

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => apiFetch("/api/items"),
  });

  // Mutations for data changes
  const createItem = useMutation({
    mutationFn: (name: string) =>
      apiFetch("/api/items", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
  });
}
```

### File Upload

The `UploadStub` component provides a basic file input. Extend it with Firebase Storage for production use.

### Shared Types

Import types from the shared package:

```tsx
import type { Role } from "@fresh-schedules/types";
```

## Deployment

### Build

```bash
pnpm build
```

### Firebase Hosting

1. Build the app: `pnpm build`
2. Deploy to Firebase Hosting: `firebase deploy --only hosting`

### Environment Variables

For production, set environment variables in Firebase Console or your hosting platform:

- `NEXT_PUBLIC_FIREBASE_*` - Firebase client config
- `NEXT_PUBLIC_SENTRY_DSN` - Optional error tracking

## Contributing

1. Follow the monorepo structure
2. Use TypeScript for all new code
3. Add Zod schemas for API validation
4. Update this README for significant changes

## Architecture Decisions

- **Monorepo**: pnpm workspaces for shared packages and apps
- **Next.js App Router**: Modern routing with server components
- **Firebase**: Backend-as-a-Service for auth, database, and storage
- **React Query**: Server state management with caching
- **Tailwind CSS**: Utility-first styling
- **Zod**: Runtime type validation
- **TypeScript**: Type safety throughout

## Performance

- Initial JS bundle optimized for fast loading
- React Query caching reduces API calls
- PWA features for offline capability
- Lazy loading for heavy components

## Security

- Firebase security rules protect data access
- Environment variables for sensitive config
- Type-safe API validation prevents malformed requests
- Protected routes prevent unauthorized access

## License

This project is licensed under the terms specified in the LICENSE file.
