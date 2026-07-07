import { useQuery } from "@tanstack/react-query";
import type { LeaderboardRow } from "@/lib/server/activity-types";

type LeaderboardResponse = {
  entries: LeaderboardRow[];
};

export function useLeaderboard(limit = 5) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const res = await fetch(`/api/leaderboard?limit=${limit}`);
      if (!res.ok) throw new Error("leaderboard_fetch_failed");
      return res.json() as Promise<LeaderboardResponse>;
    },
    staleTime: 60_000,
  });
}
