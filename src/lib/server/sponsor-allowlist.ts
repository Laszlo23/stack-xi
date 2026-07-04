import {
  createPublicClient,
  createWalletClient,
  http,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { PREDICTION_SPONSOR_ABI } from "@/lib/base/config";

const SPONSOR_ABI = [
  ...PREDICTION_SPONSOR_ABI,
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
    name: "allowed",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

function sponsorAddress(): `0x${string}` | null {
  const address = process.env.VITE_PREDICTION_SPONSOR_ADDRESS;
  return address?.startsWith("0x") ? (address as `0x${string}`) : null;
}

function deployerClients() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  if (!privateKey?.startsWith("0x")) return null;

  const account = privateKeyToAccount(privateKey as Hex);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });
  return { publicClient, walletClient };
}

export async function readSponsorAllowed(wallet: string): Promise<boolean | null> {
  const sponsor = sponsorAddress();
  const clients = deployerClients();
  if (!sponsor || !clients) return null;

  try {
    return await clients.publicClient.readContract({
      address: sponsor,
      abi: SPONSOR_ABI,
      functionName: "allowed",
      args: [wallet.toLowerCase() as `0x${string}`],
    });
  } catch {
    return null;
  }
}

export async function syncSponsorAllowlist(
  wallet: string,
  allowed: boolean,
): Promise<{ synced: boolean; txHash?: string; error?: string }> {
  const sponsor = sponsorAddress();
  const clients = deployerClients();
  if (!sponsor || !clients) {
    return { synced: false, error: "Sponsor or deployer not configured" };
  }

  const normalized = wallet.toLowerCase() as `0x${string}`;

  try {
    const current = await clients.publicClient.readContract({
      address: sponsor,
      abi: SPONSOR_ABI,
      functionName: "allowed",
      args: [normalized],
    });
    if (current === allowed) {
      return { synced: true };
    }

    const hash = await clients.walletClient.writeContract({
      address: sponsor,
      abi: SPONSOR_ABI,
      functionName: "setAllowed",
      args: [normalized, allowed],
    });
    await clients.publicClient.waitForTransactionReceipt({ hash });
    return { synced: true, txHash: hash };
  } catch (err) {
    const message = err instanceof Error ? err.message : "setAllowed failed";
    console.error("[sponsor-allowlist]", message);
    return { synced: false, error: message };
  }
}

export async function grantSponsorAccessForVerifiedWallet(wallet: string): Promise<void> {
  const result = await syncSponsorAllowlist(wallet, true);
  if (!result.synced && result.error) {
    console.warn(`[sponsor-allowlist] Could not grant ${wallet}: ${result.error}`);
  }
}
