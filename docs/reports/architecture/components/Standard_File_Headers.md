# File Header & Tag Standard
## Required Header (top of every new/changed file)
Include this exact block at the top of every new or modified source file so tooling and humans can
quickly discover ownership, layer, and contracts.

```text
// File: <relative path>
// Purpose: <what this file does in one sentence>
// Layer: L00|L01|L02|L03|L04
// Contracts: <schemas or interfaces this file promises>
// Owner: <team or person>
// Tags: [standard:<api|import|export|core>], [tenant], [security], [perf]
```

### Rules
- Layer reflects the five-layer model described in the repository docs. Use `L00`..`L04`
  accordingly.
- `Contracts` should reference Zod schemas, TypeScript interfaces, or adapter interfaces (e.g.
  `DataProviderAdapter`) that this file relies on or exposes.
- `Owner` should be a team or person responsible for reviewing changes to this file.
- `Tags` are used by the documentation and migration tooling to surface files during audits and
  searches — prefer the canonical set above.

These headers make it possible to generate migration reports, ownership lookup, and enforce
cross-layer boundaries during reviews.

---

Example (top of a new API route):

```text
// File: apps/web/app/api/items/route.ts
// Purpose: Public items API (list/create)
// Layer: L03
// Contracts: ItemSchema, ItemCreatePayload
// Owner: web-team
// Tags: [standard:api], [tenant], [perf]
```
