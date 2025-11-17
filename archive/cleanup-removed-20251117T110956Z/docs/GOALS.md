# Fresh Schedules — Mission, Strategy, and OKRs

Version: 12.0.x
Status: Authoritative
Motto: 5 < Live # login → published schedule in ≤ 5 minutes

## 1) North-Star Outcome

Managers go from **login to published schedule** in **≤ 5 minutes**. Staff reliably see schedules.

## 2) Product Goals (What + Why)

- G1: **Publish ≤5 min** (Ops speed).
- G2: **Access safety** (strict RBAC).
- G3: **Reliability** (zero auth loops; deterministic CI).
- G4: **Repeatability** (repro build/run).
- G5: **Observability** (diagnose quickly; block regressions).

## 3) Strategy (How)

- S1: Single-source **Bible** + formal change control.
- S2: **Manager ≡ Admin** (UI: “Manager”); collapse roles for v12.
- S3: **Labor inputs before scheduling**; allow “Skip now” fast path.
- S4: Node 20 + **pnpm strict**; CI hard-fails on unmet/peer deps.
- S5: **Error bus + Sentry**; Monte Carlo harness (outputs gitignored).

## 4) OKRs

- O1 (Delivery): **p95 Login→Publish ≤ 5:00**.
- O2 (Quality): Monte Carlo 10k pass ≥ **99.5%**.
- O3 (Ops): 100% PRs blocked on unmet/peer deps; All-Green pipeline.
- O4 (Security): 0 cross-org read/write incidents.

## 5) Mini-Goals (Rolling)

- MG1: Planning prefill + adherence meter.
- MG2: MonthView render ≤200ms post data.
- MG3: Publish → message/receipts rules + tests.
- MG4: E2E (login→publish→logout) scripted + timed.
- MG5: AI prompt packs & agents versioned.
