/** Bonding-curve mint math for squad v2 blind packs */

import {
  SQUAD_V2_BASE_PRICE_BCC,
  SQUAD_V2_MAX_SUPPLY,
  SQUAD_V2_PRICE_INCREMENT_BCC,
} from "@/lib/base/config";

export const TOTAL_SQUAD_PLAYERS = 11;
export const SQUAD_V2_EDITIONS_PER_PLAYER = 77;
export const SQUAD_V2_EARLY_BELIEVER_LIMIT = 77;

export function v2PriceAtMintCount(mintCount: bigint): bigint {
  return SQUAD_V2_BASE_PRICE_BCC + mintCount * SQUAD_V2_PRICE_INCREMENT_BCC;
}

export function v2CurrentMintPrice(mintCount: bigint): bigint {
  return v2PriceAtMintCount(mintCount);
}

export function v2NextMintPrice(mintCount: bigint): bigint {
  if (mintCount >= BigInt(SQUAD_V2_MAX_SUPPLY)) return 0n;
  return v2PriceAtMintCount(mintCount + 1n);
}

export function squadV2ProgressPercent(mintCount: bigint): number {
  return Math.round((Number(mintCount) / SQUAD_V2_MAX_SUPPLY) * 100);
}

export function mintTierLabel(mintOrder: number): string {
  if (mintOrder === 1) return "Opening Kick";
  if (mintOrder <= 7) return "Lucky Seven";
  if (mintOrder <= 77) return "Early Believer";
  if (mintOrder <= 200) return "Starting XI Wave";
  if (mintOrder <= 500) return "Midfield Culture";
  if (mintOrder <= 770) return "Bench Warmers Club";
  return "Final Whistle";
}

export const MINT_PERKS = [
  {
    id: "blind_pack",
    emoji: "🎁",
    title: "Blind pack reveal",
    detail: "Mint sealed — open on-chain to discover your player. 77 editions per character.",
  },
  {
    id: "joker",
    emoji: "🃏",
    title: "Joker pick",
    detail: "Early believers and genesis holders can choose their player on open instead of random.",
  },
  {
    id: "predict_boost",
    emoji: "🎯",
    title: "Prediction claim boost",
    detail: "Squad holders earn +5% to +25% on winning prediction payouts — enforced at claim time.",
  },
  {
    id: "merch",
    emoji: "👕",
    title: "Merch discount codes",
    detail: "Profile unlocks tiered STACK XI merch codes based on your squad collection.",
  },
  {
    id: "shoutout",
    emoji: "🎬",
    title: "Video shout-out queue",
    detail: "Leonardo records a thank-you, tags you on Farcaster/X, and posts it for the culture.",
  },
  {
    id: "finals",
    emoji: "₿",
    title: "Finals whitelist arc",
    detail: "Early pack minters get priority when the Bitcoin/Stacks finals chapter opens.",
  },
] as const;

/** @deprecated Use v2CurrentMintPrice for active mint */
export function currentMintPrice(mintCount: bigint): bigint {
  return v2CurrentMintPrice(mintCount);
}

/** @deprecated Use v2NextMintPrice for active mint */
export function nextMintPrice(mintCount: bigint): bigint {
  return v2NextMintPrice(mintCount);
}

export function squadProgressPercent(mintCount: bigint): number {
  return squadV2ProgressPercent(mintCount);
}
