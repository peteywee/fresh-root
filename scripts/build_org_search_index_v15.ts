#!/usr/bin/env tsx
// [P0][UI][CODE] Build Org Search Index V15
// Tags: P0, UI, CODE
/**
 * Build orgSearchIndex for v15 discoverability.
 * Populates orgSearchIndex from orgs where publicSearch === true.
 *
 * Usage:
 *   # Set GOOGLE_APPLICATION_CREDENTIALS or local emulator
 *   tsx scripts/build_org_search_index_v15.ts
 */
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function main() {
  const snap = await db.collection("orgs").get();
  let created = 0;

  for (const doc of snap.docs) {
    const data = doc.data() || {};
    if (!data.publicSearch) continue;

    const rec = {
      orgId: doc.id,
      name: data.name ?? null,
      taxId: data.taxId ?? null,
      address: data.address ?? null,
      contactEmail: data.contactEmail ?? null,
      phone: data.phone ?? null,
      adminName: data.ownerName ?? null,
      publicSearch: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("orgSearchIndex").doc(doc.id).set(rec, { merge: true });
    created++;
  }

  console.log(`✅ orgSearchIndex populated for ${created} org(s).`);
}

main().catch((e) => {
  console.error("❌ orgSearchIndex build failed:", e);
  process.exit(1);
});
