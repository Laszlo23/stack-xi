#!/usr/bin/env bun
/**
 * Prediction window + market schedule smoke tests.
 * Run: bun run test:prediction-window
 */

import { getPredictionWindow, isPredictionSubmitAllowed } from "../src/lib/predict/match-window.ts";
import {
  getActiveMarket,
  getActiveMarketKind,
  WORLD_CUP_END_AT,
} from "../src/lib/story/match-markets.ts";
import { DALLAS_SCHEDULE } from "../src/lib/story/dallas-schedule.ts";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ ${message}`);
    failed += 1;
  }
}

console.log("Prediction window tests\n");

const portugalSpain = DALLAS_SCHEDULE.find((m) => m.id === "m8")!;
const twoDaysBefore = new Date(portugalSpain.kickoffAt.getTime() - 2 * 24 * 60 * 60 * 1000);
const windowBeforeKickoff = getPredictionWindow(portugalSpain, twoDaysBefore);

assert(windowBeforeKickoff.status === "open", "window open 2 days before kickoff (default)");
assert(isPredictionSubmitAllowed(windowBeforeKickoff), "submit allowed before kickoff");

const afterKickoff = new Date(portugalSpain.kickoffAt.getTime() + 60_000);
const windowClosed = getPredictionWindow(portugalSpain, afterKickoff);
assert(windowClosed.status === "closed", "window closed after kickoff");
assert(!isPredictionSubmitAllowed(windowClosed), "submit blocked after kickoff");

const active = getActiveMarket(twoDaysBefore);
assert(active.id === "m8", "active market is Portugal vs Spain before WC end");

const afterWc = new Date(WORLD_CUP_END_AT.getTime() + 60_000);
assert(
  getActiveMarketKind(afterWc) === "austrian_bundesliga",
  "switches to Austrian league after WC",
);
assert(getActiveMarket(afterWc).home.includes("Rapid"), "Rapid Wien featured after WC");

console.log(`\n${failed === 0 ? "All prediction window checks passed" : `${failed} failed`}`);
process.exit(failed > 0 ? 1 : 0);
