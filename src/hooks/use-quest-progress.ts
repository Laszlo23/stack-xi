import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { QuestProgressRecord } from "@/lib/server/quest-storage";
import type { QuestVerifyStep } from "@/lib/growth/social-targets";
import type { RaffleOnchainState } from "@/lib/server/raffle-chain";

export type QuestStatusResponse = {
  progress: QuestProgressRecord;
  allComplete: boolean;
  mintApproved: boolean;
  prizeBcc: number;
  drawDeadline: string;
  raffle: RaffleOnchainState;
  onchain: {
    allowed: boolean;
    hasMinted: boolean;
    ticketBalance: number;
    contractAddress: string | null;
  };
};

async function fetchQuestStatus(address: string): Promise<QuestStatusResponse> {
  const res = await fetch(`/api/quest/status?address=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error("Failed to load quest status");
  return (await res.json()) as QuestStatusResponse;
}

export function useQuestProgress(address: string | null | undefined) {
  return useQuery({
    queryKey: ["quest-status", address],
    queryFn: () => fetchQuestStatus(address!),
    enabled: Boolean(address?.startsWith("0x")),
    refetchInterval: 20_000,
  });
}

export function useQuestMutations(address: string | null | undefined) {
  const queryClient = useQueryClient();

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["quest-status", address] });
    await queryClient.invalidateQueries({ queryKey: ["raffle-status"] });
  }

  async function verifyStep(step: QuestVerifyStep) {
    const res = await fetch("/api/quest/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address, step }),
    });
    const data = (await res.json()) as {
      verified: boolean;
      message: string;
      progress?: QuestProgressRecord;
    };
    await invalidate();
    return data;
  }

  async function approveMint() {
    const res = await fetch("/api/quest/approve-mint", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; txHash?: string };
    if (!res.ok) throw new Error(data.error ?? "approve_failed");
    await invalidate();
    return data;
  }

  return { verifyStep, approveMint, invalidate };
}
