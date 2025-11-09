// [P1][API][CODE] Provider
// Tags: P1, API, CODE

/**
 * @description Defines the contract for a cache provider, specifying the methods for getting, setting, and deleting cache entries.
 */
export interface CacheProvider {
  /**
   * @description Retrieves a value from the cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {Promise<T | null>} A promise that resolves with the cached value, or null if the key is not found.
   * @template T
   */
  get<T = unknown>(key: string): Promise<T | null>;
  /**
   * @description Stores a value in the cache.
   * @param {string} key - The key to store the value under.
   * @param {T} value - The value to store.
   * @param {number} [ttlSec] - The time-to-live for the cache entry in seconds.
   * @returns {Promise<void>} A promise that resolves when the value has been stored.
   * @template T
   */
  set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void>;
  /**
   * @description Deletes a value from the cache.
   * @param {string} key - The key of the item to delete.
   * @returns {Promise<void>} A promise that resolves when the value has been deleted.
   */
  del(key: string): Promise<void>;
}

/**
 * @description An in-memory implementation of the CacheProvider interface.
 * This class stores cache entries in a Map and is suitable for single-process applications or testing.
 */
export class InMemoryCache implements CacheProvider {
  private store = new Map<string, { v: unknown; exp: number | null }>();

  /**
   * @description Retrieves a value from the in-memory cache.
   * @param {string} key - The key of the item to retrieve.
   * @returns {Promise<T | null>} A promise that resolves with the cached value, or null if the key is not found or has expired.
   * @template T
   */
  async get<T>(key: string): Promise<T | null> {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.exp && Date.now() > e.exp) {
      this.store.delete(key);
      return null;
    }
    return e.v as T;
  }

  /**
   * @description Stores a value in the in-memory cache.
   * @param {string} key - The key to store the value under.
   * @param {T} value - The value to store.
   * @param {number} [ttlSec] - The time-to-live for the cache entry in seconds.
   * @returns {Promise<void>} A promise that resolves when the value has been stored.
   * @template T
   */
  async set<T>(key: string, value: T, ttlSec?: number) {
    const exp = ttlSec ? Date.now() + ttlSec * 1000 : null;
    this.store.set(key, { v: value, exp });
  }

  /**
   * @description Deletes a value from the in-memory cache.
   * @param {string} key - The key of the item to delete.
   * @returns {Promise<void>} A promise that resolves when the value has been deleted.
   */
  async del(key: string) {
    this.store.delete(key);
  }
}
