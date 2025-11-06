// [P2][APP][CODE] Cache
// Tags: P2, APP, CODE
import {
  unstable_cache as nextCache,
  revalidateTag,
  unstable_noStore as noStore,
} from "next/cache";

export type CacheCfg = { tag?: string; ttl?: number; noStore?: boolean };

/**
 * Wrap an async fetcher into a cached function with an optional tag and TTL.
 * Use `invalidate(tag)` after a write to refresh consumers.
 */
export function cached<TArgs extends unknown[], TRes>(
  key: string,
  fn: (...args: TArgs) => Promise<TRes>,
  cfg: CacheCfg = {},
) {
  const { tag, ttl, noStore: skip } = cfg;
  if (skip) {
    return async (...args: TArgs) => {
      noStore(); // opt out entirely
      return fn(...args);
    };
  }
  const tags = tag ? [tag] : undefined;
  const wrapped = nextCache(fn, [key], { revalidate: ttl ?? 60, tags });
  return (...args: TArgs) => wrapped(...args);
}

export function invalidate(tag: string) {
  "use server";
  revalidateTag(tag, {});
}
