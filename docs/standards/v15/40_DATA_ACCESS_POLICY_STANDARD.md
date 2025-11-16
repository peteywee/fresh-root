# 40. DATA_ACCESS_POLICY_STANDARD

## Purpose

Define a single, canonical, database-agnostic source of truth for data access and authorization within the system.

## Layer

00 (Domain) / 01 (Rules)

## Principle

The abstract Data Access Policy is the leader; concrete implementations (Firestore Rules, Postgres RLS, etc.) are followers and must be a provable translation of the policy.

## Rationale

- Avoid vendor lock-in and migration risk by separating intent from implementation.
- Provide an auditable policy model that can be validated against any backend.
- Drive guardrails and verification tooling that check parities between `policy.auth.ts` and `firestore.rules` or other rule sources.

## Artifact

- `packages/types/src/policy.auth.ts` — a TypeScript file that exports the canonical policy model for the repo.

## Agent Enforcement

- The agent will parse `packages/types/src/policy.auth.ts` and produce an intermediate model of required access rules.
- On pull requests, the agent will compare the policy model against any `firestore.rules` or other rule files and report "Policy Implementation Mismatch" as a critical violation if parity is missing.

## Example

```ts
import { USER_ROLES_MAP } from "./constants";

export const DataAccessPolicy = {
  collections: {
    organizations: {
      read: [USER_ROLES_MAP.NETWORK_OWNER, USER_ROLES_MAP.ORG_ADMIN, USER_ROLES_MAP.STAFF],
      create: [USER_ROLES_MAP.NETWORK_OWNER],
      update: [USER_ROLES_MAP.NETWORK_OWNER, USER_ROLES_MAP.ORG_ADMIN],
    },
  },
};
```
