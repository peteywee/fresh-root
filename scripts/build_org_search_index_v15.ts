#!/usr/bin/env tsx
// [P1][MIGRATION][SCRIPT] Build v15 org search index
// Tags: migration, orgs, search, firestore, indexing
/**
 * Build the `orgSearchIndex` collection for v15.
 *
 * This script scans existing `orgs` documents (legacy layout) and materializes a
 * flattened, query‑friendly index used by onboarding discovery and admin lookups.
 *
 * Safe to run multiple times (idempotent per orgId).
 *
 * Usage:
 *   pnpm tsx scripts/build_org_search_index_v15.ts
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS or application default credentials available
 *   - firebase-admin installed
 */

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, WriteBatch } from "firebase-admin/firestore";

type OrgDoc = {
  name?: string;
  displayName?: string;
  legalName?: string | null;
  taxId?: string | null;
  address?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  ownerName?: string | null;
  publicSearch?: boolean;
};

type OrgSearchIndex = {
  orgId: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  address: string | null;
  contactEmail: string | null;
  phone: string | null;
  adminName: string | null;
  publicSearch: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function buildIndexPayload(id: string, data: OrgDoc): OrgSearchIndex {
  return {
    orgId: id,
    name: data.name || data.displayName || id,
    legalName: (data.legalName ?? null) || null,
    taxId: data.taxId ?? null,
    address: data.address ?? null,
    contactEmail: data.contactEmail ?? null,
    phone: data.phone ?? null,
    adminName: data.ownerName ?? null,
    publicSearch: Boolean(data.publicSearch),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function main() {
  console.log("🔍 Building orgSearchIndex (v15)…");
  const orgSnap = await db.collection("orgs").get();
  if (orgSnap.empty) {
    console.log("ℹ️ No orgs found; nothing to index.");
    return;
  }

  let processed = 0;
  let indexed = 0;
  let batch: WriteBatch = db.batch();
  const BATCH_LIMIT = 400; // Firestore batch limit is 500; keep margin

  for (const doc of orgSnap.docs) {
    processed++;
    const data = doc.data() as OrgDoc;
    if (!data.publicSearch) continue; // skip non-public
    const payload = buildIndexPayload(doc.id, data);
    batch.set(db.collection("orgSearchIndex").doc(doc.id), payload, { merge: true });
    indexed++;
    if (indexed % BATCH_LIMIT === 0) {
      await batch.commit();
      console.log(`✅ Committed batch at ${indexed} indexed records…`);
      batch = db.batch();
    }
  }

  // Final commit
  await batch.commit();
  console.log(`✅ Completed. Indexed ${indexed} of ${processed} org documents.`);
}

main().catch((err) => {
  console.error("❌ orgSearchIndex build failed", err);
  process.exitCode = 1;
});
