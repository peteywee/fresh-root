---

description: "Guidelines for GitHub Copilot to write comments to achieve self-explanatory code with
less comments. Examples are in JavaScript but it should work on any language that has comments."

## applyTo: "\*\*"

# Self-explanatory Code Commenting Instructions

## Core Principle

**Write code that speaks for itself. Comment only when necessary to explain WHY, not WHAT.** We do
not need comments most of the time.

## Commenting Guidelines

### ❌ AVOID These Comment Types

**Obvious Comments**

```javascript
// Bad: States the obvious
let counter = 0; // Initialize counter to zero
counter++; // Increment counter by one
```

**Redundant Comments**

```javascript
// Bad: Comment repeats the code
function getUserName() {
  return user.name; // Return the user's name
}
```

**Outdated Comments**

```javascript
// Bad: Comment doesn't match the code
// Calculate tax at 5% rate
const tax = price * 0.08; // Actually 8%
```

### ✅ WRITE These Comment Types

**Complex Business Logic**

```javascript
// Good: Explains WHY this specific calculation
// Apply progressive tax brackets: 10% up to 10k, 20% above
const tax = calculateProgressiveTax(income, [0.1, 0.2], [10000]);
```

**Non-obvious Algorithms**

```javascript
// Good: Explains the algorithm choice
// Using Floyd-Warshall for all-pairs shortest paths
// because we need distances between all nodes
for (let k = 0; k < vertices; k++) {
  for (let i = 0; i < vertices; i++) {
    for (let j = 0; j < vertices; j++) {
      // ... implementation
    }
  }
}
```

**Regex Patterns**

```javascript
// Good: Explains what the regex matches
// Match email format: username@domain.extension
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

## Decision Framework

Before writing a comment, ask:

1. **Is the code self-explanatory?** → No comment needed
2. **Would a better variable/function name eliminate the need?** → Refactor instead
3. **Does this explain WHY, not WHAT?** → Good comment
4. **Will this help future maintainers?** → Good comment

## Special Cases for Comments

### Public APIs

```javascript
/**
 * Calculate compound interest using the standard formula.
 *
 * @param {number} principal - Initial amount invested
 * @param {number} rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param {number} time - Time period in years
 * @param {number} compoundFrequency - How many times per year interest compounds (default: 1)
 * @returns {number} Final amount after compound interest
 */
function calculateCompoundInterest(principal, rate, time, compoundFrequency = 1) {
  // ... implementation
}
```

## Quality Checklist

Before committing, ensure your comments:

- \[ ] Explain WHY, not WHAT
- \[ ] Are grammatically correct and clear
- \[ ] Will remain accurate as code evolves
- \[ ] Add genuine value to code understanding
- \[ ] Are placed appropriately (above the code they describe)
- \[ ] Use proper spelling and professional language

## Summary

Remember: **The best comment is the one you don't need to write because the code is
self-documenting.**
