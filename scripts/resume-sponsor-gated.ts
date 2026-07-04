#!/usr/bin/env bun
/** Finish gated sponsor setup after partial migrate (fund + setPoolAllowance + env). */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createPublicClient, createWalletClient, http, formatUnits, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const NEW_SPONSOR = (process.env.NEW_SPONSOR_ADDRESS ??
  "0x7bb21d75524a6bc00ea26c498e50c7166291c715") as `0x${string}`;
const FUND_BCC = 77_000n * 10n ** 18n;

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
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
] as const;

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
    name: "remainingSlots",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

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

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const privateKey = (process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY) as
    | Hex
    | undefined;
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const bcc = process.env.VITE_BCC_TOKEN_ADDRESS as `0x${string}`;

  if (!privateKey?.startsWith("0x")) throw new Error("Missing deployer private key");
  if (!bcc?.startsWith("0x")) throw new Error("Missing BCC address");

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: base, transport: http(rpcUrl) });

  const [deployerBal, vaultBal] = await Promise.all([
    publicClient.readContract({
      address: bcc,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account.address],
    }),
    publicClient.readContract({
      address: bcc,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [NEW_SPONSOR],
    }),
  ]);

  console.log("Sponsor:", NEW_SPONSOR);
  console.log("Deployer BCC:", formatUnits(deployerBal, 18));
  console.log("Vault BCC:", formatUnits(vaultBal, 18));

  if (vaultBal < FUND_BCC) {
    const shortfall = FUND_BCC - vaultBal;
    if (deployerBal < shortfall) throw new Error("Insufficient BCC to fund vault");
    console.log(`Funding ${formatUnits(shortfall, 18)} BCC…`);
    await sleep(4000);
    const fundHash = await walletClient.writeContract({
      address: bcc,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [NEW_SPONSOR, shortfall],
    });
    await publicClient.waitForTransactionReceipt({ hash: fundHash });
  }

  console.log("Setting pool allowance…");
  await sleep(4000);
  const allowanceHash = await walletClient.writeContract({
    address: NEW_SPONSOR,
    abi: SPONSOR_ABI,
    functionName: "setPoolAllowance",
  });
  await publicClient.waitForTransactionReceipt({ hash: allowanceHash });

  const slots = await publicClient.readContract({
    address: NEW_SPONSOR,
    abi: SPONSOR_ABI,
    functionName: "remainingSlots",
  });
  const finalVault = await publicClient.readContract({
    address: bcc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [NEW_SPONSOR],
  });

  upsertEnvVar("VITE_PREDICTION_SPONSOR_ADDRESS", NEW_SPONSOR);
  console.log("Slots:", slots.toString());
  console.log("Vault:", formatUnits(finalVault, 18), "BCC");
  console.log("Updated .env");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
