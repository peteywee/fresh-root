/**
 * Ultra-lightweight web server for Test Intelligence GUI
 * Zero framework bloat, pure Node.js http server
 */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { orchestrator } from "./orchestrator";
import { aiPrioritizer } from "./ai-test-prioritizer";
import { predictiveAnalytics } from "./predictive-analytics";
import { parallelizationOptimizer } from "./parallelization-optimizer";
import { securityScanner } from "./security-scanner";
import { testDataFactory } from "./test-data-factory";
import { glob } from "glob";
import { githubSync } from "./github-sync";

const PORT = process.env.PORT || 3456;
const clients = new Set<http.ServerResponse>();

// SSE for real-time updates (lighter than WebSocket)
const sendEvent = (event: string, data: any) => {
  const payload = `data: ${JSON.stringify({ event, data })}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(payload);
    } catch (err) {
      clients.delete(client);
    }
  });
};

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || "/", true);
  const pathname = parsedUrl.pathname || "/";

  // CORS for ChromeOS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // SSE endpoint for real-time updates
  if (pathname === "/api/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  // API endpoints
  if (pathname.startsWith("/api/")) {
    const apiPath = pathname.replace("/api/", "");

    try {
      let data: any = {};

      switch (apiPath) {
        case "status":
          data = { status: "running", version: "1.0.0", uptime: process.uptime() };
          break;

        case "run":
          sendEvent("status", "Running full test suite...");
          const result = await orchestrator.runFull();
          sendEvent("complete", result);
          data = result;
          break;

        case "run/quick":
          sendEvent("status", "Running quick validation...");
          const quickResult = await orchestrator.runQuick();
          sendEvent("complete", quickResult);
          data = quickResult;
          break;

        case "prioritize":
          const testFiles = await glob("tests/**/*.test.ts");
          const changedFiles = await aiPrioritizer.getChangedFiles();
          const priorities = aiPrioritizer.prioritizeTests(testFiles.slice(0, 50), changedFiles);
          data = {
            priorities: priorities.slice(0, 20),
            total: priorities.length,
            highRisk: priorities.filter((p) => p.failureProbability > 0.5).length,
          };
          break;

        case "predict":
          const tests = await glob("tests/**/*.test.ts");
          const predictions = predictiveAnalytics.predictFailures(tests.slice(0, 50));
          const insights = predictiveAnalytics.generateInsights();
          data = { predictions: predictions.slice(0, 20), insights };
          break;

        case "parallel":
          const allTests = await glob("tests/**/*.test.ts");
          const optimization = parallelizationOptimizer.optimize(allTests.slice(0, 50));
          data = optimization;
          break;

        case "security":
          sendEvent("status", "Running security scan...");
          const scanResult = await securityScanner.scan(["apps/web/app/api"]);
          sendEvent("security", scanResult);
          data = scanResult;
          break;

        case "data":
          const count = parseInt(parsedUrl.query.count as string) || 5;
          data = { users: testDataFactory.generateUsers(count) };
          break;

        case "github/sync":
          sendEvent("status", "Syncing GitHub repository...");
          const repo = await githubSync.syncCurrentRepo();
          data = repo || { message: "Not a git repository" };
          break;

        case "github/repos":
          data = { repos: githubSync.getRepos(), stats: githubSync.getStats() };
          break;

        case "github/commits":
          const commits = await githubSync.getRecentCommits(20);
          data = { commits };
          break;

        case "github/pull":
          sendEvent("status", "Pulling latest changes...");
          const pullResult = await githubSync.pullLatest();
          sendEvent("status", pullResult.message);
          data = pullResult;
          break;

        default:
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Not found" }));
          return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } catch (err: any) {
      sendEvent("error", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Serve static files
  let filePath = pathname === "/" ? "/dashboard.html" : pathname;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("404 Not Found");
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Test Intelligence Dashboard`);
  console.log(`═══════════════════════════════════════════════════════════════════`);
  console.log(`\n📊 Dashboard: ${`http://localhost:${PORT}`}`);
  console.log(`🔧 API: ${`http://localhost:${PORT}/api/status`}`);
  console.log(`\n💡 Press Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down gracefully...");
  server.close();
  process.exit(0);
});
