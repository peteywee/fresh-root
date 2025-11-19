# Phase 2 – Schema Crosswalk (13.5 → 14 → 15)

**Purpose**  
Map Firestore schemas and domain types from **legacy** designs to the **v15 canonical schema** so data migration can be automated and safe.

---

## 1. Columns

Each row should cover one Firestore collection or logical entity:

- **Entity / Collection** – e.g.,
