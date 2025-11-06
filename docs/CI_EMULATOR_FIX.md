# CI/CD Emulator Port Conflict Fix

## Problem

CI workflows were failing on GitHub but passing locally due to **nested Firebase emulator instances** causing port conflicts.

### Root Cause

The `.github/workflows/ci.yml` was calling:

```yaml
firebase emulators:exec --only firestore,storage "pnpm -w test:rules"
```

But `test:rules` in `package.json` already wraps the test command:

```json
"test:rules": "firebase emulators:exec --only firestore,storage \"vitest run --globals --dir tests/rules --reporter=dot\""
```

This created **nested emulator instances** trying to bind to the same ports (8080, 9199, 4400, 4500), causing:

```text
⚠  firestore: Port 8080 is not open on localhost (127.0.0.1), could not start Firestore Emulator.
Error: Could not start Firestore Emulator, port taken.
```

### Why It Worked Locally

Locally, developers typically:

- Run `pnpm test:rules` directly (single emulator instance)
- OR manually start emulators with `pnpm emu` then run `pnpm test:rules:dev`
- Never nest `emulators:exec` calls

## Solution

### 1. Remove Nested Emulator Call in CI

**Before:**

```yaml
- name: Firestore & Storage Rules Tests (via emulators:exec)
  run: |
    pnpm exec firebase emulators:exec --only firestore,storage "pnpm -w test:rules"
```

**After:**

```yaml
- name: Firestore & Storage Rules Tests
  run: pnpm -w test:rules
```

### 2. Add Emulator Caching

Added GitHub Actions cache to avoid re-downloading emulator JARs on every run:

```yaml
- name: Cache Firebase Emulators
  uses: actions/cache@v4
  with:
    path: ~/.cache/firebase/emulators
    key: ${{ runner.os }}-firebase-emulators-${{ hashFiles('firebase.json') }}
    restore-keys: |
      ${{ runner.os }}-firebase-emulators-
```

This addresses the warning:

```text
⚠  It appears you are running in a CI environment. You can avoid downloading
   the Firestore Emulator repeatedly by caching the /home/runner/.cache/firebase/emulators directory.
```

## Testing

### 3. CI-Specific Ports (optional but robust)

To avoid port collisions with other processes on shared runners, CI can use a separate Firebase config with high-numbered ports:

Files:

- `firebase.ci.json` (new)
- `package.json` script `test:rules:ci`

Example `firebase.ci.json`:

```json
{
  "projects": { "default": "demo-fresh" },
  "emulators": {
    "auth": { "host": "127.0.0.1", "port": 39099 },
    "firestore": { "host": "127.0.0.1", "port": 38080 },
    "storage": { "host": "127.0.0.1", "port": 39199 },
    "functions": { "host": "127.0.0.1", "port": 35001 },
    "ui": { "enabled": false }
  },
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "storage": { "rules": "storage.rules" },
  "functions": { "source": "functions" }
}
```

Add script:

```json
{
  "scripts": {
    "test:rules:ci": "firebase --config firebase.ci.json emulators:exec --only firestore,storage \"vitest run --globals --dir tests/rules --reporter=dot\""
  }
}
```

And update CI to run it:

```yaml
- name: Firestore & Storage Rules Tests (CI ports)
  run: pnpm -w test:rules:ci
```

### Local Verification

```bash
# Should work (single emulator instance)
pnpm test:rules

# Should NOT be used (creates nested emulators)
firebase emulators:exec --only firestore,storage "pnpm test:rules"
```

### CI Verification

After pushing, check:

1. Emulators start without port conflicts
1. Rules tests run successfully
1. Emulator cache is used on subsequent runs (faster startup)

## Port Configuration

Current emulator ports (defined in `firebase.json`):

- Firestore: 8080
- Storage: 9199
- Auth: 9099
- Functions: 5001
- Hub: 4400 (auto-assigned)
- Logging: 4500 (auto-assigned)

These ports must remain available during test execution. Nesting emulator calls attempts to bind these ports twice, causing immediate failure.

## Related Files

- `.github/workflows/ci.yml` - CI workflow configuration
- `package.json` - Script definitions (`test:rules`, `test:rules:dev`)
- `firebase.json` - Emulator port configuration
- `firestore.rules`, `storage.rules` - Security rules under test

## Best Practices

1. **Never nest `emulators:exec` calls**
1. Use `test:rules` for CI/automated testing (manages emulators automatically)
1. Use `test:rules:dev` for local development when emulators are already running
1. Cache emulator binaries in CI to improve speed
1. Ensure ports are available before starting emulators
