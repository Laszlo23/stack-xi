#!/usr/bin/env bun
/**
 * Deploy StackXISquadV2 blind-pack contract to Base mainnet (BCC payment token).
 * Requires: BASE_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY, BASE_RPC_URL
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
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
const BASE_PRICE = 770n * BCC_UNIT;
const PRICE_INCREMENT = 7n * BCC_UNIT;
const EARLY_BELIEVER_LIMIT = 77n;

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

function upsertEnvVar(key: string, value: string) {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    console.log(`(no .env file — add manually: ${key}=${value})`);
    return;
  }
  const raw = readFileSync(envPath, "utf8");
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const next = pattern.test(raw) ? raw.replace(pattern, line) : `${raw.trimEnd()}\n${line}\n`;
  writeFileSync(envPath, next);
  console.log(`Updated .env: ${key}`);
}

async function main() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
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

  const squadArtifact = loadArtifact("StackXISquadV2");

  console.log("\nDeploying StackXISquadV2 (blind pack, 847 supply)…");
  console.log(`  Base price:   ${formatUnits(BASE_PRICE, decimals)} ${symbol}`);
  console.log(`  Increment:    ${formatUnits(PRICE_INCREMENT, decimals)} ${symbol} per pack`);
  console.log(`  Early limit:  ${EARLY_BELIEVER_LIMIT} global minters (+1 joker each)`);

  const squadHash = await walletClient.deployContract({
    abi: squadArtifact.abi,
    bytecode: squadArtifact.bytecode,
    args: [bccAddress, BASE_PRICE, PRICE_INCREMENT, EARLY_BELIEVER_LIMIT],
  });
  const squadReceipt = await publicClient.waitForTransactionReceipt({ hash: squadHash });
  const squadAddress = squadReceipt.contractAddress;
  if (!squadAddress) throw new Error("StackXISquadV2 deployment failed");

  console.log("\nStackXISquadV2:", squadAddress);
  console.log("BaseScan:", `https://basescan.org/address/${squadAddress}`);

  upsertEnvVar("VITE_SQUAD_NFT_V2_ADDRESS", squadAddress);
  upsertEnvVar("VITE_SQUAD_V2_MAX_PER_PLAYER", "77");
  upsertEnvVar("VITE_SQUAD_V2_PRICE_INCREMENT_BCC", PRICE_INCREMENT.toString());
  upsertEnvVar("VITE_SQUAD_V2_BASE_PRICE_BCC", BASE_PRICE.toString());

  console.log("\n--- Add to production env if not auto-written ---");
  console.log(`VITE_SQUAD_NFT_V2_ADDRESS=${squadAddress}`);
  console.log(`VITE_SQUAD_V2_MAX_PER_PLAYER=77`);
  console.log(`VITE_SQUAD_V2_PRICE_INCREMENT_BCC=${PRICE_INCREMENT}`);
  console.log(`VITE_SQUAD_V2_BASE_PRICE_BCC=${BASE_PRICE}`);
  console.log(
    "\nTreasury: mint fees go to contract owner — transfer ownership to treasury safe when ready.",
  );
  console.log("Genesis v1 (VITE_SQUAD_NFT_ADDRESS) stays separate for legend tier perks.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
