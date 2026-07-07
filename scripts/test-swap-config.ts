#!/usr/bin/env bun
/**
 * Swap config smoke test — no live 0x calls.
 * Run: bun run test:swap-config
 */

import {
  getExpectedAlchemyPayerAddress,
  isAlchemyPayerAddressMismatch,
} from "../src/lib/server/alchemy-config.ts";
import {
  getSwapMode,
  getX402PayerKind,
  isSwapConfigured,
  isX402PayerConfigured,
} from "../src/lib/swap/zerox-proxy.ts";
import {
  buildAerodromePoolUrl,
  buildBaseAppSwapUrl,
  buildUniswapSwapUrl,
} from "../src/lib/swap/swap-deeplinks.ts";
import {
  BASE_CHAIN_ID,
  isAllowedLifiChain,
  isAllowedLifiToToken,
  isLifiConfigured,
  isLifiSwapEnabled,
  LIFI_ALLOWED_CHAIN_IDS,
} from "../src/lib/swap/lifi-config.ts";
import { BCC_TOKEN_ADDRESS } from "../src/lib/base/config.ts";

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
assert(["api_key", "x402", "direct", "deeplink_only"].includes(mode), `swap mode is valid: ${mode}`);

if (process.env.ZEROX_API_KEY) {
  assert(mode === "api_key", "ZEROX_API_KEY → api_key mode");
} else if (process.env.SWAP_MODE === "direct" || process.env.VITE_SWAP_MODE === "direct") {
  assert(mode === "direct", "SWAP_MODE=direct → direct mode");
  assert(isSwapConfigured(), "direct mode is configured");
} else if (process.env.SWAP_MODE === "deeplink" || process.env.SWAP_MODE === "deeplink_only") {
  assert(mode === "deeplink_only", "SWAP_MODE=deeplink → deeplink_only");
  assert(!isSwapConfigured(), "deeplink_only is not configured for in-app swap");
} else if (process.env.SWAP_USE_ZEROX === "1" && process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET && process.env.CDP_WALLET_SECRET) {
  assert(mode === "x402", "SWAP_USE_ZEROX=1 + CDP credentials → x402 mode");
  assert(getX402PayerKind() === "cdp", "CDP payer detected");
  assert(isX402PayerConfigured(), "x402 payer configured via CDP");
} else if (
  process.env.SWAP_USE_ZEROX === "1" &&
  (process.env.ALCHEMY_WALLET_KEY?.startsWith("0x") ||
    process.env.PRIVATE_KEY?.startsWith("0x") ||
    process.env.X402_SWAP_PAYER_PRIVATE_KEY?.startsWith("0x"))
) {
  const mismatch = isAlchemyPayerAddressMismatch();
  if (mismatch && getExpectedAlchemyPayerAddress()) {
    assert(mode === "x402", "SWAP_USE_ZEROX=1 + wallet key present but mismatched expected address");
    assert(!isSwapConfigured(), "mismatched payer → not configured for x402");
    assert(isAlchemyPayerAddressMismatch(), "payer mismatch detected");
  } else {
    assert(mode === "x402", "SWAP_USE_ZEROX=1 + Alchemy/local wallet key → x402 mode");
    assert(getX402PayerKind() === "alchemy" || getX402PayerKind() === "hot_wallet", "alchemy payer detected");
    assert(isX402PayerConfigured(), "x402 payer configured");
    assert(isSwapConfigured(), "fully configured for in-app swap");
  }
} else if (
  process.env.ALCHEMY_WALLET_KEY?.startsWith("0x") ||
  process.env.PRIVATE_KEY?.startsWith("0x") ||
  process.env.X402_SWAP_PAYER_PRIVATE_KEY?.startsWith("0x")
) {
  assert(mode === "direct", "wallet key without SWAP_USE_ZEROX → direct mode (default)");
  assert(isSwapConfigured(), "direct mode configured without 0x API");
} else {
  assert(mode === "direct", "no keys → direct mode by default");
  assert(isSwapConfigured(), "direct mode works without server keys");
}

const uni = buildUniswapSwapUrl("usdc-bcc", "10");
assert(uni.includes("uniswap.org"), "Uniswap deeplink builds");
assert(uni.includes("exactAmount=10"), "Uniswap amount prefilled");

const baseApp = buildBaseAppSwapUrl();
assert(baseApp.includes("base.app") || baseApp.includes("coin"), "Base App deeplink builds");

const aero = buildAerodromePoolUrl();
assert(aero.includes("aerodrome.finance"), "Aerodrome deeplink builds");

console.log("\nLI.FI config\n");

assert(BASE_CHAIN_ID === 8453, "LI.FI Base chain id is 8453");
assert(LIFI_ALLOWED_CHAIN_IDS.length === 5, "LI.FI allows 5 chains");
assert(isAllowedLifiChain(42161), "Arbitrum allowed for LI.FI");
assert(!isAllowedLifiChain(56), "BSC not allowed for LI.FI");
assert(
  isAllowedLifiToToken(BASE_CHAIN_ID, BCC_TOKEN_ADDRESS),
  "BCC allowed as LI.FI destination on Base",
);

if (process.env.LIFI_API_KEY) {
  assert(isLifiConfigured(), "LIFI_API_KEY → isLifiConfigured()");
} else {
  assert(!isLifiConfigured(), "no LIFI_API_KEY → not configured");
}

const lifiEnabled = isLifiSwapEnabled();
if (process.env.VITE_LIFI_SWAP_ENABLED === "0" || process.env.VITE_LIFI_SWAP_ENABLED === "false") {
  assert(!lifiEnabled, "VITE_LIFI_SWAP_ENABLED=0 disables LI.FI");
} else {
  assert(lifiEnabled, "LI.FI swap enabled by default");
}

console.log(`\n${failed === 0 ? "All swap config checks passed" : `${failed} failed`}`);
process.exit(failed > 0 ? 1 : 0);
