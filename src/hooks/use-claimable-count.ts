import { useMemo } from "react";
import { useResolvedWalletAddress } from "@/hooks/use-resolved-wallet-address";
import { useUserPredictions } from "@/hooks/use-user-predictions";
import { useClaims, getClaimStateFromRecords } from "@/hooks/use-claims";
import { useMatchResults } from "@/hooks/use-match-results";
import { getPredictionOutcome } from "@/lib/predict/match-settlement";

export function useClaimableCount(): number {
  const address = useResolvedWalletAddress();
  useMatchResults();
  const { rows } = useUserPredictions();
  const { data: claims = [] } = useClaims(address);

  return useMemo(() => {
    return rows.filter((row) => {
      if (row.pick === null || row.matchId === "—") return false;
      const claimState = getClaimStateFromRecords(row.txHash, claims);
      const outcome = getPredictionOutcome(row.matchId, row.pick, claimState);
      return outcome === "won_claimable";
    }).length;
  }, [rows, claims]);
}
