import { FC_BUILDERS } from "@/lib/story/farcaster-builders";
import { farcasterComposeUrl, xComposeUrl } from "@/lib/profile/social-links";
import { absoluteUrl } from "@/lib/seo/site-config";

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

/** Rotate honor tags — story universe, not spam. */
export function getBuilderTags(count = 3): string {
  const dayIndex = new Date().getDate() % FC_BUILDERS.length;
  const picks = Array.from(
    { length: count },
    (_, i) => FC_BUILDERS[(dayIndex + i) % FC_BUILDERS.length],
  );
  return picks.map((b) => b.handle).join(" ");
}

export function buildPredictionCastText(input: {
  home: string;
  away: string;
  pick: string;
  stakeLabel: string;
  stage: string;
}): string {
  const tags = getBuilderTags(3);
  return [
    "STACK XI Matchday Prediction is live 🐸",
    `${input.stage} · ${input.home} vs ${input.away}`,
    `I just locked ${input.pick} onchain with ${input.stakeLabel} BCC`,
    "Let Luck decide.",
    tags,
    absoluteUrl("/"),
  ].join("\n");
}

export function buildWinnerMemeText(input: {
  home: string;
  away: string;
  pick: string;
  stakeLabel: string;
}): string {
  return [
    "I just locked my prediction on STACK XI 🐸⚽",
    `${input.home} vs ${input.away} → ${input.pick}`,
    `${input.stakeLabel} BCC on Base. Luck hit different onchain.`,
    getBuilderTags(2),
  ].join("\n");
}

export function openCastShare(text: string): void {
  window.open(farcasterComposeUrl(text), "_blank", "noopener,noreferrer");
}

export function openXShare(text: string): void {
  window.open(xComposeUrl(text), "_blank", "noopener,noreferrer");
}
