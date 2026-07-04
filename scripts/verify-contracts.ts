#!/usr/bin/env bun
/**
 * Verify deployed StackXISquad + PredictionPool read BCC payment token.
 */
import { createPublicClient, formatUnits, http } from "viem";
import { base } from "viem/chains";

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
  {
    type: "function",
    name: "remainingPlayers",
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

async function main() {
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const squad = process.env.VITE_SQUAD_NFT_ADDRESS as `0x${string}` | undefined;
  const pool = process.env.VITE_PREDICTION_POOL_ADDRESS as `0x${string}` | undefined;
  const expectedBcc = (process.env.VITE_BCC_TOKEN_ADDRESS ??
    "0xb890a5289f789f1346032ccc1847939e855fab07") as `0x${string}`;

  const client = createPublicClient({ chain: base, transport: http(rpcUrl) });

  if (!squad?.startsWith("0x")) {
    console.error("Set VITE_SQUAD_NFT_ADDRESS in .env");
    process.exit(1);
  }

  const [bccOnSquad, price, mintCount, remaining] = await Promise.all([
    client.readContract({ address: squad, abi: SQUAD_ABI, functionName: "BCC" }),
    client.readContract({ address: squad, abi: SQUAD_ABI, functionName: "currentMintPrice" }),
    client.readContract({ address: squad, abi: SQUAD_ABI, functionName: "mintCount" }),
    client.readContract({ address: squad, abi: SQUAD_ABI, functionName: "remainingPlayers" }),
  ]);

  console.log("StackXISquad:", squad);
  console.log("  BCC token:", bccOnSquad);
  console.log("  Current mint price:", formatUnits(price, 18), "BCC");
  console.log("  Minted:", mintCount.toString(), "| Remaining:", remaining.toString());

  if (bccOnSquad.toLowerCase() !== expectedBcc.toLowerCase()) {
    console.error(`\n✗ Squad BCC mismatch — expected ${expectedBcc}`);
    process.exit(1);
  }

  if (pool?.startsWith("0x")) {
    const bccOnPool = await client.readContract({
      address: pool,
      abi: POOL_ABI,
      functionName: "bcc",
    });
    console.log("\nPredictionPool:", pool);
    console.log("  BCC token:", bccOnPool);
    if (bccOnPool.toLowerCase() !== expectedBcc.toLowerCase()) {
      console.error(`\n✗ Pool BCC mismatch — expected ${expectedBcc}`);
      process.exit(1);
    }
  } else {
    console.log("\nPredictionPool: not configured");
  }

  console.log("\n✓ Contracts use BCC payment token");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
