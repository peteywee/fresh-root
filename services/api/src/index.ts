import express, { type Request, type Response } from "express";

import { InMemoryCache } from "./cache/provider.js";
import { RedisCache } from "./cache/redis.js";
import { loadEnv } from "./env.js";
import { initFirebase } from "./firebase.js";
import { requireAuth, requireManager, sameOrgGuard } from "./rbac.js";

const env = loadEnv();
const { db } = initFirebase(env.FIREBASE_PROJECT_ID);

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
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true, env: env.NODE_ENV }));

// Example: create a schedule (manager-only, same org)
app.post(
  "/orgs/:orgId/schedules",
  requireAuth,
  sameOrgGuard(req => req.params.orgId),
  requireManager,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const { startDate } = req.body ?? {};
      if (typeof startDate !== "number") return res.status(400).json({ error: "startDate (number) required" });

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
  }
);

// Example: list schedules (members of org)
app.get(
  "/orgs/:orgId/schedules",
  requireAuth,
  sameOrgGuard(req => req.params.orgId),
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const cached = await cache.get<any[]>(`schedules:${orgId}`);
      if (cached) return res.json({ items: cached, cached: true });

      const snap = await db.collection("orgs").doc(orgId).collection("schedules").orderBy("startDate", "asc").limit(50).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      await cache.set(`schedules:${orgId}`, items, 30); // 30s TTL
      return res.json({ items, cached: false });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: "internal_server_error" });
    }
  }
);

app.listen(Number(env.PORT), () => {
  console.log(`[api] listening on :${env.PORT}`);
});
