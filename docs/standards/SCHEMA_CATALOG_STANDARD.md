# Schema Catalog Standard (Layer 00 — Domain)

**Purpose**  
Provide an authoritative, regenerable catalog of domain schemas (Zod) exported from `@fresh-schedules/types`.  
This enables strict traceability: **Domain Schema ↔ Rules ↔ API Routes ↔ UI Forms**.

## Source of Truth

- `packages/types/src/**`

## Included

- All declarations matching:  
  `export const <Name>Schema = z.object(...)`  
  and unions/arrays composed of Zod objects (e.g., `z.union([z.object(...), ...])`, `z.array(z.object(...))`).

## Output

- `docs/blocks/SCHEMA_CATALOG.md` (generated)

## Rules

1. All externally used entities MUST have Zod schemas in the Domain (Layer 00).
2. Names MUST follow `<Entity>Schema` (e.g., `OrgSchema`, `AttendanceRecordSchema`).
3. Types consumed elsewhere should derive via `z.infer<typeof <Schema>>`, not hand-rolled.
4. Any schema change impacting storage, rules, or APIs MUST be cross-walked in:
   - `docs/migration/v15/PHASE2_SCHEMA_CROSSWALK.md`
   - Firestore rules & rules tests

## Generation

- Run locally: `pnpm tsx scripts/gen_schema_catalog.ts`
- CI MUST regenerate and diff this document on PRs to prevent drift.

**Format**  
The generator writes a Markdown table:

| Schema        | Kind       | Top-Level Fields        | File                           |
| ------------- | ---------- | ----------------------- | ------------------------------ |
| \`OrgSchema\` | \`object\` | \`id, name, createdAt\` | \`packages/types/src/orgs.ts\` |

> Top-Level Fields are best-effort static extraction; nested shapes are summarized.

## Related Documents

- Layer contract: `docs/layers/LAYER_00_DOMAIN_KERNEL.md`
- Rules parity & tests: `packages/rules-tests/**`
- Crosswalk: `docs/migration/v15/PHASE2_SCHEMA_CROSSWALK.md`
