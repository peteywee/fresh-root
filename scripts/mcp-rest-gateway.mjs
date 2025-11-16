// [P1][MCP][API] MCP REST Gateway - HTTP Server Wrapper for MCP
// Tags: MCP, API, GATEWAY

import http from "http";
import url from "url";
import { WebSocket } from "ws";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = process.env.MCP_BASE_DIR || path.resolve(__dirname, "..");

const REST_PORT = parseInt(process.env.REST_PORT || "4242", 10);
const MCP_WS_URL = process.env.MCP_WS_URL || "ws://localhost:5173/mcp";
const MCP_TOKEN = process.env.MCP_TOKEN || "dev-token-change-in-production";
const MCP_GATEWAY_API_KEY = process.env.MCP_GATEWAY_API_KEY || null;

/**
 * HTTP REST Gateway for MCP Server
 * Provides synchronous HTTP endpoints that wrap async MCP WebSocket calls.
 */

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Authenticate with API key (if configured)
  if (MCP_GATEWAY_API_KEY) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== MCP_GATEWAY_API_KEY) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: "Invalid or missing API key" }));
      return;
    }
  }

  try {
    if (pathname === "/health") {
      res.writeHead(200);
      res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
      return;
    }

    if (pathname === "/mcp/read" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { path: filePath } = JSON.parse(body);
          if (!filePath) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "path is required" }));
            return;
          }
          const result = await mcpRequest("read:" + filePath);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (pathname === "/mcp/write" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { path: filePath, content } = JSON.parse(body);
          if (!filePath || !content) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "path and content are required" }));
            return;
          }
          const result = await mcpRequest("write:" + filePath, content);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    if (pathname === "/mcp/shell" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { command } = JSON.parse(body);
          if (!command) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "command is required" }));
            return;
          }
          const result = await mcpRequest("shell:" + command);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not Found" }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }
});

/**
 * Send a command to the MCP server via WebSocket
 */
function mcpRequest(command, args = null) {
  return new Promise((resolve, reject) => {
    const workspace = process.env.MCP_WORKSPACE || REPO_ROOT;
    const wsUrl = new URL(MCP_WS_URL);
    wsUrl.searchParams.set("token", MCP_TOKEN);
    wsUrl.searchParams.set("workspace", workspace);

    const ws = new WebSocket(wsUrl.toString());
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("MCP request timeout"));
    }, 10000);

    ws.on("open", () => {
      const payload = {
        id: Date.now(),
        command,
        args: args ? [args] : [],
      };
      ws.send(JSON.stringify(payload));
    });

    ws.on("message", (data) => {
      clearTimeout(timeout);
      try {
        const response = JSON.parse(data.toString());
        resolve(response);
      } catch (err) {
        reject(new Error(`Failed to parse MCP response: ${data}`));
      } finally {
        ws.close();
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    ws.on("close", () => {
      clearTimeout(timeout);
    });
  });
}

server.listen(REST_PORT, "localhost", () => {
  console.log(`\n🚀 MCP REST Gateway running at http://localhost:${REST_PORT}`);
  console.log(`   MCP WebSocket: ${MCP_WS_URL}`);
  console.log(`   Workspace: ${process.env.MCP_WORKSPACE || REPO_ROOT}`);
  console.log(`   API Key Protection: ${MCP_GATEWAY_API_KEY ? "✓ Enabled" : "✗ Disabled"}\n`);
  console.log("Available endpoints:");
  console.log("  POST /mcp/read     - Read a file");
  console.log("  POST /mcp/write    - Write a file");
  console.log("  POST /mcp/shell    - Execute shell command");
  console.log("  GET  /health       - Health check");
  console.log("\nAuthentication:");
  if (MCP_GATEWAY_API_KEY) {
    console.log(`  Header: x-api-key: ${MCP_GATEWAY_API_KEY.substring(0, 16)}...`);
  } else {
    console.log("  ⚠️  No API key configured (set MCP_GATEWAY_API_KEY env var)\n");
  }
});
