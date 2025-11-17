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

type Req = { id: string | number | null; method: string; params?: unknown };
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
async function repoSearch(q: string, globs: string[] = ["/*"]) {
  const paths = await fg(globs, {
    dot: true,
    ignore: ["node_modules/", ".pnpm-store/", ".git/", ".next/", "dist/"],
  });
  const res: Array<{ path: string; line: number; text: string }> = [];
  for (const p of paths) {
    if (p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".woff")) continue;
    const text = await fs.readFile(p, "utf8").catch(() => "");
    if (!text) continue;
    const lines = text.split("\n");
    lines.forEach((ln, i) => {
      if (ln.toLowerCase().includes(q.toLowerCase()))
        res.push({ path: p, line: i + 1, text: ln.trim() });
    });
  }
  return res.slice(0, 500);
}
async function repoRead(path: string) {
  const text = await fs.readFile(path, "utf8");
  if (path.startsWith(".env")) return "[REDACTED_ENV]";
  return text;
}
async function repoPaths(globs: string[] = ["/*"]) {
  return await fg(globs, {
    dot: true,
    ignore: ["node_modules/", ".pnpm-store/", ".git/", ".next/", "dist/"],
  });
}
type SearchParams = { q?: string; globs?: string[] };
type ReadParams = { path: string };
type PathsParams = { globs?: string[] };

async function dispatch(req: Req) {
  const { method, params } = req;
  if (method === "repo.search") {
    const p = (params ?? {}) as SearchParams;
    return await repoSearch(p.q ?? "", p.globs);
  }
  if (method === "repo.read") {
    const p = (params ?? {}) as ReadParams;
    return await repoRead(p.path);
  }
  if (method === "repo.paths") {
    const p = (params ?? {}) as PathsParams;
    return await repoPaths(p.globs);
  }
  throw new Error(`Unknown method: ${method}`);
}
rl.on("line", async (line) => {
  try {
    const parsed = parse(line) as { type: string; payload?: unknown };
    if (parsed.type !== "request") return;
    const req = parsed.payload as Req;
    const result = await dispatch(req);
    process.stdout.write(JSON.stringify(success(req.id ?? null, result)) + "\n");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error";
    process.stdout.write(JSON.stringify(error(null, { code: -32603, message })) + "\n");
  }
});
