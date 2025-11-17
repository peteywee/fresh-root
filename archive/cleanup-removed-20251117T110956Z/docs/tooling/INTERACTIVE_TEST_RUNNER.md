<!-- [P0][DOCS][TEST] Interactive Test Runner Documentation
Tags: P0, DOCS, TEST, INTERACTIVE -->

# Interactive Test Runner

The repository includes an interactive test runner that prompts you for common test options. You no longer need to remember environment variables—just run the command and answer the prompts.

## Quick Start

```bash
pnpm test:interactive
```

This will prompt you with options:

1. **Run unit tests only (no server)** — Runs tests without starting the Next.js dev server. Fast, for CI/local quick checks.
2. **Run full tests with server (slower, integration tests)** — Starts the Next.js dev server and runs all tests. Required for integration/HTTP API tests.
3. **Run with increased memory (8GB Node)** — Runs tests with `NODE_OPTIONS=--max-old-space-size=8192` to prevent worker OOM errors.
4. **Custom: Full tests + increased memory** — Combines options 2 and 3 for the best compatibility on resource-constrained machines.

## When to Use Each Option

- **Unit tests only**: Daily local development, quick validation of types/lint/unit logic.
- **Full tests**: Before opening a PR, to validate integration tests and API endpoints.
- **Increased memory**: If you see worker crash errors like "Timeout waiting for worker to respond" or "Worker exited unexpectedly", use this option.
- **Custom**: Default recommendation for CI runs or when you need full validation.

## Behind the Scenes

The script (`scripts/test-interactive.mjs`) sets environment variables and runs `pnpm -w test`:

- `START_NEXT_IN_TESTS=true` — Tells `vitest.global-setup.ts` to start the Next.js dev server during tests.
- `NODE_OPTIONS=--max-old-space-size=8192` — Increases Node.js heap size to 8GB, preventing OOM on large test suites.

## Local vs. CI

- **Local machines (default)**: Tests skip starting the server by default to avoid consuming RAM. Use `pnpm test:interactive` to opt in for full tests.
- **GitHub Actions (CI)**: The `.github/workflows/ci-tests.yml` workflow always starts the server and uses increased memory, ensuring full validation in CI.

## Alternatives

If you prefer to run tests without the interactive prompt:

```bash
# Unit tests only (no server)
pnpm -w test

# Full tests with server
START_NEXT_IN_TESTS=true pnpm -w test

# Full tests with server + 8GB memory
START_NEXT_IN_TESTS=true NODE_OPTIONS="--max-old-space-size=8192" pnpm -w test
```

## Troubleshooting

### Worker timed out or Worker exited unexpectedly

- Run `pnpm test:interactive` and select "Custom: Full tests + increased memory"

### Cannot find module 'prompts'

- Run `pnpm -w install --frozen-lockfile` to install dependencies

### Tests still starting a server locally when I don't want them to

- The default is to NOT start a server locally. If tests are starting the server, check if `CI=true` or `START_NEXT_IN_TESTS=true` is set in your environment and unset it.
