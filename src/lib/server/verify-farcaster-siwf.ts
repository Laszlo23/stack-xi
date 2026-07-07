import { createAppClient, viemConnector } from "@farcaster/auth-client";

function siteDomain(): string {
  const siteUrl = process.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space";
  return new URL(siteUrl).hostname;
}

function rpcUrl(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org"
  );
}

export async function verifyFarcasterSignInMessage(input: {
  message: string;
  signature: `0x${string}`;
  nonce: string;
}): Promise<{ success: boolean; fid: number | null }> {
  const appClient = createAppClient({
    relay: "https://relay.farcaster.xyz",
    ethereum: viemConnector({ rpcUrl: rpcUrl() }),
  });

  const result = await appClient.verifySignInMessage({
    domain: siteDomain(),
    nonce: input.nonce,
    message: input.message,
    signature: input.signature,
    acceptAuthAddress: true,
  });

  const fid = "fid" in result && typeof result.fid === "number" ? result.fid : null;
  const success = Boolean(result.success && fid);

  return { success, fid };
}

export async function farcasterFidOwnsWallet(fid: number, address: string): Promise<boolean> {
  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  if (!apiKey) return false;

  const res = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
    headers: { accept: "application/json", api_key: apiKey },
  });
  if (!res.ok) return false;

  const data = (await res.json()) as {
    users?: {
      fid?: number;
      custody_address?: string;
      verified_addresses?: { eth_addresses?: string[] };
    }[];
  };

  const user = data.users?.find((entry) => entry.fid === fid);
  if (!user) return false;

  const normalized = address.toLowerCase();
  const custody = user.custody_address?.toLowerCase();
  const verified =
    user.verified_addresses?.eth_addresses?.map((entry) => entry.toLowerCase()) ?? [];

  return custody === normalized || verified.includes(normalized);
}
