import { useQuery, useQueryClient } from "@tanstack/react-query";

export type ServerClaimRecord = {
  id: string;
  address: string;
  matchId: string;
  txHash: string;
  pick: "home" | "away";
  status: "requested" | "paid";
  requestedAt: string;
  paidAt?: string;
  payoutTxHash?: string;
  boostBps?: number;
  perkTier?: string;
};

async function fetchClaims(address: string): Promise<ServerClaimRecord[]> {
  const res = await fetch(`/api/claims?address=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error("Failed to load claims");
  const data = (await res.json()) as { claims: ServerClaimRecord[] };
  return data.claims;
}

export function getClaimStateFromRecords(
  txHash: string,
  claims: ServerClaimRecord[],
): "none" | "requested" | "paid" {
  const record = claims.find((c) => c.txHash.toLowerCase() === txHash.toLowerCase());
  if (!record) return "none";
  return record.status;
}

export async function requestClaimApi(input: {
  address: string;
  matchId: string;
  txHash: string;
  pick: "home" | "away";
}): Promise<ServerClaimRecord> {
  const res = await fetch("/api/claims/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as { claim?: ServerClaimRecord; error?: string };
  if (!res.ok || !data.claim) {
    throw new Error(data.error ?? "claim_failed");
  }
  return data.claim;
}

export function useClaims(address: string | null | undefined) {
  return useQuery({
    queryKey: ["claims", address],
    queryFn: () => fetchClaims(address!),
    enabled: Boolean(address?.startsWith("0x")),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useClaimsMutations(address: string | null | undefined) {
  const queryClient = useQueryClient();

  async function requestClaim(input: {
    address: string;
    matchId: string;
    txHash: string;
    pick: "home" | "away";
  }) {
    const claim = await requestClaimApi(input);
    await queryClient.invalidateQueries({ queryKey: ["claims", address] });
    return claim;
  }

  return { requestClaim };
}
