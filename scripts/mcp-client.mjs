// [P1][MCP][INFRASTRUCTURE] MCP Client - HTTP Wrapper for MCP Server
// Tags: MCP, CLIENT, API

import http from "http";
import url from "url";

/**
 * Simple HTTP client for MCP Server.
 * Wraps WebSocket communication in HTTP endpoints.
 *
 * Usage:
 *   node scripts/mcp-client.mjs <command> [args...]
 *
 * Commands:
 *   read <path>               - Read a file
 *   write <path> <content>    - Write a file
 *   shell <cmd>               - Execute shell command
 */

const MCP_HOST = process.env.MCP_HOST || "localhost";
const MCP_PORT = parseInt(process.env.MCP_PORT || "5173", 10);
const MCP_TOKEN = process.env.MCP_TOKEN || "dev-token-change-in-production";
const WORKSPACE = process.env.MCP_WORKSPACE || process.cwd();

async function makeRequest(command, target, args = null) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams({
      token: MCP_TOKEN,
      workspace: WORKSPACE,
    });

    const options = {
      hostname: MCP_HOST,
      port: MCP_PORT,
      path: `/mcp?${query.toString()}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", reject);

    const payload = {
      id: Date.now(),
      command,
      args: args ? [args] : [],
    };

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  const [, , cmd, ...args] = process.argv;

  if (!cmd) {
    console.error("Usage: node mcp-client.mjs <command> [args...]");
    console.error("Commands: read <path>, write <path> <content>, shell <cmd>");
    process.exit(1);
  }

  try {
    let result;
    switch (cmd) {
      case "read": {
        if (!args[0]) throw new Error("read requires <path>");
        result = await makeRequest(`read:${args[0]}`);
        console.log(result.response?.output || result.response?.error);
        break;
      }
      case "write": {
        if (!args[0] || !args[1]) throw new Error("write requires <path> <content>");
        result = await makeRequest(`write:${args[0]}`, args.slice(1).join(" "));
        console.log(result.response?.output || result.response?.error);
        break;
      }
      case "shell": {
        if (!args[0]) throw new Error("shell requires <cmd>");
        result = await makeRequest(`shell:${args.join(" ")}`);
        console.log(result.response?.output || result.response?.error);
        break;
      }
      default:
        throw new Error(`Unknown command: ${cmd}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
