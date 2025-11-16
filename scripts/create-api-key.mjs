// [P1][API][CODE] Create Api Key
// Tags: P1, API, CODE
import { randomBytes } from "node:crypto";
import { existsSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Simple CLI to generate an API key for the GPT MCP Gateway.
 *
 * - Generates a 32-byte hex key.
 * - Prints it to stdout.
 * - If .env.local exists in CWD, appends MCP_GATEWAY_API_KEY=<key>.
 *
 * Usage:
 *   node scripts/create-api-key.mjs
 */
function generateApiKey(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

function main() {
  const key = generateApiKey();

  console.log("\n=== GPT MCP Gateway API Key ===\n");
  console.log(key);
  console.log("\n================================\n");

  const envPath = resolve(process.cwd(), ".env.local");

  if (existsSync(envPath)) {
    const line = `MCP_GATEWAY_API_KEY=${key}\n`;

    try {
      appendFileSync(envPath, line, { encoding: "utf8" });
      console.log(`✔ .env.local found. Appended line:\nMCP_GATEWAY_API_KEY=${key}\n`);
    } catch (err) {
      console.error("✖ Failed to update .env.local:", err);
      console.log(
        "\nAdd the following line to your environment manually:\n" + `MCP_GATEWAY_API_KEY=${key}\n`,
      );
    }
  } else {
    console.log(
      "ℹ .env.local not found in current directory.\n" +
        "Create it (if you haven't) and add this line:\n\n" +
        `MCP_GATEWAY_API_KEY=${key}\n`,
    );
  }

  console.log(
    "Next steps:\n" +
      "1) Ensure your gateway reads process.env.MCP_GATEWAY_API_KEY.\n" +
      "2) In GPT Actions, configure API key auth using header:\n" +
      "   x-api-key: <the key above>\n",
  );
}

main();
