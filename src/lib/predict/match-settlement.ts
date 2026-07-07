import { getMatchById } from "@/lib/story/match-markets";

export type MatchWinnerSide = "home" | "away";

export type SettledMatch = {
  winner: MatchWinnerSide;
  result: string;
  /** Treasury has processed winner payouts for this match. */
  payoutsOpen: boolean;
};

/** Fallback when API cache not loaded yet (SSR / offline). */
export const SETTLED_MATCH_RESULTS: Record<string, SettledMatch> = {
  m8: {
    winner: "away",
    result: "Spain 1-0 (Merino 91')",
    payoutsOpen: true,
  },
  m9: {
    winner: "away",
    result: "Belgium 4-1 USA — De Ketelaere brace; Tillman FK",
    payoutsOpen: true,
  },
};

let resultsCache: Record<string, SettledMatch> | null = null;

export function setMatchResultsCache(results: Record<string, SettledMatch>): void {
  resultsCache = results;
}

function resolvedResults(): Record<string, SettledMatch> {
  return resultsCache ?? SETTLED_MATCH_RESULTS;
}

export type PredictionOutcome =
  | "awaiting_result"
  | "lost"
  | "won_claimable"
  | "won_claimed"
  | "won_paid";

export function getSettledMatch(matchId: string): SettledMatch | null {
  return resolvedResults()[matchId] ?? null;
}

export function isMatchSettled(matchId: string): boolean {
  return Boolean(resolvedResults()[matchId]);
}

export function didPickWin(matchId: string, pick: "home" | "away"): boolean | null {
  const settled = resolvedResults()[matchId];
  if (!settled) return null;
  return pick === settled.winner;
}

export function winnerTeamName(matchId: string): string | null {
  const match = getMatchById(matchId);
  const settled = resolvedResults()[matchId];
  if (!match || !settled) return null;
  return settled.winner === "home" ? match.home : match.away;
}

export function getPredictionOutcome(
  matchId: string,
  pick: "home" | "away",
  claimState: "none" | "requested" | "paid",
): PredictionOutcome {
  const won = didPickWin(matchId, pick);
  if (won === null) return "awaiting_result";
  if (!won) return "lost";
  if (claimState === "paid") return "won_paid";
  if (claimState === "requested") return "won_claimed";
  return "won_claimable";
}

export const PREDICTION_PAYOUT_COPY = {
  howItWorks:
    "Your BCC stake sits in the onchain prediction pool. After the final whistle, winners claim here — treasury sends rewards to this wallet. No gas to receive.",
  autoNote:
    "Payouts are not automatic on-chain yet (v2 claim contract coming). Tap Claim so treasury can route your pool share to this address.",
  claimEta: "Usually within 24 hours after you claim.",
} as const;
