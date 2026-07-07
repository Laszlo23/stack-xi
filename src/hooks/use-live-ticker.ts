import { useQuery } from "@tanstack/react-query";
import type { LiveTickerState } from "@/lib/server/live-ticker-storage";

async function fetchLiveTicker(): Promise<LiveTickerState | null> {
  const res = await fetch("/api/matches/live");
  if (!res.ok) throw new Error("Failed to load live ticker");
  const data = (await res.json()) as { ticker: LiveTickerState | null };
  return data.ticker;
}

export function useLiveTicker() {
  return useQuery({
    queryKey: ["live-ticker"],
    queryFn: fetchLiveTicker,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
