// [P2][APP][CODE] Cache
// Tags: P2, APP, CODE
import {
  unstable_cache as nextCache,
  revalidateTag,
  unstable_noStore as noStore,
} from "next/cache";

export type CacheCfg = { tag?: string; ttl?: number; noStore?: boolean };

/**
 * Wraps an asynchronous function with Next.js caching.
 *
 * @template TArgs - The type of the arguments for the function.
 * @template TRes - The type of the result of the function.
 * @param {string} key - A unique key for the cached function.
 * @param {(...args: TArgs) => Promise<TRes>} fn - The asynchronous function to be cached.
 * @param {CacheCfg} [cfg={}] - The cache configuration.
 * @returns {Function} The wrapped, cached function.
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

/**
 * Invalidates a cache tag, forcing revalidation of all cached items with that tag.
 *
 * @param {string} tag - The cache tag to invalidate.
 */
export function invalidate(tag: string) {
  "use server";
  revalidateTag(tag, {});
}
