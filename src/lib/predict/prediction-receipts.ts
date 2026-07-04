/** MVP receipt layer — illustrative until on-chain indexer ships. */

export type PredictionReceipt = {
  rank: number;
  handle: string;
  pick: string;
  stakeLabel: string;
  luckEarned: number;
  isWinner?: boolean;
};

export type MatchReceiptSummary = {
  matchLabel: string;
  winnerTeam: string;
  topLuckPercent: number;
  receipts: PredictionReceipt[];
};

export function getMockReceiptsForMatch(
  matchLabel: string,
  home: string,
  away: string,
): MatchReceiptSummary {
  const winnerTeam = home;
  return {
    matchLabel,
    winnerTeam,
    topLuckPercent: 10,
    receipts: [
      {
        rank: 1,
        handle: "@0xleonardo",
        pick: home,
        stakeLabel: "$10",
        luckEarned: 120,
        isWinner: true,
      },
      {
        rank: 2,
        handle: "@pepebeliever",
        pick: home,
        stakeLabel: "$5",
        luckEarned: 88,
        isWinner: true,
      },
      { rank: 3, handle: "@luckchaser", pick: away, stakeLabel: "$5", luckEarned: 12 },
      {
        rank: 4,
        handle: "@basefrog",
        pick: home,
        stakeLabel: "$1",
        luckEarned: 45,
        isWinner: true,
      },
    ],
  };
}

export function isTopLuckTier(rank: number, total: number, topPercent = 10): boolean {
  const cutoff = Math.max(1, Math.ceil(total * (topPercent / 100)));
  return rank <= cutoff;
}
