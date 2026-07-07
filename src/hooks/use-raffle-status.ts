import { useQuery } from "@tanstack/react-query";
import type { RaffleOnchainState } from "@/lib/server/raffle-chain";

export type RaffleStatusResponse = {
  raffle: RaffleOnchainState;
  questStats: {
    totalStarted: number;
    completed: number;
    mintApproved: number;
    ticketsMinted: number;
  };
  entries: { tokenId: number; holder: string; txHash: string }[];
  prizeBcc: number;
  drawDeadline: string;
};

async function fetchRaffleStatus(): Promise<RaffleStatusResponse> {
  const res = await fetch("/api/raffle/status");
  if (!res.ok) throw new Error("Failed to load raffle status");
  return (await res.json()) as RaffleStatusResponse;
}

export function useRaffleStatus() {
  return useQuery({
    queryKey: ["raffle-status"],
    queryFn: fetchRaffleStatus,
    refetchInterval: 30_000,
  });
}
