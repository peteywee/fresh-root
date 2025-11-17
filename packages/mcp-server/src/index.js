// [P2][APP][CODE] Index
// Tags: P2, APP, CODE
/**


Minimal MCP-like stdio JSON-RPC server (read-only).


Methods:



repo.search { q: string, globs?: string[] }




repo.read   { path: string }




repo.paths  { globs?: string[] }
*/
import fg from "fast-glob";
import { parse, success, error } from "jsonrpc-lite";
import fs from "node:fs/promises";
import { createInterface } from "node:readline";
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
async function repoSearch(q, globs = ["/*"]) {
    const paths = await fg(globs, {
        dot: true,
        ignore: ["node_modules/", ".pnpm-store/", ".git/", ".next/", "dist/"],
    });
    const res = [];
    for (const p of paths) {
        if (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".woff"))
            continue;
        const text = await fs.readFile(p, "utf8").catch(() => "");
        if (!text)
            continue;
        const lines = text.split("\n");
        lines.forEach((ln, i) => {
            if (ln.toLowerCase().includes(q.toLowerCase()))
                res.push({ path: p, line: i + 1, text: ln.trim() });
        });
    }
    return res.slice(0, 500);
}
async function repoRead(path) {
    const text = await fs.readFile(path, "utf8");
    if (path.startsWith(".env"))
        return "[REDACTED_ENV]";
    return text;
}
async function repoPaths(globs = ["/*"]) {
    return await fg(globs, {
        dot: true,
        ignore: ["node_modules/", ".pnpm-store/", ".git/", ".next/", "dist/"],
    });
}
async function dispatch(req) {
    const { method, params } = req;
    if (method === "repo.search") {
        const p = (params ?? {});
        return await repoSearch(p.q ?? "", p.globs);
    }
    if (method === "repo.read") {
        const p = (params ?? {});
        return await repoRead(p.path);
    }
    if (method === "repo.paths") {
        const p = (params ?? {});
        return await repoPaths(p.globs);
    }
    throw new Error(`Unknown method: ${method}`);
}
rl.on("line", async (line) => {
    try {
        const parsed = parse(line);
        if (parsed.type !== "request")
            return;
        const req = parsed.payload;
        const result = await dispatch(req);
        process.stdout.write(JSON.stringify(success(req.id ?? null, result)) + "\n");
    }
    catch (e) {
        const message = e instanceof Error ? e.message : "Internal error";
        process.stdout.write(JSON.stringify(error(null, { code: -32603, message })) + "\n");
    }
});
