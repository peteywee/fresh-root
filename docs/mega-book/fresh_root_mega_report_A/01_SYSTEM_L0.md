# L0 — Mission & Non-Negotiables

## 1. Core Mission Statement

**Mission:**  
Enable managers to produce and publish a compliant, labor-aware staff schedule in **under 5 minutes** after onboarding, without needing spreadsheets, paper, or tribal knowledge.

## 2. Non-Negotiable Outcomes

1. **Speed:** First real schedule from a new org in <= 5 minutes once onboarding data is present.
2. **Correctness:** No internally inconsistent schedules (e.g., orphan shifts, double-booked staff).
3. **Compliance Guardrails:** System actively prevents or clearly flags illegal/unsafe scheduling patterns.
4. **Tenant Isolation:** Data from one organization/venue must never leak into another.
5. **Explainability:** Every suggested or auto-generated schedule must be explainable in plain language.
6. **Operational Resilience:** Critical flows (onboarding, schedule publish) must be recoverable from failure without manual DB surgery.

## 3. Mission-Level Threats

- Building an over-complex architecture that cannot ship.
- Silent data corruption in schedules or assignments.
- RBAC or multi-tenant bugs causing cross-org data leaks.
- A UI that fails to make the "5-minute schedule" obvious and repeatable.
- Lack of business narrative and ROI that kills adoption even if the tech works.

These threats drive the critical findings and L4 tasks defined in downstream files.
