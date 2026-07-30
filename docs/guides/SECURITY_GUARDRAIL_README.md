# README Security Sanitization Guard Rail

**Status**: ✅ Active | **Priority**: P0 | **Category**: Security

## Overview

Automated guard rail to prevent accidental exposure of security-sensitive information (API keys,
tokens, credentials) in README files and documentation.

## What It Does

- **Scans** README files for security patterns before commit
- **Detects** real API keys, tokens, passwords, and credentials
- **Blocks** commits that contain exposed secrets
- **Allows** placeholders and documentation examples
- **Runs** automatically in pre-commit hook

## Scope

The guard rail scans these files:

- `README.md` (root)
- `docs/README.md`
- `docs/guides/QUICK_START.md`
- `docs/guides/DEPLOYMENT.md`

## Security Patterns Detected

### 🔴 CRITICAL Severity

- **Private Keys**: PEM format private keys (RSA, EC, DSA)
- **Service Account Keys**: Firebase service account private keys

### 🟠 HIGH Severity

- **Google/Firebase API Keys**: AIza... format keys
- **GitHub Tokens**: Personal access tokens (ghp_..., gho_...)
- **OpenAI Keys**: sk-... format keys
- **Service Account Emails**: ...@...iam.gserviceaccount.com
- **MongoDB Connections**: With embedded credentials
- **PostgreSQL Connections**: With embedded credentials

### 🟡 MEDIUM Severity

- **Real Firebase Project IDs**: Non-demo project identifiers
- **Redis Connections**: With embedded credentials

### 🔵 LOW Severity

- **Upstash URLs**: Redis endpoint URLs
- **Real Email Addresses**: Non-example.com addresses

## Safe Patterns (Whitelisted)

These patterns are **safe** and will NOT be flagged:

```markdown
# ✅ Placeholders (safe)
FIREBASE_API_KEY=YOUR_API_KEY
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

# ✅ Example domains (safe)
example.com
test.com
your-domain.com

# ✅ Environment variable names (safe)
FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_PROJECT_ID
REDIS_URL

# ✅ Demo/test projects (safe)
demo-fresh
fresh-schedules-test

# ✅ Localhost (safe)
localhost:3000
127.0.0.1:6379

# ✅ Placeholder values (safe)
000000000000
abcdef123456
G-XXXXXXXXXX
1:000000000000:web:abcdef123456
```

## Usage

### Automatic (Pre-commit Hook)

The guard rail runs automatically when you commit changes to README files:

```bash
git add README.md
git commit -m "Update README"

# If secrets detected:
🚨 SECURITY ISSUE: Potential secrets detected in README files!
[... detailed findings ...]
❌ README security scan failed.
```

### Manual Scan

Run the scanner manually at any time:

```bash
node scripts/security/detect-readme-secrets.mjs
```

### Testing

Run the test suite to verify guard rail behavior:

```bash
pnpm test tests/security/readme-sanitization.test.ts
```

## How to Fix Detected Issues

### Step 1: Identify the Problem

The scanner will show:

- **File** and **line number**
- **Type** of secret detected
- **Severity** level
- **Context** (surrounding text)

Example output:

```text
🟠 HIGH (2 findings):
────────────────────────────────────────────────────────────────────────────────

  File: README.md:150:15
  Type: GOOGLE_API_KEY
  Description: Google/Firebase API key
  Context: FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 2: Replace with Placeholders

Replace actual values with safe placeholders:

```diff
- FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
+ FIREBASE_API_KEY=YOUR_API_KEY

- firebase-admin@my-project.iam.gserviceaccount.com
+ firebase-admin@your-project.iam.gserviceaccount.com

- mongodb://user:secretpass@cluster.mongodb.net/db
+ mongodb://username:password@cluster.mongodb.net/database
```

### Step 3: Move Secrets to .env.local

Never commit actual credentials. Use environment files:

```bash
# Copy template
cp .env.example .env.local

# Add your actual values to .env.local
# (This file is in .gitignore and won't be committed)
echo "FIREBASE_API_KEY=AIza..." >> .env.local
```

### Step 4: Review .env.example

Check `.env.example` for proper documentation patterns:

- Use `YOUR_API_KEY` or similar placeholders
- Include comments explaining what each variable is for
- Use example domains like `your-project.firebaseapp.com`

## Implementation Details

### Script Location

`scripts/security/detect-readme-secrets.mjs`

### Pre-commit Hook

`.husky/pre-commit` includes:

```bash
# [SECURITY] Scan README files for exposed secrets
STAGED_README=$(git diff --cached --name-only | grep -E '^README\.md$|^docs/.*README\.md$' || true)
if [ ! -z "$STAGED_README" ]; then
  node scripts/security/detect-readme-secrets.mjs
  if [ $? -ne 0 ]; then
    echo "❌ README security scan failed."
    exit 1
  fi
fi
```

### Test Coverage

`tests/security/readme-sanitization.test.ts` includes:

- ✅ Detection tests for all security patterns
- ✅ Whitelist verification tests
- ✅ Context awareness tests
- ✅ Severity level tests
- ✅ Pre-commit hook integration tests
- ✅ Error message clarity tests

## Maintenance

### Adding New Patterns

To detect new types of secrets:

1. Add pattern to `SECURITY_PATTERNS` array in
   `scripts/security/detect-readme-secrets.mjs`
2. Add test case to `tests/security/readme-sanitization.test.ts`
3. Run tests to verify
4. Document the new pattern in this guide

Example:

```javascript
{
  pattern: /NEW_PATTERN_HERE/g,
  type: 'NEW_SECRET_TYPE',
  description: 'Description of what this detects',
  severity: 'HIGH'  // CRITICAL, HIGH, MEDIUM, or LOW
}
```

### Updating Whitelist

To allow new safe patterns:

1. Add pattern to `WHITELIST_PATTERNS` array
2. Add test case verifying it's not flagged
3. Document in "Safe Patterns" section above

## Troubleshooting

### False Positives

If the scanner incorrectly flags a safe pattern:

1. Check if it's in the whitelist
2. Verify the context (should skip if in example/placeholder context)
3. Add to whitelist if needed
4. Report the issue

### False Negatives

If a real secret isn't detected:

1. Check the pattern definitions
2. Add a new pattern if needed
3. Add a test case
4. Update documentation

### Bypass (Emergency Only)

In rare emergencies, you can temporarily bypass the check:

```bash
# NOT RECOMMENDED - Only for emergencies
git commit --no-verify -m "Emergency fix"
```

**Warning**: This disables ALL pre-commit checks. Use with extreme caution.

## Related Documentation

- [Security Standards](.github/instructions/03_SECURITY.md)
- [Pre-commit Hooks](docs/guides/GIT_HOOKS.md)
- [Environment Configuration](.env.example)
- [Production Security Checklist](docs/production/SECURITY_CHECKLIST.md)

## Statistics

- **Files Scanned**: 4
- **Patterns Detected**: 15 types
- **Severity Levels**: 4 (CRITICAL, HIGH, MEDIUM, LOW)
- **Test Cases**: 30+
- **Lines of Code**: ~9,300 (script + tests)

## Version History

- **v1.0.0** (2026-02-18): Initial implementation with comprehensive pattern detection

## Support

If you encounter issues with this guard rail:

1. Check this documentation first
2. Review the test cases for examples
3. Check GitHub Issues for similar problems
4. Create a new issue with "security-guardrail" label

---

**Last Updated**: 2026-02-18
**Maintainer**: Security Team
**Status**: ✅ Active in Production
