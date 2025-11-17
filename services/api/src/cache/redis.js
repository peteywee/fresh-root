// [P1][API][CODE] Redis
// Tags: P1, API, CODE
import { createClient } from "redis";
export class RedisCache {
    client;
    constructor(client) {
        this.client = client;
    }
    static async connect(url) {
        const client = createClient({ url });
        client.on("error", (e) => console.error("[redis] error", e));
        await client.connect();
        return new RedisCache(client);
    }
    async get(key) {
        const v = await this.client.get(key);
        if (v == null)
            return null;
        try {
            return JSON.parse(v);
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSec) {
        const payload = JSON.stringify(value);
        if (ttlSec && ttlSec > 0)
            await this.client.set(key, payload, { EX: ttlSec });
        else
            await this.client.set(key, payload);
    }
    async del(key) {
        await this.client.del(key);
    }
}
