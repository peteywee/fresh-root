export interface CacheProvider {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class InMemoryCache implements CacheProvider {
  private store = new Map<string, { v: unknown; exp: number | null }>();
  async get<T>(key: string): Promise<T | null> {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.exp && Date.now() > e.exp) { this.store.delete(key); return null; }
    return e.v as T;
  }
  async set<T>(key: string, value: T, ttlSec?: number) {
    const exp = ttlSec ? Date.now() + ttlSec * 1000 : null;
    this.store.set(key, { v: value, exp });
  }
  async del(key: string) { this.store.delete(key); }
}
