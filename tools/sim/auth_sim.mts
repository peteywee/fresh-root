#!/usr/bin/env ts-node
// [P0][AUTH][CODE] Auth Sim
// Tags: P0, AUTH, CODE
/**


10,000-trial Monte Carlo for Auth + Onboarding + Publish/Notify


Outputs written to ./reports (gitignored).


Adjust probabilities as real data accumulates.
*/
import fs from "node:fs";

type Flow = "email_link" | "google_popup" | "google_redirect";
type Onb = "create_org" | "join_token" | "join_search";
type Cfg = {
  flow: Flow;
  mobile: boolean;
  callback_middleware_exempt: boolean;
  email_link_valid: boolean;
  auth_domain_ok: boolean;
  authorized_domain_ok: boolean;
  oauth_redirect_uri_ok: boolean;
  stored_email_before_link: boolean;
  double_get_redirect_result: boolean;
  onboarding_path: Onb;
  token_valid: boolean;
  creator_is_admin: boolean;
  approval_mode: "instant" | "delayed" | "manual_missing";
  needs_claims_refresh: boolean;
  has_profile: boolean;
  has_membership: boolean;
  publish_clicked: boolean;
  inbox_available: boolean;
  receipts_enabled: boolean;
};
type Res = { success: boolean; failure?: string };
const N = 10_000;
const rand = (p: number) => Math.random() < p;
function sample(): Cfg {
  let flow: Flow =
    Math.random() < 0.45 ? "email_link" : Math.random() < 0.64 ? "google_popup" : "google_redirect";
  const mobile = rand(0.3);
  if (mobile && flow === "google_popup") flow = "google_redirect";
  return {
    flow,
    mobile,
    callback_middleware_exempt: !rand(0.02),
    email_link_valid: !rand(0.05),
    auth_domain_ok: !rand(0.03),
    authorized_domain_ok: !rand(0.03),
    oauth_redirect_uri_ok: !rand(0.04),
    stored_email_before_link: !rand(0.02),
    double_get_redirect_result: rand(0.03),
    onboarding_path:
      Math.random() < 0.55 ? "create_org" : Math.random() < 0.78 ? "join_token" : "join_search",
    token_valid: !rand(0.08),
    creator_is_admin: !rand(0.06),
    approval_mode:
      Math.random() < 0.65 ? "instant" : Math.random() < 0.86 ? "delayed" : "manual_missing",
    needs_claims_refresh: rand(0.35),
    has_profile: !rand(0.2),
    has_membership: !rand(0.2),
    publish_clicked: rand(0.85),
    inbox_available: !rand(0.05),
    receipts_enabled: !rand(0.04),
  };
}
function simulate(c: Cfg, fixes: boolean): Res {
  if (c.flow === "email_link") {
    if (!c.callback_middleware_exempt && !fixes)
      return { success: false, failure: "CALLBACK_BLOCKED" };
    if (!c.email_link_valid) return { success: false, failure: "EMAIL_LINK_EXPIRED" };
    if (!c.auth_domain_ok) return { success: false, failure: "AUTH_DOMAIN_MISMATCH" };
    if (!c.authorized_domain_ok) return { success: false, failure: "UNAUTHORIZED_DOMAIN" };
    if (!c.stored_email_before_link && !fixes)
      return { success: false, failure: "MISSING_LOGIN_EMAIL" };
  } else {
    if (!c.oauth_redirect_uri_ok) return { success: false, failure: "OAUTH_REDIRECT_URI" };
    if (c.flow === "google_redirect" && !c.callback_middleware_exempt && !fixes)
      return { success: false, failure: "CALLBACK_BLOCKED" };
    if (c.double_get_redirect_result && !fixes) return { success: false, failure: "DOUBLE_RESULT" };
  }
  if (!c.has_membership) {
    if (c.onboarding_path === "join_token") {
      if (!c.token_valid) return { success: false, failure: "TOKEN_INVALID" };
      if (!c.creator_is_admin && !fixes)
        return { success: false, failure: "TOKEN_CREATOR_NOT_MANAGER" };
    }
    if (c.approval_mode === "manual_missing" && !fixes)
      return { success: false, failure: "APPROVAL_MISSING" };
    if (c.needs_claims_refresh && !fixes) return { success: false, failure: "CLAIMS_STALE" };
  }
  if (c.publish_clicked) {
    if (!c.inbox_available) return { success: false, failure: "INBOX_UNAVAILABLE" };
    if (!c.receipts_enabled) return { success: false, failure: "RECEIPTS_DISABLED" };
  }
  return { success: true };
}
function run(n: number, fixes: boolean) {
  const rows: any[] = [];
  const counts: Record<string, number> = {};
  let ok = 0;
  for (let i = 1; i <= n; i++) {
    const cfg = sample();
    const r = simulate(cfg, fixes);
    if (r.success) ok++;
    else counts[r.failure!] = (counts[r.failure!] || 0) + 1;
    rows.push({ trial: i, success: r.success, failure: r.failure || "", cfg });
  }
  const summary = {
    trials: n,
    success: ok,
    success_rate_pct: +((ok * 100) / n).toFixed(2),
    failures: n - ok,
    failure_breakdown: Object.entries(counts).sort((a, b) => b[1] - a[1]),
  };
  return { rows, summary };
}
fs.mkdirSync("./reports", { recursive: true });
const base = run(N, false);
const fixd = run(N, true);
fs.writeFileSync("./reports/montecarlo_10k_baseline.json", JSON.stringify(base.summary, null, 2));
fs.writeFileSync("./reports/montecarlo_10k_with_fixes.json", JSON.stringify(fixd.summary, null, 2));
console.log("Reports written (gitignored).");
// Monte Carlo simulation for auth/onboarding flows
// Run with: pnpm dlx tsx tools/sim/auth_sim.mts

interface SimResult {
  success: boolean;
  duration: number;
  errors: string[];
}

async function simulateAuthFlow(iterations: number = 10000): Promise<SimResult[]> {
  const results: SimResult[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const errors: string[] = [];

    try {
      // Simulate random auth scenarios
      const scenario = Math.random();

      if (scenario < 0.3) {
        // Google popup success
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
      } else if (scenario < 0.6) {
        // Email link success
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 200));
      } else if (scenario < 0.8) {
        // Session creation
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));
      } else {
        // Error case
        errors.push("Simulated auth failure");
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 300));
      }

      results.push({
        success: errors.length === 0,
        duration: Date.now() - start,
        errors,
      });
    } catch (e) {
      results.push({
        success: false,
        duration: Date.now() - start,
        errors: [String(e)],
      });
    }
  }

  return results;
}

async function main() {
  console.log("Running auth/onboarding Monte Carlo simulation...");
  const results = await simulateAuthFlow(10000);

  const successes = results.filter((r) => r.success);
  const failures = results.filter((r) => !r.success);

  console.log(`Total simulations: ${results.length}`);
  console.log(`Success rate: ${((successes.length / results.length) * 100).toFixed(2)}%`);
  console.log(
    `Average duration: ${results.reduce((a, b) => a + b.duration, 0) / results.length}ms`,
  );
  console.log(`Max duration: ${Math.max(...results.map((r) => r.duration))}ms`);

  if (failures.length > 0) {
    console.log(`Failures: ${failures.length}`);
    console.log(
      "Sample errors:",
      failures
        .slice(0, 5)
        .map((f) => f.errors)
        .flat(),
    );
  }

  // Exit with error if success rate < 95%
  if (successes.length / results.length < 0.95) {
    console.error("❌ Auth simulation failed: success rate below 95%");
    process.exit(1);
  }

  console.log("✅ Auth simulation passed");
}

main().catch(console.error);
