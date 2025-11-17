// [P2][APP][CODE] Cache
// Tags: P2, APP, CODE
import { unstable_cache as nextCache, revalidateTag, unstable_noStore as noStore, } from "next/cache";
/**
 * Wrap an async fetcher into a cached function with an optional tag and TTL.
 * Use `invalidate(tag)` after a write to refresh consumers.
 */
export function cached(key, fn, cfg = {}) {
    const { tag, ttl, noStore: skip } = cfg;
    if (skip) {
        return async (...args) => {
            noStore(); // opt out entirely
            return fn(...args);
        };
    }
    const tags = tag ? [tag] : undefined;
    const wrapped = nextCache(fn, [key], { revalidate: ttl ?? 60, tags });
    return (...args) => wrapped(...args);
}
export function invalidate(tag) {
    "use server";
    revalidateTag(tag, {});
}
