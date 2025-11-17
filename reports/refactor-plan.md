# Refactor Plan (automated draft)

## Summary
This draft identifies priority packages and recommended upgrade batches for v15 migration. Review and adjust before applying.

## Core Priority Upgrades
- **prettier**:  -> 3.6.2 (wanted: 3.6.2)
- **@typescript-eslint/eslint-plugin**: 8.46.2 -> 8.46.4 (wanted: 8.46.2)
- **@typescript-eslint/parser**: 8.46.2 -> 8.46.4 (wanted: 8.46.2)
- **@vitejs/plugin-react**: 5.1.0 -> 5.1.1 (wanted: 5.1.0)
- **eslint-config-next**: 16.0.1 -> 16.0.3 (wanted: 16.0.1)
- **vitest**: 4.0.6 -> 4.0.9 (wanted: 4.0.6)
- **@types/node**: 24.9.2 -> 24.10.1 (wanted: 24.9.2)
- **eslint**: 9.38.0 -> 9.39.1 (wanted: 9.38.0)
- **firebase**: 12.5.0 -> 12.6.0 (wanted: 12.5.0)
- **firebase-admin**: 13.5.0 -> 13.6.0 (wanted: 13.5.0)
- **firebase-tools**: 14.24.0 -> 14.25.0 (wanted: 14.24.0)

## Dev / Secondary Upgrades
- turbo: 2.6.0 -> 2.6.1
- @modelcontextprotocol/sdk: 1.21.1 -> 1.22.0
- cspell: 8.19.4 -> 9.3.2
- glob: 10.4.5 -> 11.0.3
- import-in-the-middle: 1.15.0 -> 2.0.0
- require-in-the-middle: 7.5.2 -> 8.0.1
- markdownlint-cli: 0.40.0 -> 0.45.0

## Suggested Batches
1. Dev tooling: eslint, prettier, typescript, vitest
2. Core runtime libs: next, react, react-dom, firebase, firebase-admin
3. Testing & e2e: playwright, test runners
4. Remaining deps: low-risk updates

## Notes
- Run each batch in its own branch/PR. Use emulators and `pnpm -w typecheck` between batches.
- When upgrading core runtime libs, run local emulators and integration tests.
