#!/usr/bin/env bun
/**
 * Deploy StackXISquad + PredictionPool to Base mainnet.
 * Requires: BASE_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY, BASE_RPC_URL (server-side only)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createWalletClient, createPublicClient, http, type Abi, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const BASE_PRICE = 770_000n; // $0.77 USDC
const PRICE_INCREMENT = 70_000n; // +$0.07 per mint
const EARLY_BELIEVER_LIMIT = 11n; // founding 11

function loadArtifact(name: string): { abi: Abi; bytecode: Hex } {
  const path = join(process.cwd(), "contracts/out", `${name}.sol`, `${name}.json`);
  if (!existsSync(path)) {
    throw new Error(`Artifact not found at ${path}. Run: forge build`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    abi: Abi;
    bytecode: { object: Hex };
  };
  return { abi: raw.abi, bytecode: raw.bytecode.object };
}

async function main() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const deployPool = process.env.DEPLOY_POOL !== "0";

  if (!privateKey?.startsWith("0x")) {
    console.error("Set BASE_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY (0x…) in .env — server-side only.");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as Hex);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });

  console.log("Deployer:", account.address);
  console.log("RPC:", rpcUrl);

  const squadArtifact = loadArtifact("StackXISquad");

  console.log("\nDeploying StackXISquad v2 (bonding curve)…");
  console.log(`  Base price: $0.77 (${BASE_PRICE})`);
  console.log(`  Increment:  $0.07 (${PRICE_INCREMENT}) per mint`);

  const squadHash = await walletClient.deployContract({
    abi: squadArtifact.abi,
    bytecode: squadArtifact.bytecode,
    args: [USDC_BASE, BASE_PRICE, PRICE_INCREMENT, EARLY_BELIEVER_LIMIT],
  });
  const squadReceipt = await publicClient.waitForTransactionReceipt({ hash: squadHash });
  const squadAddress = squadReceipt.contractAddress;
  if (!squadAddress) throw new Error("StackXISquad deployment failed");

  console.log("StackXISquad:", squadAddress);

  let poolAddress = process.env.VITE_PREDICTION_POOL_ADDRESS;

  if (deployPool) {
    const poolArtifact = loadArtifact("PredictionPool");
    console.log("\nDeploying PredictionPool…");
    const poolHash = await walletClient.deployContract({
      abi: poolArtifact.abi,
      bytecode: poolArtifact.bytecode,
      args: [USDC_BASE],
    });
    const poolReceipt = await publicClient.waitForTransactionReceipt({ hash: poolHash });
    poolAddress = poolReceipt.contractAddress ?? undefined;
    if (!poolAddress) throw new Error("PredictionPool deployment failed");
    console.log("PredictionPool:", poolAddress);
  } else {
    console.log("\nSkipping PredictionPool (DEPLOY_POOL=0 or use existing)");
    console.log("Existing pool:", poolAddress ?? "none");
  }

  console.log("\n--- Add to .env ---");
  console.log(`VITE_SQUAD_NFT_ADDRESS=${squadAddress}`);
  if (poolAddress?.startsWith("0x")) {
    console.log(`VITE_PREDICTION_POOL_ADDRESS=${poolAddress}`);
  }
  console.log(`VITE_MINT_BASE_PRICE_USDC=${BASE_PRICE}`);
  console.log(`VITE_MINT_PRICE_INCREMENT_USDC=${PRICE_INCREMENT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
