#!/usr/bin/env bun
/**
 * Migrate PredictionSponsor to allowlist-gated version (social verify required).
 * Withdraws BCC from old sponsor, deploys new contract, funds, sets pool allowance.
 *
 * Requires: BASE_DEPLOYER_PRIVATE_KEY, VITE_PREDICTION_POOL_ADDRESS, VITE_BCC_TOKEN_ADDRESS
 * Optional: SPONSOR_ADDRESS_OLD (defaults to current VITE_PREDICTION_SPONSOR_ADDRESS)
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
import { isSociallyEligibleForSponsor } from "../src/lib/server/sponsor-eligibility.ts";

const BCC_DEFAULT = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;
const BCC_UNIT = 10n ** 18n;

const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const satisfies Abi;

const OLD_SPONSOR_ABI = [
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "bcc",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const satisfies Abi;

const SPONSOR_ABI = [
  {
    type: "function",
    name: "setPoolAllowance",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "setAllowed",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "value", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setAllowedBatch",
    stateMutability: "nonpayable",
    inputs: [
      { name: "users", type: "address[]" },
      { name: "value", type: "bool" },
    ],
    outputs: [],
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
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split("\n");
  const prefix = `${key}=`;
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(prefix)) {
      found = true;
      return `${prefix}${value}`;
    }
    return line;
  });
  if (!found) next.push(`${prefix}${value}`);
  writeFileSync(envPath, next.join("\n"));
}

function loadSocialWallets(): `0x${string}`[] {
  const path = process.env.SOCIAL_STORAGE_PATH ?? join(process.cwd(), "data", "social-links.json");
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as {
    links?: Record<string, { farcaster?: { fid: number }; x?: { userId: string } }>;
  };
  return Object.entries(raw.links ?? {})
    .filter(([, links]) => isSociallyEligibleForSponsor(links))
    .map(([wallet]) => wallet.toLowerCase() as `0x${string}`);
}

async function main() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const bccAddress = (process.env.VITE_BCC_TOKEN_ADDRESS ?? BCC_DEFAULT) as `0x${string}`;
  const poolAddress = process.env.VITE_PREDICTION_POOL_ADDRESS as `0x${string}` | undefined;
  const oldSponsor = (process.env.SPONSOR_ADDRESS_OLD ??
    process.env.VITE_PREDICTION_SPONSOR_ADDRESS) as `0x${string}` | undefined;

  if (!privateKey?.startsWith("0x")) {
    console.error("Set BASE_DEPLOYER_PRIVATE_KEY in .env");
    process.exit(1);
  }
  if (!poolAddress?.startsWith("0x")) {
    console.error("Set VITE_PREDICTION_POOL_ADDRESS");
    process.exit(1);
  }
  if (!oldSponsor?.startsWith("0x")) {
    console.error("Set SPONSOR_ADDRESS_OLD or VITE_PREDICTION_SPONSOR_ADDRESS");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as Hex);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });

  const vaultBalance = await publicClient.readContract({
    address: bccAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [oldSponsor],
  });
  const decimals = await publicClient.readContract({
    address: bccAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  console.log("Old sponsor:", oldSponsor);
  console.log("Vault balance:", formatUnits(vaultBalance, decimals), "BCC");

  if (vaultBalance > 0n) {
    console.log("Withdrawing from old sponsor…");
    const withdrawHash = await walletClient.writeContract({
      address: oldSponsor,
      abi: OLD_SPONSOR_ABI,
      functionName: "withdraw",
      args: [account.address, vaultBalance],
    });
    await publicClient.waitForTransactionReceipt({ hash: withdrawHash });
    console.log("Withdrawn:", withdrawHash);
  }

  const sponsorArtifact = loadArtifact("PredictionSponsor");
  console.log("\nDeploying gated PredictionSponsor…");
  const deployHash = await walletClient.deployContract({
    abi: sponsorArtifact.abi,
    bytecode: sponsorArtifact.bytecode,
    args: [bccAddress, poolAddress],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
  const newSponsor = receipt.contractAddress;
  if (!newSponsor) throw new Error("Deploy failed");

  console.log("New sponsor:", newSponsor);

  const allowanceHash = await walletClient.writeContract({
    address: newSponsor,
    abi: SPONSOR_ABI,
    functionName: "setPoolAllowance",
  });
  await publicClient.waitForTransactionReceipt({ hash: allowanceHash });

  if (vaultBalance > 0n) {
    const transferHash = await walletClient.writeContract({
      address: bccAddress,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [newSponsor, vaultBalance],
    });
    await publicClient.waitForTransactionReceipt({ hash: transferHash });
    console.log("Funded new vault:", formatUnits(vaultBalance, decimals), "BCC");
  }

  const wallets = loadSocialWallets();
  if (wallets.length > 0) {
    console.log(`\nBackfilling allowlist for ${wallets.length} verified wallet(s)…`);
    const batchSize = 40;
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);
      const hash = await walletClient.writeContract({
        address: newSponsor,
        abi: SPONSOR_ABI,
        functionName: "setAllowedBatch",
        args: [batch, true],
      });
      await publicClient.waitForTransactionReceipt({ hash: hash });
      console.log(`  batch ${i / batchSize + 1}: ${batch.length} wallets`);
    }
  }

  upsertEnvVar("VITE_PREDICTION_SPONSOR_ADDRESS", newSponsor);
  console.log("\nUpdated .env with new sponsor address.");
  console.log("BaseScan:", `https://basescan.org/address/${newSponsor}`);
  console.log("Next: bun run deploy:vps && bun run test:sponsor-security");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
