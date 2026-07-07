import { useQuery } from "@tanstack/react-query";
import type { ActivityItem } from "@/lib/server/activity-types";

type ActivityResponse = {
  items: ActivityItem[];
  totalPredictions: number;
};

export function useActivityFeed(limit = 8) {
  return useQuery({
    queryKey: ["activity-feed", limit],
    queryFn: async (): Promise<ActivityResponse> => {
      const res = await fetch(`/api/activity/recent?limit=${limit}`);
      if (!res.ok) throw new Error("activity_fetch_failed");
      return res.json() as Promise<ActivityResponse>;
    },
    refetchInterval: 45_000,
    staleTime: 20_000,
  });
}
