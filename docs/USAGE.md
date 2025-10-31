# Usage Guide

This guide explains how to use the Fresh Schedules application, including authentication, data management, and development patterns.

## Application Overview

Fresh Schedules is a PWA for staff scheduling with the following key features:

- **Authentication**: Firebase Auth with multiple providers
- **Data Management**: Firestore for real-time data
- **File Storage**: Firebase Storage for uploads
- **Offline Support**: PWA capabilities
- **Type Safety**: Full TypeScript with Zod validation

## Authentication

### Sign-In Methods

The app supports multiple authentication methods:

#### Email/Password

```tsx
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
await signInWithEmailAndPassword(auth, email, password);
```

#### Google Sign-In

```tsx
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
```

#### Anonymous Sign-In

```tsx
import { signInAnonymously } from "firebase/auth";

await signInAnonymously(auth);
```

### Using FirebaseSignIn Component

The app includes a pre-built authentication component:

```tsx
import FirebaseSignIn from "./components/FirebaseSignIn";

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <FirebaseSignIn />
    </div>
  );
}
```

### Protected Routes

Guard routes that require authentication:

```tsx
import ProtectedRoute from "./components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Dashboard content</div>
    </ProtectedRoute>
  );
}
```

## Data Management

### Firestore Operations

#### Reading Data

```tsx
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();
const docRef = doc(db, "collection", "documentId");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  console.log(docSnap.data());
}
```

#### Writing Data

```tsx
import { setDoc } from "firebase/firestore";

await setDoc(doc(db, "collection", "documentId"), {
  field: "value",
  timestamp: new Date(),
});
```

#### Real-time Listeners

```tsx
import { onSnapshot, collection } from "firebase/firestore";

const unsubscribe = onSnapshot(collection(db, "collection"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      console.log("New document:", change.doc.data());
    }
  });
});
```

### React Query Integration

The app uses React Query for client-side data management:

#### Queries

```tsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./lib/http";

function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: () => apiFetch("/api/items"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### Mutations

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      apiFetch("/api/items", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
```

## API Routes

### Structure

API routes follow Next.js App Router conventions:

```text
apps/web/app/api/
├── _shared/
│   └── validation.ts    # Shared validation utilities
├── health/
│   └── route.ts         # GET /api/health
└── items/
    └── route.ts         # GET/POST /api/items
```json

### Creating API Routes

```tsx
// apps/web/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseJson, badRequest, ok } from "../_shared/validation";
import { z } from "zod";

const CreateExampleSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJson(request, CreateExampleSchema);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.details);
    }

    // Process data
    const result = { id: crypto.randomUUID(), ...parsed.data };

    return ok(result);
  } catch (error) {
    return badRequest("Processing failed");
  }
}

export async function GET() {
  // Return data
  return ok({ examples: [] });
}
```

### Error Handling

All API routes use consistent error responses:

```tsx
import { badRequest, serverError } from "../_shared/validation";

// 400 Bad Request
return badRequest("Invalid input", { field: "name" });

// 500 Internal Server Error
return serverError("Database connection failed");
```

### Client-Side API Calls

Use the provided `apiFetch` utility:

```tsx
import { apiFetch } from "./lib/http";

try {
  const data = await apiFetch("/api/items", {
    method: "POST",
    body: JSON.stringify({ name: "New Item" }),
  });
  console.log("Created:", data);
} catch (error) {
  console.error("Error:", error.message);
}
```

## File Upload

### Basic Upload Component

```tsx
import React, { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
}
```

### Firebase Storage Integration

```tsx
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, `uploads/${file.name}`);

try {
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  console.log("File available at:", downloadURL);
} catch (error) {
  console.error("Upload failed:", error);
}
```

## State Management

### Zustand Store

The app uses Zustand for global state:

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
  setPreferences: (prefs: Partial<AppState["preferences"]>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      preferences: {
        theme: "light",
        notifications: true,
      },
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
    }),
    { name: "app-storage" }
  )
);
```

### Using the Store

```tsx
import { useAppStore } from "./store";

function UserProfile() {
  const { user, setUser, preferences, setPreferences } = useAppStore();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={() => setPreferences({ theme: "dark" })}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## Components

### Component Patterns

#### Custom Hooks

```tsx
import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

#### Error Boundaries

```tsx
import React from "react";

class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error }>;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultFallback;
      return <Fallback error={this.state.error!} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({ error }: { error: Error }) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}
```

## Styling

### Tailwind CSS

The app uses Tailwind for styling:

```tsx
export default function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
```

### Custom CSS

Add custom styles in `apps/web/src/styles/globals.css`:

```css
/* Custom utilities */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors;
}

.card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});

test("calls onClick when clicked", () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText("Click me"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### API Testing

```tsx
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/api/items", (req, res, ctx) => {
    return res(ctx.json({ items: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Performance Optimization

### Code Splitting

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>Loading...</div>,
});
```

### Image Optimization

```tsx
import Image from "next/image";

export default function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={800}
      height={600}
      priority // For above-the-fold images
    />
  );
}
```

### Memoization

```tsx
import { memo, useMemo } from "react";

const ExpensiveComponent = memo(({ data }: { data: any[] }) => {
  const processedData = useMemo(() => {
    return data.map((item) => expensiveOperation(item));
  }, [data]);

  return <div>{processedData.length} items processed</div>;
});
```

## Deployment

### Environment Variables

Set production environment variables:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_prod_project_id

# Optional
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Build Optimization

```bash
# Analyze bundle size
pnpm build --analyze

# Build for production
pnpm build
```

### PWA Configuration

The app includes PWA features. Update `public/manifest.json`:

```json
{
  "name": "Fresh Schedules",
  "short_name": "Fresh",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## Best Practices

### Code Organization

- Keep components small and focused
- Use custom hooks for shared logic
- Separate business logic from UI components
- Use TypeScript interfaces for data shapes

### Error Handling

- Use try/catch for async operations
- Provide user-friendly error messages
- Log errors for debugging
- Use error boundaries for React components

### Security

- Validate all inputs with Zod schemas
- Use Firebase security rules
- Store sensitive data securely
- Implement proper authentication flows

### Performance

- Lazy load components and routes
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper caching strategies

This guide covers the core patterns and practices for developing with Fresh Schedules. Refer to the component documentation and API references for more specific implementation details.
