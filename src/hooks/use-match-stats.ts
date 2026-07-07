import { useQuery } from "@tanstack/react-query";
import type { MatchStats } from "@/lib/server/activity-types";

export function useMatchStats(matchId: string | undefined) {
  return useQuery({
    queryKey: ["match-stats", matchId],
    queryFn: async (): Promise<MatchStats> => {
      if (!matchId) throw new Error("missing_match_id");
      const res = await fetch(`/api/matches/${matchId}/stats`);
      if (!res.ok) throw new Error("stats_fetch_failed");
      return res.json() as Promise<MatchStats>;
    },
    enabled: Boolean(matchId),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
