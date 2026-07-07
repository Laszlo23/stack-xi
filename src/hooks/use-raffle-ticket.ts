import { useCallback } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import {
  BASE_CHAIN_ID,
  CULTURE_RAFFLE_ABI,
  RAFFLE_TICKET_ADDRESS,
  isRaffleTicketConfigured,
} from "@/lib/base/config";

export function useRaffleTicket(address: string | null | undefined) {
  const normalized = address?.toLowerCase() as `0x${string}` | undefined;
  const enabled = isRaffleTicketConfigured() && Boolean(normalized);

  const { data: allowed } = useReadContract({
    address: RAFFLE_TICKET_ADDRESS,
    abi: CULTURE_RAFFLE_ABI,
    functionName: "allowed",
    args: normalized ? [normalized] : undefined,
    chainId: BASE_CHAIN_ID,
    query: { enabled },
  });

  const { data: hasMinted } = useReadContract({
    address: RAFFLE_TICKET_ADDRESS,
    abi: CULTURE_RAFFLE_ABI,
    functionName: "hasMinted",
    args: normalized ? [normalized] : undefined,
    chainId: BASE_CHAIN_ID,
    query: { enabled },
  });

  const { data: balance } = useReadContract({
    address: RAFFLE_TICKET_ADDRESS,
    abi: CULTURE_RAFFLE_ABI,
    functionName: "balanceOf",
    args: normalized ? [normalized] : undefined,
    chainId: BASE_CHAIN_ID,
    query: { enabled },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const mintTicket = useCallback(async () => {
    if (!RAFFLE_TICKET_ADDRESS) throw new Error("Raffle not configured");
    return writeContractAsync({
      address: RAFFLE_TICKET_ADDRESS,
      abi: CULTURE_RAFFLE_ABI,
      functionName: "mint",
    });
  }, [writeContractAsync]);

  return {
    configured: isRaffleTicketConfigured(),
    allowed: Boolean(allowed),
    hasMinted: Boolean(hasMinted),
    ticketBalance: Number(balance ?? 0n),
    mintTicket,
    isMinting: isPending,
  };
}
