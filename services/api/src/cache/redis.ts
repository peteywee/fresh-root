// [P1][API][CODE] Redis
// Tags: P1, API, CODE
import { createClient, type RedisClientType } from "redis";

import type { CacheProvider } from "./provider.js";

export class RedisCache implements CacheProvider {
  private client: RedisClientType;

  private constructor(client: RedisClientType) {
    this.client = client;
  }

  static async connect(url: string) {
    const client: RedisClientType = createClient({ url });
    client.on("error", (e: unknown) => console.error("[redis] error", e));
    await client.connect();
    return new RedisCache(client);
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    if (v == null) return null;
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSec && ttlSec > 0) await this.client.set(key, payload, { EX: ttlSec });
    else await this.client.set(key, payload);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
