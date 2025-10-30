# Firestore Rules Tests

- Uses @firebase/rules-unit-testing
- See `schedules.test.ts` for patterns
- Run: `pnpm test:rules`

## Running Tests

Tests validate that Firestore security rules properly enforce:
- Organization-scoped access control
- Role-based permissions (org_owner, admin, manager, scheduler, staff)
- Membership validation
- Prevention of data enumeration

## Test Structure

Each test file should include:
- At least 1 positive access test (authorized user can perform action)
- At least 3 denial paths (unauthorized users/actions are blocked)
- Tests for cross-org isolation

## Example

```typescript
test("manager can write schedule within same org", async () => {
  const ctx = authedContext("u1", "orgA", ["manager"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA/schedules/s1");
  await expect(setDoc(ref, { orgId: "orgA", startDate: 1 })).resolves.toBeUndefined();
});

test("staff cannot write schedule", async () => {
  const ctx = authedContext("u2", "orgA", ["staff"]);
  const db = ctx.firestore();
  const ref = doc(db, "orgs/orgA/schedules/s2");
  await expect(setDoc(ref, { orgId: "orgA", startDate: 1 })).rejects.toBeTruthy();
});
```
