---
id: A07
extends: 09_CI_CD.md
section: Firebase Configuration
tags: [firebase, config, deployment, ci-cd]
status: canonical
priority: P1
source: .github/IMPLEMENTATION_PLAN_FIREBASE.md
---

# Amendment A07: Firebase Implementation & Deployment

## Purpose

Extends 09_CI_CD with Firebase-specific configuration and deployment procedures.

## Key Configuration Files

| File                     | Purpose                   | Location     |
| ------------------------ | ------------------------- | ------------ |
| `firebase.json`          | Hosting & emulator config | Root         |
| `firestore.rules`        | Security rules            | Root         |
| `firestore.indexes.json` | Query index definitions   | Root         |
| `storage.rules`          | Storage security          | Root         |
| `functions/package.json` | Cloud Functions deps      | `functions/` |

## Firebase Services Used

### 1. Firebase Authentication

- Session cookie-based auth
- Admin SDK verification on server
- Client SDK for login flow

### 2. Firestore Database

- Document-based NoSQL
- Hierarchical collections (`orgs/{orgId}/schedules/...`)
- Security rules enforce org isolation

### 3. Cloud Functions

- HTTP triggers for webhooks
- Scheduled functions for cron jobs
- Firestore triggers for data sync

### 4. Firebase Hosting

- Next.js static/SSR hosting
- CDN distribution
- Custom domain support

### 5. Firebase Emulators (Development)

```bash
NEXT_PUBLIC_USE_EMULATORS=true firebase emulators:start
```

Emulator ports:

- Firestore: `localhost:8080`
- Auth: `localhost:9099`
- Functions: `localhost:5001`
- Hosting: `localhost:5000`
- UI: `localhost:4000`

## Deployment Commands

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### Deploy Cloud Functions

```bash
cd functions
pnpm build
cd ..
firebase deploy --only functions
```

### Deploy Hosting (Next.js)

```bash
pnpm build
firebase deploy --only hosting
```

### Deploy All

```bash
pnpm build
cd functions && pnpm build && cd ..
firebase deploy
```

## Environment Variables

### Required for Production

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Optional (Development)

```bash
# Use emulators
NEXT_PUBLIC_USE_EMULATORS=true
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Deploy to Firebase
        run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

## Firestore Rules Pattern

```javascript
// Basic org isolation
match /orgs/{orgId} {
  allow read: if isSignedIn() && isOrgMember(orgId);
  allow write: if isSignedIn() && hasAnyRole(orgId, ['org_owner', 'admin']);

  match /schedules/{scheduleId} {
    allow read: if isSignedIn() && isOrgMember(orgId);
    allow write: if isSignedIn() && hasAnyRole(orgId, ['org_owner', 'admin', 'manager']);
  }
}

// Helper functions
function isSignedIn() {
  return request.auth != null;
}

function isOrgMember(orgId) {
  return exists(/databases/$(database)/documents/memberships/$(request.auth.uid + "_" + orgId));
}

function hasAnyRole(orgId, roles) {
  return isOrgMember(orgId) &&
    get(/databases/$(database)/documents/memberships/$(request.auth.uid + "_" + orgId))
      .data.role in roles;
}
```

## Testing Rules

```bash
# Run Firestore rules tests
pnpm test:rules

# Test specific rule file
pnpm test:rules -- tests/rules/schedules.test.ts
```

## Monitoring

- **Console**: <https://console.firebase.google.com>
- **Metrics**: Firestore usage, Function invocations, Hosting bandwidth
- **Logs**: Cloud Functions logs via `firebase functions:log`

## Reference

Full implementation: `archive/amendment-sources/IMPLEMENTATION_PLAN_FIREBASE.md`  
Firebase docs: <https://firebase.google.com/docs>
