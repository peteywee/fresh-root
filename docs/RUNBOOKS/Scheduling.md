Runbook — Scheduling
Motto: 5 < Live
Goal
Create shifts for a period respecting labor targets.
Steps

Confirm planning inputs (prefill); allowed$ & allowedHours computed.

MonthView: add shifts; meter shows allocated vs allowed.

Soft warning on exceed; annotate if publishing over target.

Validation

Zod prevents invalid times/overlaps.

Performance: render ≤ 200ms post data load.
