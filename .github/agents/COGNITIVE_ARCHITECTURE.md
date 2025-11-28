# FRESH Engine Cognitive Architecture v2.0

> This document defines **how you think** about problems in the Fresh Schedules
> system. It is the mental pipeline behind your outputs.

---

## 1. Processing Pipeline

For any non-trivial task, follow this pipeline:

1. **Clarify the Target**
   - Identify:
     - The **layer(s)** involved: Domain, Rules, API, UI.
     - The **entity/entities** involved (e.g., Schedule, Shift, Org, Venue).
     - The **expected business action** (e.g., "manager can publish a schedule").

2. **Load Context**
   - Prefer in this order:
     1. `CONTEXT_MANIFEST.md`
     2. `00_STANDARDS_INDEX.md`
     3. `SYMMETRY_FRAMEWORK.md`
   - Only pull in extra context when it changes the decision.

3. **Design First, Then Code**
   - Sketch:
     - What needs to change in:
       - Schemas
       - APIs
       - Rules
       - UI
     - Where files live (path, layer).
   - Only after that, generate code.

4. **Check Against Standards**
   - For each file you touch, check mentally:
     - Does it match the fingerprint for its layer?
     - Does it introduce a Tier 0 or Tier 1 risk?
   - If yes, you must either:
     - Fix it, or
     - Explicitly log the debt and tag it with the correct tier.

5. **Output**
   - Provide:
     - Full file contents.
     - Clear explanation of:
       - Impact on Triad of Trust.
       - Expected effect on Pattern Validator score.

---

## 2. Layered View of the System

You must think in layers:

1. **Layer 00 — Domain (Types & Schemas)**
   - Zod schemas and type aliases.
   - Truth source for payload shapes and constraints.

2. **Layer 01 — Rules (Authorization & Data Access)**
   - Firestore rules & equivalent policies.
   - Enforce tenant isolation, access scopes, and list blocking.

3. **Layer 02 — API (Routes & Handlers)**
   - Next.js route handlers, server actions.
   - Must validate inputs against Layer 00 and comply with Layer 01.

4. **Layer 03 — UI (Pages & Components)**
   - React components, pages, hooks.
   - Must respect constraints from the lower layers (not reinvent them).

You should default to **fixing lower layers first** if an inconsistency is found.

---

## 3. Refactor Authority

You are authorized to propose refactors when:

1. They reduce the number or severity of:
   - Tier 0 (security) issues.
   - Tier 1 (integrity) issues.
2. They strengthen or clarify:
   - Triad of Trust coverage.
   - Symmetry and consistency across similar modules.

Any refactor proposal must include:

1. **Problem Statement**
2. **Before/After Summary**
3. **Impact on Pattern Validator:**
   - Expected score change.
   - Any new or resolved violations.

---

## 4. Quantifiable Behavior

Your thinking is correct when:

1. For tasks touching critical paths:
   - You identify all relevant layers explicitly.
   - You specify which entities in the triad are impacted.

2. For each session:
   - You reduce or keep constant the count of Tier 0 and Tier 1 violations.
   - You do not add more than a small number of Tier 2/3 issues without justification.

---

## 5. Failure Modes to Avoid

You must avoid:

1. Treating tasks as single-file changes when they clearly affect multiple layers.
2. Ignoring schemas or rules when APIs change.
3. Suggesting UI changes that implicitly require schema or rule changes without calling that out.
