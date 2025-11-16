// [P2][APP][CODE] Vscode Mcp Server
// Tags: P2, APP, CODE
import { WebSocketServer } from "ws";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { URL } from "url";

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// By default, the repo root is the parent of the directory containing this script.
const REPO_ROOT = process.env.MCP_BASE_DIR || path.resolve(__dirname, "..");

const MCP_PORT = parseInt(process.env.MCP_PORT || "5173", 10);
const MCP_BIND_HOST = process.env.MCP_BIND_HOST || "localhost"; // Default to localhost for security
const REQUIRED_TOKEN = process.env.MCP_TOKEN || null;
const ALLOWED_WORKSPACES = (process.env.MCP_ALLOWED_WORKSPACES || "")
  .split(",")
  .filter(Boolean)
  .map((p) => path.resolve(REPO_ROOT, p));
const ALLOW_SHELL_EXEC = process.env.MCP_ALLOW_SHELL === "true";

// --- Utility Functions ---

/**
 * Resolves a path safely against a base directory, preventing path traversal attacks.
 * @param {string} baseDir The secure base directory.
 * @param {string} userPath The user-provided path.
 * @returns {string} The resolved, safe path.
 */
function resolveSafePath(baseDir, userPath) {
  const resolved = path.resolve(baseDir, userPath);
  if (!resolved.startsWith(baseDir)) {
    throw new Error("Path traversal attempt blocked.");
  }
  return resolved;
}

// --- WebSocket Server ---
const wss = new WebSocketServer({ port: MCP_PORT, host: MCP_BIND_HOST, path: "/mcp" });

wss.on("connection", (ws, req) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const token = requestUrl.searchParams.get("token");
    const workspacePath = requestUrl.searchParams.get("workspace");

    // 1. Authenticate
    if (REQUIRED_TOKEN && token !== REQUIRED_TOKEN) {
      ws.close(4001, "Unauthorized: Invalid token.");
      return;
    }

    // 2. Authorize Workspace
    if (!workspacePath) {
      ws.close(4000, "Bad Request: Workspace path is required.");
      return;
    }
    const resolvedWorkspace = path.resolve(workspacePath);
    if (ALLOWED_WORKSPACES.length > 0 && !ALLOWED_WORKSPACES.includes(resolvedWorkspace)) {
      ws.close(4001, `Unauthorized: Workspace '${workspacePath}' is not in the allowed list.`);
      return;
    }
    // Attach the secure, resolved base directory to this specific connection.
    ws.BASE_DIR = resolvedWorkspace;
    console.log(`Client connected and authorized for workspace: ${ws.BASE_DIR}`);

    ws.on("message", async (msg) => {
      try {
        const { id, command, args } = JSON.parse(msg.toString());
        const [type, target] = command.split(":");

        let responsePayload;

        switch (type) {
          case "write":
            const safeWritePath = resolveSafePath(ws.BASE_DIR, target);
            await fs.mkdir(path.dirname(safeWritePath), { recursive: true });
            await fs.writeFile(safeWritePath, args.join("\n"));
            responsePayload = { success: true, output: `Wrote to ${safeWritePath}` };
            break;

          case "read":
            const safeReadPath = resolveSafePath(ws.BASE_DIR, target);
            const content = await fs.readFile(safeReadPath, "utf-8");
            responsePayload = { success: true, output: content };
            break;

          case "shell":
            if (!ALLOW_SHELL_EXEC) {
              throw new Error("Shell execution is disabled on this server.");
            }
            // Ensure shell commands invoked via the MCP server inherit a conservative Node memory limit
            const execEnv = { ...process.env };
            if (!execEnv.NODE_OPTIONS) execEnv.NODE_OPTIONS = "--max-old-space-size=1024";
            exec(target, { cwd: ws.BASE_DIR, env: execEnv }, (error, stdout, stderr) => {
              ws.send(
                JSON.stringify({
                  id,
                  response: {
                    success: !error,
                    output: stdout,
                    error: error ? stderr : undefined,
                  },
                }),
              );
            });
            return; // Return early as exec is async

          default:
            throw new Error(`Unknown command type: ${type}`);
        }
        ws.send(JSON.stringify({ id, response: responsePayload }));
      } catch (err) {
        ws.send(JSON.stringify({ id, response: { success: false, error: err.message } }));
      }
    });
  } catch (err) {
    console.error("Connection setup failed:", err);
    ws.close(5000, "Internal Server Error during setup.");
  }
});

console.log(`VS Code MCP Server running at ws://${MCP_BIND_HOST}:${MCP_PORT}/mcp`);
console.log(`- Token protection: ${REQUIRED_TOKEN ? "Enabled" : "Disabled"}`);
console.log(`- Shell execution: ${ALLOW_SHELL_EXEC ? "Enabled" : "Disabled"}`);
console.log(`- Base directory context: ${REPO_ROOT}`);
if (ALLOWED_WORKSPACES.length > 0) {
  console.log("- Allowed Workspaces:", ALLOWED_WORKSPACES);
}
