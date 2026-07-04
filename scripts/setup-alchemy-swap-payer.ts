#!/usr/bin/env bun
/**
 * Show the Alchemy/local x402 swap payer address and USDC balance.
 * No Coinbase CDP verification required.
 *
 * Uses (in order): X402_SWAP_PAYER_PRIVATE_KEY → ALCHEMY_WALLET_KEY → PRIVATE_KEY
 * RPC: BASE_RPC_URL → Alchemy Base URL from ALCHEMY_API_KEY → public Base RPC
 *
 * Run: bun run setup:alchemy-swap-payer
 */

import { createPublicClient, formatUnits, http } from "viem";
import { base } from "viem/chains";
import { probeAlchemySwapPayer } from "../src/lib/swap/zerox-x402-server.ts";
import {
  getExpectedAlchemyPayerAddress,
  isAlchemyPayerAddressMismatch,
  isAlchemyX402PayerConfigured,
  resolveAlchemyX402PayerKey,
} from "../src/lib/server/alchemy-config.ts";
import { privateKeyToAccount } from "viem/accounts";

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
] as const;

async function main() {
  if (!isAlchemyX402PayerConfigured()) {
    console.error("No x402 payer key found. Add one of these to .env:");
    console.error("  ALCHEMY_WALLET_KEY=0x...   (recommended — from `alchemy wallet generate`)");
    console.error("  PRIVATE_KEY=0x...          (your existing Alchemy agent wallet)");
    console.error("  X402_SWAP_PAYER_PRIVATE_KEY=0x...  (dedicated hot wallet)");
    console.error("\nAlso set ALCHEMY_API_KEY for reliable Base RPC reads.");
    process.exit(1);
  }

  const expected = getExpectedAlchemyPayerAddress();
  if (expected && isAlchemyPayerAddressMismatch()) {
    const key = resolveAlchemyX402PayerKey();
    const actual = key ? privateKeyToAccount(key).address : "unknown";
    console.error("Alchemy payer address mismatch:\n");
    console.error(`  ALCHEMY_PUBLIC_WALLET_ADDRESS: ${expected}`);
    console.error(`  Key resolves to:               ${actual}`);
    console.error("\nAdd ALCHEMY_WALLET_KEY with the private key for your agent wallet.");
    console.error("Sync from Alchemy CLI local wallet: bun run sync:alchemy-cli-wallet");
    console.error("  alchemy wallet connect --mode local");
    process.exit(1);
  }

  const { address, source, rpcUrl, expectedAddress } = probeAlchemySwapPayer();
  const sourceLabel =
    source === "alchemy_wallet"
      ? "ALCHEMY_WALLET_KEY"
      : source === "private_key"
        ? "PRIVATE_KEY"
        : "X402_SWAP_PAYER_PRIVATE_KEY";

  console.log("Alchemy x402 swap payer\n");
  console.log(`  Key source: ${sourceLabel}`);
  console.log(`  Payer address: ${address}`);
  if (expectedAddress) {
    console.log(`  Expected (ALCHEMY_PUBLIC_WALLET_ADDRESS): ${expectedAddress}`);
  }
  console.log(`  RPC: ${rpcUrl.replace(/\/v2\/[^/]+$/, "/v2/***")}`);
  console.log(`  BaseScan: https://basescan.org/address/${address}`);

  const client = createPublicClient({ chain: base, transport: http(rpcUrl) });
  try {
    const [balance, decimals] = await Promise.all([
      client.readContract({
        address: USDC_BASE,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      }),
      client.readContract({
        address: USDC_BASE,
        abi: ERC20_ABI,
        functionName: "decimals",
      }),
    ]);
    console.log(`  USDC on Base: ${formatUnits(balance, decimals)}`);
  } catch (error) {
    console.warn("  USDC balance check failed:", error instanceof Error ? error.message : error);
  }

  console.log("\nNext steps:");
  console.log("  1. Send USDC on Base to the payer address (~$5–10 to start)");
  console.log("  2. Redeploy: bun run deploy:vps");
  console.log("  3. Verify: curl https://pepe.buildingcultureid.space/api/swap/status");
  console.log('     → {"configured":true,"mode":"x402","payer":"alchemy",...}');

  if (source === "private_key") {
    console.log(
      "\nTip: For production, prefer ALCHEMY_WALLET_KEY or X402_SWAP_PAYER_PRIVATE_KEY so deploy keys stay separate.",
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
