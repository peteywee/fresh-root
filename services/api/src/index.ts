// [P1][RELIABILITY][OTEL] Initialize OpenTelemetry FIRST for auto-instrumentation
import { loadEnv } from "./env.js";
import { initOTel } from "./obs/otel.js";

// Load env before OTel init to get endpoint
const env = loadEnv();

// Initialize OpenTelemetry tracing (must be before Express import)
initOTel({
  serviceName: "fresh-schedules-api",
  serviceVersion: process.env.npm_package_version,
  endpoint: env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
});

// [P0][SECURITY][API] Fresh Schedules API Service - Main entrypoint
// Tags: P0, SECURITY, API, EXPRESS, ENTRYPOINT
import express, { type Request, type Response } from "express";

import { InMemoryCache } from "./cache/provider.js";
import { RedisCache } from "./cache/redis.js";
import { getAdminAuth, initFirebase } from "./firebase.js";
import { requestLogger } from "./mw/logger.js";
import { applySecurity } from "./mw/security.js";
import { require2FAForManagers, requireSession } from "./mw/session.js";
import { initSentry } from "./obs/sentry.js";
import { requireManager, sameOrgGuard } from "./rbac.js";

const { db } = initFirebase(env.FIREBASE_PROJECT_ID, env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

async function buildCache() {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      const cache = await RedisCache.connect(url);
      console.log("[api] using Redis cache");
      return cache;
    } catch (e) {
      console.warn("[api] Redis unavailable, falling back to in-memory cache:", e);
    }
  }
  return new InMemoryCache();
}
const cache = await buildCache();

const app = express();

// [P1][RELIABILITY][SENTRY] Initialize Sentry (must be first)
initSentry(app, {
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  release: process.env.npm_package_version,
});

// [P1][RELIABILITY][OBS] Request logging with reqId and latency
app.use(requestLogger());

applySecurity(app, env);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true, env: env.NODE_ENV }));

// [P1][RELIABILITY][SENTRY] Test endpoint to verify error tracking
app.get("/debug/sentry", (_req: Request, _res: Response) => {
  throw new Error("[SENTRY_TEST] This is a synthetic error for testing Sentry integration");
});

// [P0][SECURITY][AUTH] Session cookie endpoints
// Exchange Firebase ID token for session cookie (set-cookie)
app.post("/session", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body ?? {};
    if (typeof idToken !== "string" || idToken.length < 10) {
      return res.status(400).json({ error: "idToken required" });
    }
    const auth = getAdminAuth();
    // 5 days default, adjust as needed; for demo, use 12h
    const expiresIn = 12 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    // Secure cookie flags
    res.setHeader(
      "Set-Cookie",
      `session=${encodeURIComponent(sessionCookie)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(expiresIn / 1000)}`,
    );
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(401).json({ error: "invalid_token" });
  }
});

// Clear session cookie
app.delete("/session", (_req: Request, res: Response) => {
  res.setHeader("Set-Cookie", "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  return res.status(200).json({ ok: true });
});

// Example: create a schedule (manager-only, same org)
app.post(
  "/orgs/:orgId/schedules",
  requireSession,
  require2FAForManagers,
  sameOrgGuard((req) => req.params.orgId),
  requireManager,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const { startDate } = req.body ?? {};
      if (typeof startDate !== "number")
        return res.status(400).json({ error: "startDate (number) required" });

      // Write to Firestore
      const ref = db.collection("orgs").doc(orgId).collection("schedules").doc();
      await ref.set({ orgId, startDate, createdAt: Date.now() });

      // Invalidate any cached list for org
      await cache.del(`schedules:${orgId}`);

      return res.status(201).json({ id: ref.id });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: "internal_server_error" });
    }
  },
);

// Example: list schedules (members of org)
app.get(
  "/orgs/:orgId/schedules",
  requireSession,
  sameOrgGuard((req) => req.params.orgId),
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const cached = await cache.get<any[]>(`schedules:${orgId}`);
      if (cached) return res.json({ items: cached, cached: true });

      const snap = await db
        .collection("orgs")
        .doc(orgId)
        .collection("schedules")
        .orderBy("startDate", "asc")
        .limit(50)
        .get();
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      await cache.set(`schedules:${orgId}`, items, 30); // 30s TTL
      return res.json({ items, cached: false });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: "internal_server_error" });
    }
  },
);

app.listen(Number(env.PORT), () => {
  console.log(`[api] listening on :${env.PORT}`);
});
