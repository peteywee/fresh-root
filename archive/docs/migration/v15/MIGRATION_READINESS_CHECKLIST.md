# v15 Migration Readiness Checklist

## 1) Code Moves

- [ ] All runtime code under `apps/web/app/**` (no residual imports from `_legacy_src`)
- [ ] `packages/types/src/**` used as the only source of truth for types/schemas
- [ ] No code imports from `_legacy/functions_duplicates/**`

## 2) Docs/Parity

- [ ] Each `app/api/**/route.ts` has a doc page from `API_ROUTE_DOC_TEMPLATE.md`
- [ ] Each exported `*Schema` has a doc page from `SCHEMA_DOC_TEMPLATE.md`
- [ ] Each doc links to its test spec and vice versa

## 3) Tests Presence

- [ ] Schema specs for each exported schema (valid+invalid matrices)
- [ ] API route specs for each route method
- [ ] Rules matrices for each collection
- [ ] Golden-path E2E spec exists

## 4) Tooling Hygiene

- [ ] ESLint "lean path" works (skips legacy/vendor)
- [ ] Doc-Parity Gate passing in CI
- [ ] No `.pnpm` vendor archives checked in outside `_legacy/` quarantine

## 5) Delete/Ignore Legacy

- [ ] `_legacy/**` fully ignored by lint/test/CI (except explicit audits)
