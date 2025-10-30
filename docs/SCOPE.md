# Fresh Schedules — Scope (MoSCoW)
Version: 12.0.x
Motto: 5 < Live

## Must-Have (M)
- M1: Auth (Google + Email Link) loop-free; `/auth/callback` exempt from middleware.
- M2: Onboarding (create org / join token / approval) with claims sync.
- M3: Dashboard labor inputs (prefill; allowed$ & allowedHours).
- M4: MonthView + Shift CRUD; **Publish** schedule (terminal goal).
- M5: Messaging + read receipts (supportive; not terminal).
- M6: Firestore/Storage rules (Manager, Member) deny-by-default.
- M7: CI gates (lint, typecheck, unit, rules, **Jest E2E** with Playwright).
- M8: AI instruction packs (system prompt, chat modes, agents, templates).

## Should-Have (S)
- S1: Optional push (callable function).
- S2: Minimal analytics for KPI tracking.

## Could-Have (C)
- C1: GPS/Maps integration (non-enforcing) for venue context/routing.
- C2: Drag-and-drop scheduling.

## Won’t-Have (W) — v12
- W1: GPS/photo **enforced** tracking.
- W2: Invoicing/payments.
- W3: Superadmin beyond Manager.

## Golden Path (terminal)
Sign in → Onboard (create/join) → Dashboard (confirm inputs) → Build schedule → **Publish schedule** → Logout
