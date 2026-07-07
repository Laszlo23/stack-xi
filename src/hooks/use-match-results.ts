import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  setMatchResultsCache,
  type SettledMatch,
} from "@/lib/predict/match-settlement";

type MatchResultsResponse = {
  results: Record<
    string,
    {
      matchId: string;
      winner: "home" | "away";
      result: string;
      payoutsOpen: boolean;
      settledAt: string;
    }
  >;
};

async function fetchMatchResults(): Promise<Record<string, SettledMatch>> {
  const res = await fetch("/api/matches/results");
  if (!res.ok) throw new Error("Failed to load match results");
  const data = (await res.json()) as MatchResultsResponse;
  const mapped: Record<string, SettledMatch> = {};
  for (const [id, r] of Object.entries(data.results)) {
    mapped[id] = {
      winner: r.winner,
      result: r.result,
      payoutsOpen: r.payoutsOpen,
    };
  }
  return mapped;
}

export function useMatchResults() {
  const query = useQuery({
    queryKey: ["match-results"],
    queryFn: fetchMatchResults,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (query.data) {
      setMatchResultsCache(query.data);
    }
  }, [query.data]);

  return query;
}
