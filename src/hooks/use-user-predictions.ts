import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import { useResolvedWalletAddress } from "@/hooks/use-resolved-wallet-address";
import { BASESCAN_URL } from "@/lib/base/config";
import { getMatchById } from "@/lib/story/match-markets";

export type UserPredictionRow = {
  id: string;
  matchId: string;
  matchLabel: string;
  pick: "home" | "away" | null;
  pickLabel: string;
  stakeLabel: string | null;
  timestamp: number | null;
  txHash: string;
  source: "onchain" | "local";
};

type HistoryResponse = {
  predictions: Array<{
    matchId: string;
    pick: "home" | "away";
    stakeLabel: string;
    timestamp: number;
    txHash: string;
  }>;
};

function matchLabel(matchId: string): { label: string; home?: string; away?: string } {
  const match = getMatchById(matchId);
  if (!match) return { label: matchId };
  return { label: `${match.home} vs ${match.away}`, home: match.home, away: match.away };
}

export function useUserPredictions() {
  const address = useResolvedWalletAddress();
  const { progress } = useMemberTasks();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-predictions", address],
    queryFn: async (): Promise<HistoryResponse> => {
      const res = await fetch(`/api/predictions/history?address=${address}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Could not load on-chain predictions");
      }
      return res.json() as Promise<HistoryResponse>;
    },
    enabled: Boolean(address),
    staleTime: 60_000,
  });

  const rows = useMemo((): UserPredictionRow[] => {
    const byTx = new Map<string, UserPredictionRow>();

    for (const p of data?.predictions ?? []) {
      const meta = matchLabel(p.matchId);
      const pickLabel =
        p.pick === "home" ? (meta.home ?? "Home") : (meta.away ?? "Away");
      byTx.set(p.txHash, {
        id: p.txHash,
        matchId: p.matchId,
        matchLabel: meta.label,
        pick: p.pick,
        pickLabel,
        stakeLabel: p.stakeLabel,
        timestamp: p.timestamp,
        txHash: p.txHash,
        source: "onchain",
      });
    }

    for (const txHash of progress.predictionTxIds) {
      if (byTx.has(txHash)) continue;
      byTx.set(txHash, {
        id: txHash,
        matchId: "—",
        matchLabel: "Prediction submitted",
        pick: null,
        pickLabel: "—",
        stakeLabel: null,
        timestamp: null,
        txHash,
        source: "local",
      });
    }

    return [...byTx.values()].sort((a, b) => {
      const ta = a.timestamp ?? 0;
      const tb = b.timestamp ?? 0;
      return tb - ta;
    });
  }, [data?.predictions, progress.predictionTxIds]);

  return {
    rows,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    hasPredictions: rows.length > 0,
  };
}

export function predictionTxUrl(txHash: string): string {
  return `${BASESCAN_URL}/tx/${txHash}`;
}
