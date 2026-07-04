/** Bonding-curve mint math — mirrors on-chain BASE_PRICE + mintCount * PRICE_INCREMENT (BCC) */

import { BCC_UNIT, MINT_BASE_PRICE_BCC, MINT_PRICE_INCREMENT_BCC } from "@/lib/base/config";

export const MINT_BASE_PRICE_USDC = MINT_BASE_PRICE_BCC;
export const MINT_PRICE_INCREMENT_USDC = MINT_PRICE_INCREMENT_BCC;
export const TOTAL_SQUAD_PLAYERS = 11;

export function priceAtMintCount(mintCount: bigint): bigint {
  return MINT_BASE_PRICE_BCC + mintCount * MINT_PRICE_INCREMENT_BCC;
}

export function currentMintPrice(mintCount: bigint): bigint {
  return priceAtMintCount(mintCount);
}

export function nextMintPrice(mintCount: bigint): bigint {
  return priceAtMintCount(mintCount + 1n);
}

export function squadProgressPercent(mintCount: bigint): number {
  return Math.round((Number(mintCount) / TOTAL_SQUAD_PLAYERS) * 100);
}

export function mintTierLabel(mintOrder: number): string {
  if (mintOrder === 1) return "Opening Kick";
  if (mintOrder <= 3) return "Early Believer";
  if (mintOrder <= 7) return "Starting XI";
  if (mintOrder <= 10) return "Bench Warmers Club";
  return "Last Dance";
}

export const MINT_PERKS = [
  {
    id: "shoutout",
    emoji: "🎬",
    title: "Personal video shout-out",
    detail: "Leonardo records a thank-you, tags you on Farcaster/X, and posts it for the culture.",
  },
  {
    id: "farcaster",
    emoji: "🟣",
    title: "Farcaster cast tag",
    detail:
      "Your mint gets a dedicated cast — builders see you, Luck sees you, Pepe nods approvingly.",
  },
  {
    id: "lounge",
    emoji: "🕶️",
    title: "Decentraland lounge priority",
    detail: "Skip the virtual line at STACK XI watch parties during Dallas matchdays.",
  },
  {
    id: "finals",
    emoji: "₿",
    title: "Finals whitelist",
    detail: "Early minters get first access when the Bitcoin/Stacks finals arc opens.",
  },
  {
    id: "stories",
    emoji: "📖",
    title: "Director's cut stories",
    detail: "Extra Pepe matchday beats — the Farcaster-only lore drops.",
  },
  {
    id: "predict",
    emoji: "🎯",
    title: "Prediction fee-share boost",
    detail:
      "Founding squad holders get multiplier display on BCC prediction pools (manual settlement MVP).",
  },
] as const;
