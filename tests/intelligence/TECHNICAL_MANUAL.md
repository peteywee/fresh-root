# Test Intelligence CLI

[![npm version](https://badge.fury.io/js/testintel.svg)](https://www.npmjs.com/package/testintel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AI-Powered Test Intelligence System** - A production-grade CLI for intelligent test orchestration, security scanning, E2E test generation, and predictive analytics.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [CLI Commands](#cli-commands)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)
10. [License](#license)

---

## Features

| Feature                       | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| 🧠 **AI Test Prioritization** | ML-powered test ordering based on failure history and code changes |
| 🔒 **Security Scanning**      | OWASP-based vulnerability detection for API routes                 |
| ⚡ **Parallel Optimization**  | Intelligent test batching for maximum parallelization              |
| 🔮 **Predictive Analytics**   | Forecast test failures before they happen                          |
| 🧪 **E2E Test Generation**    | Auto-generate E2E tests from API routes                            |
| 📊 **Live Dashboard**         | Real-time test metrics and visualization                           |
| 🔧 **Self-Healing Tests**     | Automatic test repair for common failures                          |
| 📋 **JUnit Reports**          | CI/CD compatible test output                                       |
| 🌐 **Cross-Platform**         | Works on Windows, macOS, Linux, and Chromebooks                    |

---

## Installation

### Global Installation (Recommended)

```bash
# npm
npm install -g testintel

# pnpm
pnpm add -g testintel

# yarn
yarn global add testintel
```

### Local Installation (Project-specific)

```bash
# npm
npm install --save-dev testintel

# pnpm
pnpm add -D testintel

# yarn
yarn add -D testintel
```

### Verify Installation

```bash
testintel --version
# Output: 1.0.0

testintel --help
```

---

## Quick Start

### 1. Initialize in Your Project

```bash
cd your-project
testintel --help
```

### 2. Run Your First Test Suite

```bash
# Full test suite with all stages
testintel run

# Quick validation (faster)
testintel run quick
```

### 3. Generate E2E Tests

```bash
# Generate tests for all API routes
testintel e2e generate

# List generated tests
testintel e2e list

# Run E2E tests (requires dev server running)
testintel e2e run
```

### 4. Security Scan

```bash
# Scan default API paths
testintel security

# Scan specific paths
testintel security apps/web/app/api lib/utils
```

---

## CLI Commands

### `testintel run [mode]`

Run the complete test intelligence pipeline.

**Arguments:**

- `mode` - Test mode: `full` (default) or `quick`

**Examples:**

```bash
testintel run           # Full test suite
testintel run full      # Explicit full mode
testintel run quick     # Quick validation
```

**Stages (Full Mode):**

1. Contract Testing
2. E2E Tests + Performance
3. Mutation Testing
4. Chaos Engineering
5. Self-Healing Tests
6. Test Analytics
7. AI Test Prioritization
8. Predictive Analytics
9. Parallelization Optimization
10. Security Scanning

---

### `testintel e2e [action]`

Generate and run E2E tests.

**Actions:**

- `generate` - Generate E2E tests from API routes
- `run` - Run all E2E tests
- `list` - List existing E2E tests
- `help` - Show E2E help

**Examples:**

```bash
testintel e2e generate              # Generate for all API routes
testintel e2e generate apps/web     # Generate for specific path
testintel e2e run                   # Run all E2E tests
testintel e2e list                  # Show existing tests
```

**Generated Test Structure:**

```typescript
// tests/e2e/health.e2e.test.ts
describe("health API E2E Tests", () => {
  describe("GET /api/health", () => {
    it("should return 200 for valid request", async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      expect(response.status).toBe(200);
    });
  });
});
```

---

### `testintel security [paths...]`

Scan for security vulnerabilities.

**Arguments:**

- `paths` - Paths to scan (default: `apps/web/app/api`)

**Examples:**

```bash
testintel security                      # Default API scan
testintel security apps/web lib         # Multiple paths
testintel security src/routes           # Custom path
```

**Security Checks:**

- SQL Injection detection
- XSS vulnerability scanning
- Hardcoded secrets detection
- Path traversal vulnerabilities
- Insecure authentication patterns
- Missing rate limiting
- OWASP Top 10 compliance

**Output:**

```
🔒 SECURITY SCAN REPORT
════════════════════════════════════════════════════════════════════════

Security Score: 95/100 (Grade: A)

Vulnerabilities Found:
  🔴 Critical: 0
  🟠 High: 0
  🟡 Medium: 2
  🟢 Low: 1
```

---

### `testintel prioritize [limit]`

AI-powered test prioritization.

**Arguments:**

- `limit` - Maximum tests to analyze (default: 20)

**Examples:**

```bash
testintel prioritize          # Top 20 tests
testintel prioritize 50       # Top 50 tests
```

**Output:**

```
🧠 AI TEST PRIORITIZATION REPORT
══════════════════════════════════════════════════════════════════════

1. auth.test.ts
   Priority Score: 95
   Failure Probability: 15%
   Reasoning: Recently modified, high complexity
```

---

### `testintel predict [limit]`

Predict test failures before running.

**Arguments:**

- `limit` - Maximum tests to analyze (default: 20)

**Examples:**

```bash
testintel predict             # Analyze 20 tests
testintel predict 100         # Analyze 100 tests
```

---

### `testintel parallel [limit]`

Optimize test parallelization.

**Arguments:**

- `limit` - Maximum tests to optimize (default: 20)

**Examples:**

```bash
testintel parallel            # Optimize 20 tests
testintel parallel 50         # Optimize 50 tests
```

**Output:**

```
⚡ PARALLELIZATION OPTIMIZATION REPORT
════════════════════════════════════════════════════════════════════════

Performance:
  Sequential Duration: 120.0s
  Parallel Duration: 15.0s
  Speedup: 8.00x
  Efficiency: 200.0%

Batches: 4
Max Workers: 4
```

---

### `testintel data [count]`

Generate realistic test data.

**Arguments:**

- `count` - Number of records to generate (default: 5)

**Examples:**

```bash
testintel data                # Generate 5 users
testintel data 100            # Generate 100 users
```

**Output:**

```json
[
  {
    "id": "usr_abc123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "admin"
  }
]
```

---

### `testintel help` / `testintel --help` / `testintel -h`

Show help information.

### `testintel version` / `testintel --version` / `testintel -v`

Show version number.

---

## Configuration

### Config File (`.testintelrc.json`)

Create a `.testintelrc.json` file in your project root:

```json
{
  "stages": ["security", "prioritize", "e2e"],
  "parallel": true,
  "verbose": true,
  "output": "junit",
  "security": {
    "paths": ["apps/web/app/api", "lib"],
    "severity": "medium"
  },
  "e2e": {
    "baseUrl": "http://localhost:3000",
    "timeout": 30000
  },
  "prioritization": {
    "limit": 50,
    "weights": {
      "recentFailure": 0.4,
      "codeChange": 0.3,
      "complexity": 0.2,
      "flakiness": 0.1
    }
  }
}
```

### Environment Variables

| Variable             | Description                       | Default                 |
| -------------------- | --------------------------------- | ----------------------- |
| `TEST_BASE_URL`      | Base URL for E2E tests            | `http://localhost:3000` |
| `TESTINTEL_VERBOSE`  | Enable verbose output             | `false`                 |
| `TESTINTEL_OUTPUT`   | Output format (json, junit, html) | `json`                  |
| `TESTINTEL_PARALLEL` | Enable parallel execution         | `true`                  |
| `CI`                 | CI environment detection          | auto-detected           |

---

## API Reference

### Programmatic Usage

You can also use Test Intelligence programmatically:

```typescript
import { orchestrator } from "testintel";
import { securityScanner } from "testintel/security";
import { e2eGenerator } from "testintel/e2e";

// Run full test suite
const result = await orchestrator.runFull();
console.log(result.stages);

// Run security scan
const securityResult = await securityScanner.scan(["apps/web"]);
console.log(securityResult.summary);

// Generate E2E tests
const generated = await e2eGenerator.generate();
console.log(`Generated ${generated.length} tests`);
```

### Module Exports

| Module                  | Export                     | Description                    |
| ----------------------- | -------------------------- | ------------------------------ |
| `testintel`             | `orchestrator`             | Main test orchestrator         |
| `testintel/security`    | `securityScanner`          | Security vulnerability scanner |
| `testintel/e2e`         | `e2eGenerator`             | E2E test generator             |
| `testintel/prioritizer` | `aiPrioritizer`            | AI test prioritization         |
| `testintel/analytics`   | `predictiveAnalytics`      | Predictive analytics           |
| `testintel/parallel`    | `parallelizationOptimizer` | Parallel optimization          |
| `testintel/data`        | `testDataFactory`          | Test data generation           |

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Test Intelligence

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Install testintel
        run: npm install -g testintel

      - name: Run Security Scan
        run: testintel security

      - name: Run Test Suite
        run: testintel run quick

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: test-intelligence-report
          path: tests/intelligence/dashboard.html
```

### GitLab CI

```yaml
test-intelligence:
  stage: test
  image: node:20
  script:
    - npm install -g testintel
    - testintel security
    - testintel run quick
  artifacts:
    paths:
      - tests/intelligence/dashboard.html
    expire_in: 1 week
```

### CircleCI

```yaml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: npm install -g testintel
      - run: testintel security
      - run: testintel run quick
      - store_artifacts:
          path: tests/intelligence/dashboard.html
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('Test Intelligence') {
            steps {
                sh 'npm install -g testintel'
                sh 'testintel security'
                sh 'testintel run quick'
            }
        }
    }
    post {
        always {
            archiveArtifacts 'tests/intelligence/dashboard.html'
        }
    }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Command not found: testintel"

**Cause:** Global installation not in PATH.

**Fix:**

```bash
# Find npm global bin
npm bin -g

# Add to PATH (bash)
export PATH="$(npm bin -g):$PATH"

# Or reinstall
npm install -g testintel
```

#### 2. E2E tests failing with connection refused

**Cause:** Dev server not running.

**Fix:**

```bash
# Start your dev server first
npm run dev

# Then run E2E tests
testintel e2e run
```

#### 3. Security scan finds no files

**Cause:** Wrong path specified.

**Fix:**

```bash
# List your project structure
ls -la

# Use correct path
testintel security src/api  # or wherever your API is
```

#### 4. "Cannot find module 'glob'"

**Cause:** Dependencies not installed.

**Fix:**

```bash
npm install glob tsx typescript
```

### Debug Mode

Enable verbose output for debugging:

```bash
TESTINTEL_VERBOSE=true testintel run
```

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/peteywee/testintel.git
cd testintel
pnpm install
pnpm testintel --help
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- 📖 [Documentation](https://github.com/peteywee/testintel#readme)
- 🐛 [Issue Tracker](https://github.com/peteywee/testintel/issues)
- 💬 [Discussions](https://github.com/peteywee/testintel/discussions)

---

**Made with ❤️ by the Fresh Schedules Team**
