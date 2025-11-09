// [P1][API][CODE] Redis
// Tags: P1, API, CODE
import { createClient, type RedisClientType } from "redis";

import type { CacheProvider } from "./provider.js";

/**
 * @description A Redis-backed implementation of the CacheProvider interface.
 * This class uses the 'redis' package to connect to a Redis server and perform cache operations.
 */
export class RedisCache implements CacheProvider {
  private client: RedisClientType;

  private constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * @description Creates a new RedisCache instance and connects to the Redis server.
   * @param {string} url - The connection URL for the Redis server.
   * @returns {Promise<RedisCache>} A promise that resolves with a new RedisCache instance.
   */
  static async connect(url: string) {
    const client: RedisClientType = createClient({ url });
    client.on("error", (e: unknown) => console.error("[redis] error", e));
    await client.connect();
    return new RedisCache(client);
  }

  /**
   * @description Retrieves a value from the Redis cache.
   * The value is assumed to be stored as a JSON string.
   * @param {string} key - The key of the item to retrieve.
   * @returns {Promise<T | null>} A promise that resolves with the parsed value, or null if the key is not found or parsing fails.
   * @template T
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    if (v == null) return null;
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  }

  /**
   * @description Stores a value in the Redis cache.
   * The value is serialized to a JSON string before being stored.
   * @param {string} key - The key to store the value under.
   * @param {T} value - The value to store.
   * @param {number} [ttlSec] - The time-to-live for the cache entry in seconds.
   * @returns {Promise<void>} A promise that resolves when the value has been stored.
   * @template T
   */
  async set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSec && ttlSec > 0) await this.client.set(key, payload, { EX: ttlSec });
    else await this.client.set(key, payload);
  }

  /**
   * @description Deletes a value from the Redis cache.
   * @param {string} key - The key of the item to delete.
   * @returns {Promise<void>} A promise that resolves when the value has been deleted.
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
