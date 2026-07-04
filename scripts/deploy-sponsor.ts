#!/usr/bin/env bun
/**
 * Deploy PredictionSponsor vault — works with the existing PredictionPool (no pool redeploy).
 * Requires: BASE_DEPLOYER_PRIVATE_KEY, VITE_PREDICTION_POOL_ADDRESS, VITE_BCC_TOKEN_ADDRESS
 *
 * Optional: SPONSOR_FUND_BCC=77000 (default) — approves + funds sponsor from deployer wallet
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
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const BCC_DEFAULT = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;
const BCC_UNIT = 10n ** 18n;
const DEFAULT_FUND_BCC = 77_000n;

const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
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
    name: "fund",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "remainingSlots",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
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

async function main() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const bccAddress = (process.env.VITE_BCC_TOKEN_ADDRESS ?? BCC_DEFAULT) as `0x${string}`;
  const poolAddress = process.env.VITE_PREDICTION_POOL_ADDRESS as `0x${string}` | undefined;
  const fundBcc = BigInt(process.env.SPONSOR_FUND_BCC ?? DEFAULT_FUND_BCC);
  const fundAmount = fundBcc * BCC_UNIT;

  if (!privateKey?.startsWith("0x")) {
    console.error("Set BASE_DEPLOYER_PRIVATE_KEY or PRIVATE_KEY (0x…) in .env");
    process.exit(1);
  }
  if (!poolAddress?.startsWith("0x")) {
    console.error("Set VITE_PREDICTION_POOL_ADDRESS to the existing PredictionPool on Base.");
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
  console.log("Existing PredictionPool:", poolAddress);
  console.log("BCC:", bccAddress, `(${symbol})`);
  console.log("Sponsor pays pool directly — no pool upgrade required.\n");

  const sponsorArtifact = loadArtifact("PredictionSponsor");
  console.log("Deploying PredictionSponsor vault…");
  const deployHash = await walletClient.deployContract({
    abi: sponsorArtifact.abi,
    bytecode: sponsorArtifact.bytecode,
    args: [bccAddress, poolAddress],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
  const sponsorAddress = receipt.contractAddress;
  if (!sponsorAddress) throw new Error("PredictionSponsor deployment failed");
  console.log("PredictionSponsor:", sponsorAddress);

  console.log("Approving pool allowance from sponsor…");
  const allowanceHash = await walletClient.writeContract({
    address: sponsorAddress,
    abi: SPONSOR_ABI,
    functionName: "setPoolAllowance",
  });
  await publicClient.waitForTransactionReceipt({ hash: allowanceHash });

  if (fundAmount > 0n) {
    const balance = await publicClient.readContract({
      address: bccAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });
    console.log(`\nDeployer BCC balance: ${formatUnits(balance, decimals)} ${symbol}`);
    if (balance < fundAmount) {
      console.warn(
        `Insufficient BCC to fund ${formatUnits(fundAmount, decimals)} — fund manually via sponsor.fund()`,
      );
    } else {
      const vaultBefore = await publicClient.readContract({
        address: bccAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [sponsorAddress],
      });
      const shortfall = fundAmount > vaultBefore ? fundAmount - vaultBefore : 0n;
      if (shortfall > 0n) {
        console.log(`Funding sponsor with ${formatUnits(shortfall, decimals)} ${symbol}…`);
        const transferHash = await walletClient.writeContract({
          address: bccAddress,
          abi: [
            ...ERC20_ABI,
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
          ],
          functionName: "transfer",
          args: [sponsorAddress, shortfall],
        });
        await publicClient.waitForTransactionReceipt({ hash: transferHash });
        console.log("Sponsor funded");
      } else {
        console.log("Sponsor vault already funded");
      }
    }
  }

  const slots = await publicClient.readContract({
    address: sponsorAddress,
    abi: SPONSOR_ABI,
    functionName: "remainingSlots",
  });
  const vaultBalance = await publicClient.readContract({
    address: bccAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [sponsorAddress],
  });

  console.log("\n--- Summary ---");
  console.log(`Remaining slots: ${slots}`);
  console.log(`Vault balance: ${formatUnits(vaultBalance, decimals)} ${symbol}`);
  console.log(`BaseScan: https://basescan.org/address/${sponsorAddress}`);

  const stakeWei = parseUnits("1000", decimals).toString();
  upsertEnvVar("VITE_PREDICTION_SPONSOR_ADDRESS", sponsorAddress);
  upsertEnvVar("VITE_SPONSORED_PREDICTION_STAKE_BCC", stakeWei);
  upsertEnvVar("VITE_SPONSORED_PREDICTION_MAX", "77");
  console.log("\nUpdated local .env with sponsor address.");
  console.log("Next: bun run deploy:vps");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
