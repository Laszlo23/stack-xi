#!/usr/bin/env bun
/**
 * Security smoke tests — swap allowlist, cast validation, prediction window.
 * Run: bun run security:check
 */

import {
  validateCastText,
  validateSwapPair,
  validateSellAmount,
} from "../src/lib/swap/validate-swap-params.ts";
import { BCC_TOKEN_ADDRESS, USDC_ADDRESS } from "../src/lib/base/config.ts";
import { ETH_PLACEHOLDER } from "../src/lib/swap/swap-config.ts";
import { getPredictionWindow, isPredictionSubmitAllowed } from "../src/lib/predict/match-window.ts";
import { DALLAS_SCHEDULE } from "../src/lib/story/dallas-schedule.ts";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) console.log(`  ✓ ${message}`);
  else {
    console.error(`  ✗ ${message}`);
    failed += 1;
  }
}

console.log("Security checks\n");

const usdcBcc = validateSwapPair(USDC_ADDRESS, BCC_TOKEN_ADDRESS);
assert(usdcBcc.ok, "USDC → BCC pair allowed");

const ethBcc = validateSwapPair(ETH_PLACEHOLDER, BCC_TOKEN_ADDRESS);
assert(ethBcc.ok, "ETH → BCC pair allowed");

const randomPair = validateSwapPair(BCC_TOKEN_ADDRESS, USDC_ADDRESS);
assert(!randomPair.ok, "BCC → USDC pair blocked");

assert(validateSellAmount("1000000").ok, "valid sell amount");
assert(!validateSellAmount("abc").ok, "invalid sell amount rejected");
assert(!validateCastText("x".repeat(321)).ok, "oversized cast rejected");

const m8 = DALLAS_SCHEDULE.find((m) => m.id === "m8")!;
const beforeKickoff = new Date(m8.kickoffAt.getTime() - 86_400_000);
const openWindow = getPredictionWindow(m8, beforeKickoff);
assert(isPredictionSubmitAllowed(openWindow), "submit allowed before kickoff (default)");

console.log(`\n${failed === 0 ? "All security checks passed" : `${failed} failed`}`);
process.exit(failed > 0 ? 1 : 0);
