#!/usr/bin/env bun
/**
 * Deploy CultureRaffle — quest-gated ERC721 tickets + 7.7M BCC prize pool.
 * Requires: BASE_DEPLOYER_PRIVATE_KEY, VITE_BCC_TOKEN_ADDRESS
 * Optional: RAFFLE_FUND_BCC=7777777 (default) — funds prize from deployer
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  createWalletClient,
  createPublicClient,
  http,
  type Abi,
  type Hex,
  parseUnits,
  formatUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const BCC_DEFAULT = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;
const DEFAULT_FUND_BCC = 7_777_777;

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
] as const satisfies Abi;

function raffleArtifactPath(): string {
  return join(process.cwd(), "contracts/out/CultureRaffle.sol/CultureRaffle.json");
}

function loadRaffleAbi(): Abi {
  const artifact = raffleArtifactPath();
  if (!existsSync(artifact)) {
    console.error("Run: bun run contracts:build");
    process.exit(1);
  }
  return JSON.parse(readFileSync(artifact, "utf8")).abi as Abi;
}

async function main() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  const bccAddress = (process.env.VITE_BCC_TOKEN_ADDRESS ?? BCC_DEFAULT) as `0x${string}`;
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const fundBcc = BigInt(process.env.RAFFLE_FUND_BCC ?? DEFAULT_FUND_BCC);

  if (!privateKey?.startsWith("0x")) {
    console.error("Set BASE_DEPLOYER_PRIVATE_KEY");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as Hex);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: base, transport: http(rpcUrl) });
  const abi = loadRaffleAbi();

  console.log("Deploying CultureRaffle...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode: JSON.parse(readFileSync(raffleArtifactPath(), "utf8")).bytecode.object as Hex,
    args: [bccAddress],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const address = receipt.contractAddress;
  if (!address) {
    console.error("Deploy failed");
    process.exit(1);
  }

  console.log("CultureRaffle deployed:", address);

  const fundAmount = parseUnits(fundBcc.toString(), 18);
  const approveHash = await walletClient.writeContract({
    address: bccAddress,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [address, fundAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  const fundHash = await walletClient.writeContract({
    address,
    abi,
    functionName: "fundPrize",
    args: [fundAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: fundHash });

  console.log(`Funded ${formatUnits(fundAmount, 18)} BCC prize pool`);
  console.log("\nAdd to .env:");
  console.log(`VITE_RAFFLE_TICKET_ADDRESS=${address}`);
  console.log(`RAFFLE_TICKET_ADDRESS=${address}`);

  const envPath = join(process.cwd(), ".env");
  if (existsSync(envPath)) {
    let env = readFileSync(envPath, "utf8");
    const line = `VITE_RAFFLE_TICKET_ADDRESS=${address}`;
    if (env.includes("VITE_RAFFLE_TICKET_ADDRESS=")) {
      env = env.replace(/VITE_RAFFLE_TICKET_ADDRESS=.*/g, line);
      env = env.replace(/RAFFLE_TICKET_ADDRESS=.*/g, `RAFFLE_TICKET_ADDRESS=${address}`);
    } else {
      env += `\n${line}\nRAFFLE_TICKET_ADDRESS=${address}\n`;
    }
    writeFileSync(envPath, env);
    console.log("Updated .env");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
