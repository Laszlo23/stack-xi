#!/usr/bin/env bun
/**
 * Deploy StackXISquad + PredictionPool to Base mainnet (BCC payment token).
 * Requires: BASE_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY, BASE_RPC_URL (server-side only)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  createWalletClient,
  createPublicClient,
  http,
  type Abi,
  type Hex,
  formatUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const BCC_DEFAULT = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;
const BCC_UNIT = 10n ** 18n;
/** 770 BCC opening mint — mirrors legacy $0.77 curve anchor */
const BASE_PRICE = 770n * BCC_UNIT;
/** +70 BCC per mint */
const PRICE_INCREMENT = 70n * BCC_UNIT;
const EARLY_BELIEVER_LIMIT = 11n;

const ERC20_ABI = [
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const satisfies Abi;

function loadArtifact(name: string): { abi: Abi; bytecode: Hex } {
  const path = join(process.cwd(), "contracts/out", `${name}.sol`, `${name}.json`);
  if (!existsSync(path)) {
    throw new Error(`Artifact not found at ${path}. Run: bun run contracts:build`);
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
  const bccAddress = (process.env.VITE_BCC_TOKEN_ADDRESS ?? BCC_DEFAULT) as `0x${string}`;

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

  const [symbol, decimals] = await Promise.all([
    publicClient.readContract({ address: bccAddress, abi: ERC20_ABI, functionName: "symbol" }),
    publicClient.readContract({ address: bccAddress, abi: ERC20_ABI, functionName: "decimals" }),
  ]);

  console.log("Deployer:", account.address);
  console.log("RPC:", rpcUrl);
  console.log("Payment token:", bccAddress, `(${symbol}, ${decimals} decimals)`);
  console.log("Clanker page:", `https://clanker.world/clanker/${bccAddress}`);

  const squadArtifact = loadArtifact("StackXISquad");

  console.log("\nDeploying StackXISquad (BCC bonding curve)…");
  console.log(`  Base price:   ${formatUnits(BASE_PRICE, decimals)} ${symbol}`);
  console.log(`  Increment:    ${formatUnits(PRICE_INCREMENT, decimals)} ${symbol} per mint`);

  const squadHash = await walletClient.deployContract({
    abi: squadArtifact.abi,
    bytecode: squadArtifact.bytecode,
    args: [bccAddress, BASE_PRICE, PRICE_INCREMENT, EARLY_BELIEVER_LIMIT],
  });
  const squadReceipt = await publicClient.waitForTransactionReceipt({ hash: squadHash });
  const squadAddress = squadReceipt.contractAddress;
  if (!squadAddress) throw new Error("StackXISquad deployment failed");

  console.log("StackXISquad:", squadAddress);

  let poolAddress = process.env.VITE_PREDICTION_POOL_ADDRESS as `0x${string}` | undefined;

  if (deployPool) {
    const poolArtifact = loadArtifact("PredictionPool");
    console.log("\nDeploying PredictionPool (BCC stakes)…");
    const poolHash = await walletClient.deployContract({
      abi: poolArtifact.abi,
      bytecode: poolArtifact.bytecode,
      args: [bccAddress],
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
  console.log(`VITE_BCC_TOKEN_ADDRESS=${bccAddress}`);
  console.log(`VITE_SQUAD_NFT_ADDRESS=${squadAddress}`);
  if (poolAddress?.startsWith("0x")) {
    console.log(`VITE_PREDICTION_POOL_ADDRESS=${poolAddress}`);
  }
  console.log(`VITE_MINT_BASE_PRICE_BCC=${BASE_PRICE}`);
  console.log(`VITE_MINT_PRICE_INCREMENT_BCC=${PRICE_INCREMENT}`);
  console.log(
    "\nTreasury: mint fees go to contract owner — transfer ownership to treasury multisig if needed.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
