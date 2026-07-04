import { buildSharePost, getRotatingBuilderTagsLine } from "@/lib/growth/share-copy";
import { farcasterComposeUrl, xComposeUrl } from "@/lib/profile/social-links";

const STORAGE_PREFIX = "stackxi:share-unlock:";

function storageKey(address: string, matchId: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}:${matchId}`;
}

export function hasShareUnlock(address: string | undefined, matchId: string): boolean {
  if (typeof window === "undefined" || !address) return false;
  return localStorage.getItem(storageKey(address, matchId)) === "1";
}

export function markShareUnlock(address: string, matchId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(address, matchId), "1");
}

/** @deprecated Use getRotatingBuilderTagsLine from share-copy */
export function getBuilderTags(count = 3): string {
  return getRotatingBuilderTagsLine(count);
}

export function buildPredictionCastText(input: {
  home: string;
  away: string;
  pick: string;
  stakeLabel: string;
  stage: string;
}): string {
  return buildSharePost(
    [
      "STACK XI Matchday Prediction is live 🐸",
      `${input.stage} · ${input.home} vs ${input.away}`,
      `I just locked ${input.pick} onchain with ${input.stakeLabel} BCC`,
      "Let Luck decide.",
    ],
    { path: "/" },
  );
}

export function buildWinnerMemeText(input: {
  home: string;
  away: string;
  pick: string;
  stakeLabel: string;
}): string {
  return buildSharePost(
    [
      "I just locked my prediction on STACK XI 🐸⚽",
      `${input.home} vs ${input.away} → ${input.pick}`,
      `${input.stakeLabel} BCC on Base. Luck hit different onchain.`,
    ],
    { path: "/" },
  );
}

export function openCastShare(text: string): void {
  window.open(farcasterComposeUrl(text), "_blank", "noopener,noreferrer");
}

export function openXShare(text: string): void {
  window.open(xComposeUrl(text), "_blank", "noopener,noreferrer");
}
