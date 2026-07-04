#!/usr/bin/env bun
/**
 * Create or fetch the CDP x402 swap payer wallet and print funding instructions.
 *
 * Prerequisites (in .env — never commit):
 *   CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
 *
 * Run: bun run setup:cdp-swap-payer
 * @see https://docs.cdp.coinbase.com/wallets/quickstart/api-key-auth
 */

import { createPublicClient, formatUnits, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { probeCdpSwapPayer } from "../src/lib/swap/zerox-x402-server.ts";
import { isCdpConfigured } from "../src/lib/server/cdp-config.ts";

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

async function readUsdcBalance(
  chain: typeof base | typeof baseSepolia,
  address: `0x${string}`,
): Promise<string> {
  const usdc = chain.id === base.id ? USDC_BASE : ("0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const);
  const client = createPublicClient({
    chain,
    transport: http(process.env.BASE_RPC_URL ?? chain.rpcUrls.default.http[0]),
  });
  const [balance, decimals] = await Promise.all([
    client.readContract({ address: usdc, abi: ERC20_ABI, functionName: "balanceOf", args: [address] }),
    client.readContract({ address: usdc, abi: ERC20_ABI, functionName: "decimals" }),
  ]);
  return formatUnits(balance, decimals);
}

function missingEnv(): string[] {
  const keys = ["CDP_API_KEY_ID", "CDP_API_KEY_SECRET", "CDP_WALLET_SECRET"] as const;
  return keys.filter((key) => !process.env[key]?.trim());
}

async function main() {
  const missing = missingEnv();
  if (missing.length > 0) {
    console.error("Missing CDP credentials in .env:");
    for (const key of missing) console.error(`  - ${key}`);
    console.error("\nSetup checklist:");
    console.error("  1. portal.cdp.coinbase.com → create account + verify email");
    console.error("  2. API Keys → Secret API Key (Ed25519, Non-custodial Export + Manage)");
    console.error("  3. Wallets → Non-custodial security → Generate Wallet Secret (shown once)");
    process.exit(1);
  }

  if (!isCdpConfigured()) {
    console.error("CDP credentials incomplete.");
    process.exit(1);
  }

  console.log("CDP x402 swap payer setup\n");

  const { address, name } = await probeCdpSwapPayer();
  console.log(`  Account name: ${name}`);
  console.log(`  Payer address: ${address}`);
  console.log(`  BaseScan: https://basescan.org/address/${address}`);

  try {
    const usdc = await readUsdcBalance(base, address);
    console.log(`  USDC on Base: ${usdc}`);
  } catch (error) {
    console.warn("  USDC balance check failed:", error instanceof Error ? error.message : error);
  }

  console.log("\nNext steps:");
  console.log("  1. Send USDC on Base to the payer address (~$5–10 to start)");
  console.log("  2. Redeploy: bun run deploy:vps");
  console.log("  3. Verify: curl https://pepe.buildingcultureid.space/api/swap/status");
  console.log('     → {"configured":true,"mode":"x402","payer":"cdp",...}');
  console.log("\nOptional testnet smoke (Base Sepolia):");
  console.log("  - Use CDP faucet from the quickstart on a separate dev payer if needed");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
