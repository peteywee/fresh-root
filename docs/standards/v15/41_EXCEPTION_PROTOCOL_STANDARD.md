# 41. EXCEPTION_PROTOCOL_STANDARD

## Purpose

Provide a formal, auditable protocol for declaring "Principled Exceptions" to the doctrine. This allows deliberate deviations to be recorded, reviewed, and approved.

## Layer

Process / All

## Principle

Deviations from the doctrine must be deliberate, justified, and approved. They are transparent by design.

## Annotation Format

Add a structured JSDoc block above the code to declare an exception.

### Example

```js
/**
 * @DOCTRINE_EXCEPTION
 * standard_id: 'API_ROUTE_STANDARD'
 * rule: 'Handlers must be wrapped in withApiAuth'
 * justification: 'Public Stripe webhook; built-in signature verification secures this endpoint.'
 * approved_by: '@your_github_username'
 * issue_ref: 'GH-123'
 */
export const POST = withStripeSignatureVerification(async ({ req }) => {
  // webhook logic
});
```

## Agent Enforcement

- The agent validates the annotation structure and flags it for manual human review in PRs.
- The agent does not treat annotated code as a violation — instead it posts a non-blocking review comment and an advisory check: "Principled Exception declared — manual sign-off required".
- Exceptions are included in the permanent audit trail for traceability.

## Notes

- Exceptions should be used sparingly and only for justifiable architectural reasons.
- Routine or accidental deviations should be corrected, not documented as exceptions.
