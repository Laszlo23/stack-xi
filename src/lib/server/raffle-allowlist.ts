import {
  createPublicClient,
  createWalletClient,
  http,
  type Hex,
  keccak256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { CULTURE_RAFFLE_ABI } from "@/lib/base/config";

function raffleAddress(): `0x${string}` | null {
  const address = process.env.VITE_RAFFLE_TICKET_ADDRESS ?? process.env.RAFFLE_TICKET_ADDRESS;
  return address?.startsWith("0x") ? (address as `0x${string}`) : null;
}

function deployerClients() {
  const privateKey = process.env.BASE_DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  const rpcUrl =
    process.env.BASE_RPC_URL?.trim() ||
    process.env.ALCHEMY_BASE_ENDPOINT?.trim() ||
    "https://mainnet.base.org";
  if (!privateKey?.startsWith("0x")) return null;

  const account = privateKeyToAccount(privateKey as Hex);
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });
  return { publicClient, walletClient, address: raffleAddress() };
}

export function isRaffleConfigured(): boolean {
  return Boolean(raffleAddress() && deployerClients());
}

export async function syncRaffleAllowlist(
  wallet: string,
  allowed: boolean,
): Promise<{ synced: boolean; txHash?: string; error?: string }> {
  const clients = deployerClients();
  const contract = clients?.address;
  if (!clients || !contract) {
    return { synced: false, error: "Raffle contract or deployer not configured" };
  }

  const normalized = wallet.toLowerCase() as `0x${string}`;

  try {
    const current = await clients.publicClient.readContract({
      address: contract,
      abi: CULTURE_RAFFLE_ABI,
      functionName: "allowed",
      args: [normalized],
    });
    if (current === allowed) return { synced: true };

    const hash = await clients.walletClient.writeContract({
      address: contract,
      abi: CULTURE_RAFFLE_ABI,
      functionName: "setAllowed",
      args: [normalized, allowed],
    });
    await clients.publicClient.waitForTransactionReceipt({ hash });
    return { synced: true, txHash: hash };
  } catch (err) {
    const message = err instanceof Error ? err.message : "setAllowed failed";
    return { synced: false, error: message };
  }
}

export async function adminCloseRaffleEntries(): Promise<{ ok: boolean; txHash?: string; error?: string }> {
  const clients = deployerClients();
  const contract = clients?.address;
  if (!clients || !contract) return { ok: false, error: "not_configured" };

  try {
    const hash = await clients.walletClient.writeContract({
      address: contract,
      abi: CULTURE_RAFFLE_ABI,
      functionName: "closeEntries",
    });
    await clients.publicClient.waitForTransactionReceipt({ hash });
    return { ok: true, txHash: hash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "close_failed" };
  }
}

export async function adminCommitDraw(secretHex: Hex): Promise<{ ok: boolean; txHash?: string; error?: string }> {
  const clients = deployerClients();
  const contract = clients?.address;
  if (!clients || !contract) return { ok: false, error: "not_configured" };

  const commitHash = keccak256(secretHex);

  try {
    const hash = await clients.walletClient.writeContract({
      address: contract,
      abi: CULTURE_RAFFLE_ABI,
      functionName: "commitDraw",
      args: [commitHash],
    });
    await clients.publicClient.waitForTransactionReceipt({ hash });
    return { ok: true, txHash: hash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "commit_failed" };
  }
}

export async function adminRevealAndDraw(
  secretHex: Hex,
): Promise<{ ok: boolean; txHash?: string; error?: string }> {
  const clients = deployerClients();
  const contract = clients?.address;
  if (!clients || !contract) return { ok: false, error: "not_configured" };

  try {
    const hash = await clients.walletClient.writeContract({
      address: contract,
      abi: CULTURE_RAFFLE_ABI,
      functionName: "revealAndDraw",
      args: [secretHex],
    });
    await clients.publicClient.waitForTransactionReceipt({ hash });
    return { ok: true, txHash: hash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "reveal_failed" };
  }
}

export function getRaffleContractAddress(): `0x${string}` | null {
  return raffleAddress();
}

export function getRaffleRpcUrl(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.ALCHEMY_BASE_ENDPOINT?.trim() ||
    (process.env.ALCHEMY_API_KEY
      ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY.trim()}`
      : base.rpcUrls.default.http[0])
  );
}
