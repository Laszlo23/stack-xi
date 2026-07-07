#!/usr/bin/env node
/**
 * Match-ops agent tick — polls score feed or syncs ticker for active match.
 * Usage: node scripts/match-ops-tick.mjs [--dry-run]
 */
const baseUrl =
  process.env.MATCH_OPS_TICK_URL?.trim() ||
  process.env.PEPE_AGENT_TICK_URL?.trim() ||
  "http://127.0.0.1:3000";

const dryRun = process.argv.includes("--dry-run");
const secret = process.env.ADMIN_SECRET || process.env.PEPE_AGENT_ADMIN_SECRET;

async function main() {
  const url = `${baseUrl}/api/agents/match-ops/tick${dryRun ? "?dryRun=1" : ""}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) {
    headers["x-admin-secret"] = secret;
  }

  const res = await fetch(url, { method: "POST", headers });
  const body = await res.text();
  console.log(res.status, body);
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
