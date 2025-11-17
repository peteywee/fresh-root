# Compatibility Notes & Actions

Generated compatibility matrix with risk classifications.

## High-risk packages (require isolated upgrade and tests)
- None

## Medium-risk packages
- prettier ( -> 3.6.2)
- cspell (8.19.4 -> 9.3.2)
- glob (10.4.5 -> 11.0.3)
- import-in-the-middle (1.15.0 -> 2.0.0)
- require-in-the-middle (7.5.2 -> 8.0.1)

## Low-risk packages
- @typescript-eslint/eslint-plugin (8.46.2 -> 8.46.4)
- @typescript-eslint/parser (8.46.2 -> 8.46.4)
- @vitejs/plugin-react (5.1.0 -> 5.1.1)
- eslint-config-next (16.0.1 -> 16.0.3)
- turbo (2.6.0 -> 2.6.1)
- vitest (4.0.6 -> 4.0.9)
- @modelcontextprotocol/sdk (1.21.1 -> 1.22.0)
- @types/node (24.9.2 -> 24.10.1)
- eslint (9.38.0 -> 9.39.1)
- firebase (12.5.0 -> 12.6.0)
- firebase-admin (13.5.0 -> 13.6.0)
- firebase-tools (14.24.0 -> 14.25.0)
- markdownlint-cli (0.40.0 -> 0.45.0)

## Suggested first batch
- Dev tooling: TypeScript, ESLint, Prettier, Vitest, turbo

## Suggested commands per batch
```\n# example: update dev deps batch\npnpm -w add -D typescript@latest eslint@latest prettier@latest vitest@latest\npnpm -w install --frozen-lockfile\npnpm -w typecheck\npnpm -w lint --fix\n```\n