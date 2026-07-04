#!/usr/bin/env bun
/**
 * Swap config smoke test — no live 0x calls.
 * Run: bun run test:swap-config
 */

import {
  getSwapMode,
  isX402PayerConfigured,
  isZeroXConfigured,
} from "../src/lib/swap/zerox-proxy.ts";
import {
  buildAerodromePoolUrl,
  buildBaseAppSwapUrl,
  buildUniswapSwapUrl,
} from "../src/lib/swap/swap-deeplinks.ts";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ ${message}`);
    failed += 1;
  }
}

console.log("Swap config tests\n");

const mode = getSwapMode();
assert(["api_key", "x402", "deeplink_only"].includes(mode), `swap mode is valid: ${mode}`);

if (process.env.ZEROX_API_KEY) {
  assert(mode === "api_key", "ZEROX_API_KEY → api_key mode");
} else if (process.env.X402_SWAP_PAYER_PRIVATE_KEY?.startsWith("0x")) {
  assert(mode === "x402", "X402_SWAP_PAYER_PRIVATE_KEY → x402 mode");
  assert(isX402PayerConfigured(), "x402 payer detected");
} else {
  assert(mode === "deeplink_only", "no keys → deeplink_only mode");
  assert(!isZeroXConfigured(), "not configured without keys");
}

const uni = buildUniswapSwapUrl("usdc-bcc", "10");
assert(uni.includes("uniswap.org"), "Uniswap deeplink builds");
assert(uni.includes("exactAmount=10"), "Uniswap amount prefilled");

const baseApp = buildBaseAppSwapUrl();
assert(baseApp.includes("base.app") || baseApp.includes("coin"), "Base App deeplink builds");

const aero = buildAerodromePoolUrl();
assert(aero.includes("aerodrome.finance"), "Aerodrome deeplink builds");

console.log(`\n${failed === 0 ? "All swap config checks passed" : `${failed} failed`}`);
process.exit(failed > 0 ? 1 : 0);
