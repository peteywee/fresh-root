export class InMemoryCache {
    store = new Map();
    async get(key) {
        const e = this.store.get(key);
        if (!e)
            return null;
        if (e.exp && Date.now() > e.exp) {
            this.store.delete(key);
            return null;
        }
        return e.v;
    }
    async set(key, value, ttlSec) {
        const exp = ttlSec ? Date.now() + ttlSec * 1000 : null;
        this.store.set(key, { v: value, exp });
    }
    async del(key) {
        this.store.delete(key);
    }
}
