# Fresh Schedules Web App

The main web application for Fresh Schedules, built with Next.js 16 and React 18.

## Architecture: Server-First

This application follows a **server-first architecture**:

- **Data access occurs in server components or server actions** - No direct Firestore client writes for privileged operations
- **Client components call server actions** - Minimal client-side logic for data mutations
- **RBAC enforced server-side** - Firestore rules are a backstop, not the primary control
- **Server-side caching with ISR** - Improved performance with tag-based invalidation for targeted revalidation

### Why Server-First

1. **Security**: Sensitive operations happen on the server where credentials are secure
1. **Performance**: Server-side caching and ISR reduce client load times
1. **Consistency**: Single source of truth for business logic
1. **Maintainability**: Easier to update and test server logic vs. distributed client code

### Key Patterns

- Use Next.js Server Components for data fetching
- Implement Server Actions for mutations (create, update, delete)
- Apply ISR with `revalidateTag()` for cache invalidation after writes
- Reserve client components for interactivity (forms, buttons, client-side state)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 18.3.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: HTML5 with custom components
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Cloud Storage
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint

## Project Structure

```text
apps/web/
├── app/                    # Next.js App Router
│   ├── (app)/             # App routes (authenticated)
│   │   ├── protected/     # Protected page example
│   │   └── demo/          # Component demo page
│   ├── api/               # API routes
│   │   ├── _shared/       # Shared API utilities
│   │   ├── health/        # Health check endpoint
│   │   ├── items/         # Demo items endpoint
│   │   ├── users/         # User endpoints
│   │   └── organizations/ # Organization endpoints
│   ├── components/        # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── FirebaseSignIn.tsx
│   │   └── ProtectedRoute.tsx
│   ├── lib/               # Utilities and helpers
│   │   ├── auth-context.tsx
│   │   ├── firebaseClient.ts
│   │   ├── http.ts
│   │   └── useCreateItem.ts
│   ├── providers/         # React context providers
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── src/                   # Legacy structure (migrating)
│   ├── components/
│   └── lib/
├── public/                # Static assets
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   └── COMPONENTS.md     # Component documentation
├── middleware.ts          # Next.js middleware (security headers)
├── vitest.config.ts       # Vitest configuration
├── eslint.config.mjs      # ESLint configuration
├── tailwind.config.ts     # Tailwind configuration
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
# From repository root
pnpm install

# Or from this directory
cd apps/web
pnpm install
```

### Environment Variables

Create `.env.local` in this directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Available Routes

### Public Routes

- `/` - Home page
- `/demo` - Component showcase

### Protected Routes

- `/protected` - Example protected page (requires auth)

### API Routes

See [API Documentation](docs/API.md) for details.

- `GET /api/health` - Health check
- `GET /api/items` - List items
- `POST /api/items` - Create item
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/[id]` - Get organization
- `PATCH /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization

## UI Components

Reusable components are located in `app/components/ui/`:

- **Button** - Versatile button with variants and sizes
- **Card** - Container for content
- **Input** - Text input with label and validation
- **Textarea** - Multi-line text input
- **Loading** - Loading indicators
- **Spinner** - Loading spinner
- **Alert** - Alert messages

See [Component Documentation](docs/COMPONENTS.md) for usage examples.

## Testing

### Unit Tests

```bash
pnpm test
```

Tests are located next to the files they test in `__tests__/` directories.

### Test Coverage

```bash
pnpm test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Writing Tests

Example test structure:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Styling

### Tailwind CSS

The app uses Tailwind CSS for styling. Customize the theme in `tailwind.config.ts`.

### Global Styles

Global CSS is defined in `app/globals.css`.

### Component Styles

Components use Tailwind utility classes. For custom styles, use the `clsx` utility:

```tsx
import { clsx } from 'clsx'

<div className={clsx(
  'base-class',
  isActive && 'active-class',
  isPrimary && 'primary-class'
)}>
```

## State Management

### Zustand

Global state is managed with Zustand. Example store:

```tsx
import { create } from "zustand";

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### React Query

Server state is managed with React Query:

```tsx
import { useQuery } from "@tanstack/react-query";

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: () => fetch("/api/items").then((r) => r.json()),
  });
}
```

## Authentication

Firebase Authentication is used for user management. The app includes:

- Email/Password sign-in
- Google OAuth
- Anonymous authentication
- Protected route wrapper

Example:

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## API Development

### Creating API Routes

```tsx
// app/api/my-endpoint/route.ts
import { NextRequest } from "next/server";
import { ok, badRequest } from "../_shared/validation";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = await parseJson(request, Schema);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.details);
  }

  return ok({ success: true, data: parsed.data });
}
```

### Validation

All API routes use Zod for validation:

```tsx
import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().positive(),
  role: z.enum(["admin", "user"]),
});
```

## Security

### Security Headers

Security headers are added via middleware (see `middleware.ts`):

- X-Frame-Options
- X-Content-Type-Options
- Content-Security-Policy
- Referrer-Policy
- Permissions-Policy

### Input Validation

All user input is validated with Zod schemas.

### Authentication

Protected routes require valid Firebase authentication.

## Deployment

### Building

```bash
pnpm build
```

### Environment Variables

Set production environment variables in your hosting platform.

### Firebase Hosting

```bash
firebase deploy --only hosting
```

### Vercel

The app is optimized for Vercel deployment. Connect your repository to Vercel for automatic deployments.

## Performance

- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Use Next.js `<Image>` component
- **Bundle Analysis**: Run `pnpm build` to see bundle sizes
- **Caching**: React Query handles caching automatically

## Debugging

### Development Tools

- React Query Devtools - Enabled in development
- Next.js Fast Refresh - Automatic during development

### Logging

```tsx
// Use console methods allowed by ESLint
console.warn("Warning message");
console.error("Error message");
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repository root.

## Documentation

- [Setup Guide](../../SETUP.md)
- [Usage Guide](../../USAGE.md)
- [API Documentation](docs/API.md)
- [Component Documentation](docs/COMPONENTS.md)
- [Contributing Guide](../../CONTRIBUTING.md)

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### TypeScript Errors

```bash
# Run type checker
pnpm typecheck
```

### Test Failures

```bash
# Run tests with verbose output
pnpm test --reporter=verbose
```

## License

See [LICENSE](../../LICENSE) in the repository root.
