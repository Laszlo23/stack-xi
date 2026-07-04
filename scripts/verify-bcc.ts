#!/usr/bin/env bun
/**
 * Verify BCC token on Base + Clanker liquidity links.
 * Usage: bun run scripts/verify-bcc.ts
 */
import { createPublicClient, formatUnits, http } from "viem";
import { base } from "viem/chains";

const BCC_DEFAULT = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;

const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
] as const;

async function main() {
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const bcc = (process.env.VITE_BCC_TOKEN_ADDRESS ?? BCC_DEFAULT) as `0x${string}`;
  const client = createPublicClient({ chain: base, transport: http(rpcUrl) });

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    client.readContract({ address: bcc, abi: ERC20_ABI, functionName: "name" }),
    client.readContract({ address: bcc, abi: ERC20_ABI, functionName: "symbol" }),
    client.readContract({ address: bcc, abi: ERC20_ABI, functionName: "decimals" }),
    client.readContract({ address: bcc, abi: ERC20_ABI, functionName: "totalSupply" }),
  ]);

  const isClankerVanity = bcc.toLowerCase().endsWith("b07");

  console.log("BCC token verification\n");
  console.log("  Address:", bcc);
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals);
  console.log("  Total supply:", formatUnits(totalSupply, decimals), symbol);
  console.log("  Clanker vanity (…b07):", isClankerVanity ? "yes" : "no");
  console.log("\nBuy / swap links");
  console.log("  Clanker:", `https://clanker.world/clanker/${bcc}`);
  console.log("  Base App:", `https://base.app/coin/base-mainnet/${bcc}`);
  console.log("  Uniswap:", `https://app.uniswap.org/swap?chain=base&outputCurrency=${bcc}`);
  console.log("  BaseScan:", `https://basescan.org/token/${bcc}`);

  if (decimals !== 18) {
    console.warn("\n⚠ Expected 18 decimals for BCC payment contracts.");
    process.exit(1);
  }

  console.log("\n✓ BCC token readable on Base");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
