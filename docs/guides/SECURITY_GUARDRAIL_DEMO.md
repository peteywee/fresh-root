# Security Guard Rail Demonstration

## Overview

This document demonstrates the README security sanitization guard rail in action.

## Test Scenario 1: Detecting Exposed API Keys

### Bad README (Will Be Blocked)

```markdown
# Project Setup

## Firebase Configuration

FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_PROJECT_ID=real-production-project-abc123
```

### Scanner Output

```text
🚨 SECURITY ISSUE: Potential secrets detected in README files!

🟠 HIGH (1 finding):
────────────────────────────────────────────────────────────────────────────────

  File: README.md:5:19
  Type: GOOGLE_API_KEY
  Description: Google/Firebase API key
  Context: FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

────────────────────────────────────────────────────────────────────────────────

❌ Found 1 potential security issue(s) in 1 file(s)

🔧 Action Required:
   1. Remove or sanitize the detected secrets
   2. Replace with placeholders (YOUR_API_KEY, your-project-id, example.com)
   3. Move actual credentials to .env.local (never commit this file)
   4. Review .env.example for safe documentation patterns
```

### Fixed README (Will Pass)

```markdown
# Project Setup

## Firebase Configuration

FIREBASE_API_KEY=YOUR_API_KEY
FIREBASE_PROJECT_ID=your-project-id
```

---

## Test Scenario 2: Detecting Database Credentials

### Bad README (Will Be Blocked)

```markdown
# Database Setup

Connection string:
mongodb://admin:secretpassword@cluster.mongodb.net/production-db
```

### Scanner Output

```text
🚨 SECURITY ISSUE: Potential secrets detected in README files!

🟠 HIGH (1 finding):
────────────────────────────────────────────────────────────────────────────────

  File: README.md:4:1
  Type: MONGODB_CONNECTION
  Description: MongoDB connection string with credentials
  Context: mongodb://admin:secretpassword@cluster.mongodb.net/production-db

────────────────────────────────────────────────────────────────────────────────
```

### Fixed README (Will Pass)

```markdown
# Database Setup

Connection string format:
mongodb://username:password@cluster.mongodb.net/database
```

---

## Test Scenario 3: Detecting Service Account Emails

### Bad README (Will Be Blocked)

```markdown
# Service Account

firebase-adminsdk-abc123@my-production-project.iam.gserviceaccount.com
```

### Scanner Output

```text
🟠 HIGH (1 finding):
────────────────────────────────────────────────────────────────────────────────

  File: README.md:3:1
  Type: SERVICE_ACCOUNT_EMAIL
  Description: Google Service Account email address
  Context: firebase-adminsdk-abc123@my-production-project.iam.gserviceaccount.com
```

### Fixed README (Will Pass)

```markdown
# Service Account

Format: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

---

## Test Scenario 4: Private Keys (CRITICAL)

### Bad README (Will Be Blocked)

```markdown
# Authentication

```text
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
```

### Scanner Output

```text
🔴 CRITICAL (1 finding):
────────────────────────────────────────────────────────────────────────────────

  File: README.md:4:1
  Type: PRIVATE_KEY
  Description: Private key in PEM format
  Context: -----BEGIN PRIVATE KEY-----
```

### Fixed README (Will Pass)

```markdown
# Authentication

Private keys should NEVER be in README files.
Store them in:
- .env.local (local development)
- GitHub Secrets (CI/CD)
- Secret management service (production)
```

---

## Test Scenario 5: Multiple Issues

### Bad README (Will Be Blocked)

```markdown
# Full Configuration

FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Service: firebase-admin@production.iam.gserviceaccount.com
Database: mongodb://user:pass@cluster.mongodb.net/db
Contact: admin@mycompany.com
```

### Scanner Output

```text
🚨 SECURITY ISSUE: Potential secrets detected in README files!

🟠 HIGH (3 findings):
────────────────────────────────────────────────────────────────────────────────

  File: README.md:3:19
  Type: GOOGLE_API_KEY
  Description: Google/Firebase API key
  Context: FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  File: README.md:4:10
  Type: SERVICE_ACCOUNT_EMAIL
  Description: Google Service Account email address
  Context: Service: firebase-admin@production.iam.gserviceaccount.com

  File: README.md:5:11
  Type: MONGODB_CONNECTION
  Description: MongoDB connection string with credentials
  Context: Database: mongodb://user:pass@cluster.mongodb.net/db

🔵 LOW (1 finding):
────────────────────────────────────────────────────────────────────────────────

  File: README.md:6:10
  Type: REAL_EMAIL
  Description: Real email address (not example.com)
  Context: Contact: admin@mycompany.com

────────────────────────────────────────────────────────────────────────────────

❌ Found 4 potential security issue(s) in 1 file(s)
```

---

## Pre-commit Hook in Action

### Attempting to Commit with Secrets

```bash
$ git add README.md
$ git commit -m "Update configuration"

# Pre-commit hook runs automatically...

[SECURITY] Scanning README files for exposed secrets...

🚨 SECURITY ISSUE: Potential secrets detected in README files!
[... detailed output ...]

❌ README security scan failed.
   Remove secrets before committing. Use placeholders instead.

# Commit blocked! Changes not committed.
```

### Successful Commit After Fixing

```bash
$ # Fix the README by replacing secrets with placeholders
$ git add README.md
$ git commit -m "Update configuration"

[SECURITY] Scanning README files for exposed secrets...
✅ No security details detected in README files
   Scanned 4 file(s)

# Other pre-commit checks run...
✅ All checks passed

[main abc1234] Update configuration
 1 file changed, 5 insertions(+), 5 deletions(-)
```

---

## Safe Patterns That Pass

These patterns are recognized as safe and will NOT be flagged:

```markdown
# ✅ SAFE - Placeholder keys
FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key

# ✅ SAFE - Example domains
Contact: support@example.com
Auth: your-project.firebaseapp.com

# ✅ SAFE - Environment variable names (without values)
Required variables:
- FIREBASE_API_KEY
- FIREBASE_PROJECT_ID
- REDIS_URL

# ✅ SAFE - Localhost
Development: http://localhost:3000
Redis: redis://localhost:6379

# ✅ SAFE - Demo projects
FIREBASE_PROJECT_ID=demo-fresh
Test project: fresh-schedules-test

# ✅ SAFE - Placeholder numbers
FIREBASE_APP_ID=1:000000000000:web:abcdef123456
MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Summary

The security guard rail:

✅ **Detects** 15 types of security patterns
✅ **Blocks** commits with exposed secrets
✅ **Allows** safe placeholders and examples
✅ **Provides** clear, actionable error messages
✅ **Runs** automatically on every commit
✅ **Prevents** accidental credential exposure

---

**Generated**: 2026-02-18
**Last Updated**: 2026-02-18
