#!/usr/bin/env bun
/**
 * BCC flow configuration + on-chain read smoke tests.
 * Run: bun run test:bcc-flows
 */
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import {
  BCC_TOKEN_ADDRESS,
  BCC_UNIT,
  MINT_BASE_PRICE_BCC,
  MINT_PRICE_INCREMENT_BCC,
  STAKE_TIERS_BCC,
} from "../src/lib/base/config.ts";
import { SITE_LINKS } from "../src/lib/site/links.ts";

const SQUAD_ABI = [
  {
    type: "function",
    name: "BCC",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "currentMintPrice",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const POOL_ABI = [
  {
    type: "function",
    name: "bcc",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${message}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${message}`);
  }
}

async function main() {
  console.log("BCC flow tests\n");

  const squad = process.env.VITE_SQUAD_NFT_ADDRESS;
  const pool = process.env.VITE_PREDICTION_POOL_ADDRESS;
  const bcc = process.env.VITE_BCC_TOKEN_ADDRESS ?? BCC_TOKEN_ADDRESS;

  assert(squad?.startsWith("0x") ?? false, "VITE_SQUAD_NFT_ADDRESS configured");
  assert(pool?.startsWith("0x") ?? false, "VITE_PREDICTION_POOL_ADDRESS configured");
  assert(bcc.startsWith("0x"), "BCC token address valid");

  assert(MINT_BASE_PRICE_BCC === 770n * BCC_UNIT, "mint base price uses 18 decimals");
  assert(MINT_PRICE_INCREMENT_BCC === 70n * BCC_UNIT, "mint increment uses 18 decimals");
  assert(
    STAKE_TIERS_BCC.every((t) => t.amount % BCC_UNIT === 0n),
    "stake tiers use BCC_UNIT",
  );

  assert(SITE_LINKS.bccDexScreener.includes("dexscreener.com"), "DexScreener link configured");
  assert(SITE_LINKS.bccClanker.includes("clanker.world"), "Clanker link configured");

  const rpc = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const client = createPublicClient({ chain: base, transport: http(rpc) });

  if (squad?.startsWith("0x")) {
    const [bccOnSquad, price, mintCount] = await Promise.all([
      client.readContract({ address: squad as `0x${string}`, abi: SQUAD_ABI, functionName: "BCC" }),
      client.readContract({
        address: squad as `0x${string}`,
        abi: SQUAD_ABI,
        functionName: "currentMintPrice",
      }),
      client.readContract({
        address: squad as `0x${string}`,
        abi: SQUAD_ABI,
        functionName: "mintCount",
      }),
    ]);
    assert(bccOnSquad.toLowerCase() === bcc.toLowerCase(), "squad contract uses BCC");
    const expectedPrice = MINT_BASE_PRICE_BCC + mintCount * MINT_PRICE_INCREMENT_BCC;
    assert(
      price === expectedPrice,
      `squad mint price matches bonding curve (${mintCount} mints)`,
    );
  }

  if (pool?.startsWith("0x")) {
    const bccOnPool = await client.readContract({
      address: pool as `0x${string}`,
      abi: POOL_ABI,
      functionName: "bcc",
    });
    assert(bccOnPool.toLowerCase() === bcc.toLowerCase(), "prediction pool uses BCC");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
