import admin from "firebase-admin";

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function initFirebase() {
  if (admin.apps.length) return;

  // Put the raw JSON string in GitHub Secret: FIREBASE_SERVICE_ACCOUNT_JSON
  const json = JSON.parse(must("FIREBASE_SERVICE_ACCOUNT_JSON"));
  admin.initializeApp({
    credential: admin.credential.cert(json),
  });
}

async function main() {
  initFirebase();
  const db = admin.firestore();

  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  const metric = {
    id: must("BUILD_METRIC_ID"),
    createdAt: safeNum(process.env.BUILD_CREATED_AT, now),
    branch: must("GIT_BRANCH"),
    sha: must("GIT_SHA"),
    workflow: must("GITHUB_WORKFLOW_NAME"),
    runId: must("GITHUB_RUN_ID"),
    actor: process.env.GITHUB_ACTOR || "unknown",

    totalDurationSec: safeNum(process.env.TOTAL_DURATION_SEC, 0),
    installDurationSec: safeNum(process.env.INSTALL_DURATION_SEC, 0),
    buildDurationSec: safeNum(process.env.BUILD_DURATION_SEC, 0),
    sdkDurationSec: safeNum(process.env.SDK_DURATION_SEC, 0),

    cache: {
      nextJsCacheHit: (process.env.NEXTJS_CACHE_HIT || "").toLowerCase() === "true",
      turboCache: process.env.TURBO_CACHE || "unknown",
    },

    status: process.env.BUILD_STATUS || "success",
    expireAt: safeNum(process.env.EXPIRE_AT, now + ninetyDaysMs),
  };

  const ref = db.collection("ops_build_metrics_v1").doc(metric.id);

  await ref.set(metric, { merge: true });

  console.log("✅ Published build metric:", metric.id);
}

main().catch((err) => {
  console.error("❌ Failed to publish build metric:", err);
  process.exit(1);
});
