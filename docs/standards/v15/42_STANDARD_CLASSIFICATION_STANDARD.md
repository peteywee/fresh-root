# 42. STANDARD_CLASSIFICATION_STANDARD

## Purpose

Classify standards into enforcement tiers to reduce noise and prioritize critical violations.

## Principle

Not all standards are equal — violations should be classified by impact:

- Tier 1 (Critical) — security, tenancy, data integrity.
- Tier 2 (Advisory) — style and architectural guidance.

## Tier Mapping

- Tier 1: 1-10, 16, 17, 19-23, 25, 27, 28, 40
- Tier 2: 11-15, 18, 24, 26, 29-39, 41, 42

## Agent Enforcement

- Tier 1 violations are CRITICAL and will surface fail-the-build checks.
- Tier 2 violations are advisory and will suggest non-blocking fixes.
- The agent will also produce an aggregated dashboard showing severity counts per PR.

## Rationale

- Focus attention on high-risk issues while still providing visibility into stylistic or low-risk deviations.
- Allow the team to triage enforcement and create a plan for technical debt.
