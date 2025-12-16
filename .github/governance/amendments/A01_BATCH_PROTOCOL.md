---
id: A01
extends: 02_PROTOCOLS.md
section: P03 Batch Processing
tags: [api, batch, validation, patterns, protocol]
status: canonical
priority: P1
source: .github/BATCH_PROTOCOL_OFFICIAL.md
---

# Amendment A01: Batch Processing Protocol

## Purpose

Extends Protocol P03 with detailed batch endpoint implementation rules and systematic task execution patterns.

## Scope Classification

| Task Type | Duration | Actions | Protocol |
|-----------|----------|---------|----------|
| **Simple** | <5 min | Single action | Execute immediately |
| **Complex** | ≥5 min | Multiple steps | Full batch protocol |

## Core Rules

### R01: TODO List (Complex Tasks Only)

**MANDATORY**: Create structured TODO list FIRST for all complex tasks using `manage_todo_list`:

```typescript
{
  id: number,                    // Sequential 1,2,3...
  title: string,                 // 3-7 words, action-oriented
  description: string,           // What + acceptance criteria
  status: "not-started" | "in-progress" | "completed"
}
```

### R02: Batch API Endpoints

1. **Accept arrays**: `{ items: T[] }` format
2. **Maximum batch size**: 100 items per request
3. **Partial success**: Return `{ succeeded: [], failed: [] }`
4. **Independent validation**: Each item validated via Zod schema
5. **Transaction**: Use Firestore batch writes (max 500 ops)

### R03: Status Tracking

- Only ONE task `in-progress` at a time
- Mark `completed` IMMEDIATELY after finishing
- Don't batch completions

## Example: Batch Endpoint

```typescript
export const POST = createOrgEndpoint({
  input: z.object({ 
    items: ItemSchema.array().min(1).max(100) 
  }),
  handler: async ({ input, context }) => {
    const results = { succeeded: [], failed: [] };
    
    for (const item of input.items) {
      try {
        const created = await createItem(item, context.org!.orgId);
        results.succeeded.push(created);
      } catch (err) {
        results.failed.push({ 
          item, 
          error: err.message 
        });
      }
    }
    
    return NextResponse.json(results);
  }
});
```

## Validation Gates

Before proceeding to next task:

- [ ] Previous task marked `completed`
- [ ] Output validated
- [ ] No blockers identified

## Reference

Full protocol: `archive/amendment-sources/BATCH_PROTOCOL_OFFICIAL.md`
