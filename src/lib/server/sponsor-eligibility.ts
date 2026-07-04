import type { WalletSocialLinks } from "@/lib/server/social-storage";

export type SponsorSocialGate = {
  socialEligible: boolean;
  farcasterConnected: boolean;
  xConnected: boolean;
  reason: string;
};

export function isSociallyEligibleForSponsor(links: WalletSocialLinks | null): boolean {
  if (!links) return false;
  return Boolean(links.farcaster?.fid || links.x?.userId);
}

export function describeSponsorSocialGate(links: WalletSocialLinks | null): SponsorSocialGate {
  const farcasterConnected = Boolean(links?.farcaster?.fid);
  const xConnected = Boolean(links?.x?.userId);
  const socialEligible = farcasterConnected || xConnected;

  let reason = "Connect Farcaster (verified FID) or link your X account on Profile first.";
  if (socialEligible) {
    reason = farcasterConnected
      ? "Farcaster verified — eligible for founding sponsor stake."
      : "X account linked — eligible for founding sponsor stake.";
  }

  return { socialEligible, farcasterConnected, xConnected, reason };
}

export async function validateFarcasterFidExists(fid: number): Promise<boolean> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return true;

  const res = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
    headers: { accept: "application/json", api_key: apiKey },
  });
  if (!res.ok) return false;

  const data = (await res.json()) as { users?: { fid?: number }[] };
  return data.users?.some((user) => user.fid === fid) ?? false;
}
