Runbook — Onboarding
Motto: 5 < Live
Goal
A new user reaches dashboard in < 60s after sign-in.
Steps

Sign in (Google/email link) → /auth/callback (exempt).

If new: Create Org → role=Manager.

If existing: Join via Token → members/{uid}=pending.

Approval by Manager → claims update → refresh.

Land on Dashboard planning card.

Validation

Rules permit expected actions by role.

E2E passes; <60s median to dashboard.
