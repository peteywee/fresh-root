# testintel Usage Guide

**AI-Powered Test Intelligence CLI** - Installation and Command Reference

---

## Installation

```bash
# Global installation (recommended)
npm install -g testintel

# Or local installation in project
npm install --save-dev testintel
```

---

## Quick Start

### 1. Run Help

```bash
testintel --help
```

### 2. Generate Test Data

```bash
testintel data 10  # Generate 10 mock test users
```

### 3. Scan for Security Issues

```bash
testintel security apps/web/app/api
```

---

## CLI Commands

### `testintel run [mode]`

**Status:** ✅ Fully Implemented  
**What it does:** Runs your entire test suite with full or quick mode

```bash
testintel run              # Full test suite
testintel run quick        # Quick smoke tests
```

**Exit codes:**

- `0` = All tests passed
- `1` = Tests failed

---

### `testintel security [paths]`

**Status:** ✅ Working (Basic)  
**What it does:** Scans API routes for common security vulnerabilities

```bash
testintel security                          # Scan default API routes
testintel security apps/web/app/api         # Scan specific paths
testintel security apps/web lib functions   # Multiple paths
```

**Checks for:**

- Hardcoded secrets/credentials
- SQL injection vulnerabilities
- Missing authentication
- Unsafe dependencies
- OWASP Top 10 issues

**Output:** Saves JSON report to `security-report.json`

**Exit codes:**

- `0` = No critical issues
- `1` = Critical vulnerabilities found

---

### `testintel e2e <action> [paths]`

**Status:** ⚠️ Limited (Needs project context)  
**What it does:** Generate, list, and run E2E tests from API routes

```bash
testintel e2e generate              # Generate E2E tests for all routes
testintel e2e generate apps/web     # Generate for specific path
testintel e2e list                  # List all E2E tests
testintel e2e run                   # Run all E2E tests
```

**Requirements:**

- Must run from project root (not global install)
- Requires Playwright installed: `npm install -D @playwright/test`

**Generates:** Test files in `tests/e2e/` matching Playwright format

**Limitation:** When installed globally, can't find project API routes. Use local installation or
run from project directory.

---

### `testintel prioritize [limit]`

**Status:** ⚠️ Demo Mode  
**What it does:** AI-powered test ordering based on failure history and code changes

```bash
testintel prioritize           # Top 20 tests
testintel prioritize 50        # Top 50 tests
```

**Currently:** Shows mock data. Real implementation requires:

- Test execution history file
- Git integration
- ML model training

---

### `testintel predict [limit]`

**Status:** ⚠️ Demo Mode  
**What it does:** Predict which tests are likely to fail

```bash
testintel predict             # Next 20 tests likely to fail
testintel predict 100         # Next 100 tests
```

**Currently:** Shows demo predictions with placeholder confidence scores

---

### `testintel parallel [limit]`

**Status:** ⚠️ Demo Mode  
**What it does:** Optimize test parallelization strategy

```bash
testintel parallel            # Optimize 20 tests
testintel parallel 50         # Optimize 50 tests
```

**Currently:** Shows suggested batching strategy as demo output

---

### `testintel data [count]`

**Status:** ✅ Fully Implemented  
**What it does:** Generate mock test data (users, organizations, etc.)

```bash
testintel data               # Generate 5 users
testintel data 20            # Generate 20 users
```

**Output:** JSON array of test users with realistic data

**Use for:**

- Seeding databases
- E2E test fixtures
- Load testing

---

### `testintel --help` / `testintel help`

**Status:** ✅ Working  
Shows all available commands and examples

---

### `testintel --version` / `testintel -v`

**Status:** ✅ Working  
Displays the current version

---

## Configuration

### `.testintelrc.json` (Optional)

Create in your project root to customize CLI behavior:

```json
{
  "stages": ["security", "prioritize"],
  "parallel": true,
  "verbose": true,
  "output": "junit"
}
```

**Options:**

- `stages`: Which commands to run in sequence
- `parallel`: Run tests in parallel
- `verbose`: Show detailed output
- `output`: Format for reports (`json`, `junit`, `html`)

---

## Output and Reports

### Security Reports

Saved to: `security-report.json`

```json
{
  "summary": {
    "total": 25,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "vulnerabilities": []
}
```

### Test Data Output

Printed to stdout as JSON:

```json
[
  {
    "id": "usr-123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "org": "Acme Corp"
  }
]
```

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Security Scan
  run: npm install -g testintel && testintel security apps/web/app/api

- name: Run Tests
  run: testintel run
```

### GitLab CI

```yaml
test:
  script:
    - npm install -g testintel
    - testintel run
    - testintel security apps/web/app/api
```

### Jenkins

```groovy
stage('Test Intelligence') {
  steps {
    sh 'npm install -g testintel'
    sh 'testintel run'
    sh 'testintel security apps/web/app/api'
  }
}
```

---

## Troubleshooting

### "No tests found" or "No routes found"

**Problem:** E2E generation finds 0 routes

**Solution:**

1. Run from project root: `cd /path/to/project && testintel e2e generate`
2. Ensure API routes exist at: `apps/web/app/api/**/route.ts`
3. Check routes are exported: `export const GET = ...` or `export const POST = ...`

### "Cannot find module 'glob'"

**Problem:** Global install can't find dependencies

**Solution:**

1. Use local install: `npm install --save-dev testintel`
2. Run via npx: `npx testintel --help`
3. Or reinstall globally: `npm install -g testintel@latest`

### Exit code 1 but no visible errors

**Solution:** Check the JSON report files:

- `security-report.json` (for security scans)
- `test-execution-history.json` (for test history)

---

## Performance Tips

### For Large Projects

```bash
# Prioritize only critical tests
testintel prioritize 20

# Scan specific API paths
testintel security apps/web/app/api/organizations

# Quick test run
testintel run quick
```

### Parallel Execution

Enable in config:

```json
{
  "parallel": true
}
```

Or via environment:

```bash
TEST_PARALLEL=true testintel run
```

---

## Feature Status Summary

| Feature        | Status     | Notes                 |
| -------------- | ---------- | --------------------- |
| `run`          | ✅ Full    | Executes test suite   |
| `security`     | ✅ Working | Scans API routes      |
| `e2e generate` | ⚠️ Limited | Needs project context |
| `e2e run`      | ✅ Working | Runs Playwright tests |
| `data`         | ✅ Full    | Generates test data   |
| `prioritize`   | ⚠️ Demo    | Shows mock output     |
| `predict`      | ⚠️ Demo    | Shows mock output     |
| `parallel`     | ⚠️ Demo    | Shows mock output     |

---

## What's NOT Included

- ❌ Server mode / background daemon
- ❌ Web dashboard
- ❌ Real AI/ML predictions (uses mock data)
- ❌ MCP (Model Context Protocol) configs
- ❌ Systemd service auto-start
- ❌ Test result graphing
- ❌ Historical trend analysis

---

## Next Steps

1. **For E2E testing:** Install Playwright and run from project root
2. **For security scanning:** Scan your API routes: `testintel security apps/web/app/api`
3. **For CI/CD:** Add to your build pipeline
4. **For development:** Use `testintel --help` to explore commands

---

## Support

- **NPM Package:** https://www.npmjs.com/package/testintel
- **GitHub:** https://github.com/peteywee/fresh-root
- **License:** MIT
