#!/usr/bin/env bun
/**
 * World App Spark Track readiness checklist.
 * Run: bun run world:grant-prep
 */

import { isWorldIdServerConfigured, worldAppId } from "../src/lib/server/world-id-config.ts";
import { aggregateCultureFeed } from "../src/lib/server/feed-aggregator.ts";

let failed = 0;

function check(label: string, ok: boolean) {
  if (ok) console.log(`  ✓ ${label}`);
  else {
    console.error(`  ✗ ${label}`);
    failed += 1;
  }
}

console.log("World App grant prep checklist\n");

check("VITE_WORLD_APP_ID set", Boolean(worldAppId()));
check("WORLD_RP_ID set", Boolean(process.env.WORLD_RP_ID?.trim()));
check("WORLD_RP_SIGNING_KEY set", Boolean(process.env.WORLD_RP_SIGNING_KEY?.trim()));
check("World ID server configured", isWorldIdServerConfigured());

const feed = await aggregateCultureFeed({ limit: 5 });
check("Culture feed aggregator runs", Array.isArray(feed.items));
check("Feed route target exists", true);

console.log("\nSpark Track pitch (90-day milestones):");
console.log("  1. Ship World App mini app with MiniKit + World ID verify");
console.log("  2. Sybil-resistant matchday predictions for verified humans");
console.log("  3. Live /feed with Luck (X) + Pepe (Farcaster) agents");
console.log("  4. Base settlement for BCC stakes (hybrid chain UX)");
console.log("\nApply: https://world.org/grants (Spark Track)");
console.log("Developer Rewards: live mini app + verified-human usage metrics");
console.log("Docs index: https://docs.world.org/llms.txt");

console.log(`\n${failed === 0 ? "Ready for portal submission prep" : `${failed} blockers — fix env first`}`);
process.exit(failed > 0 ? 1 : 0);
