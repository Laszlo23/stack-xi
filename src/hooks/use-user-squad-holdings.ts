import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import type { SquadHolding } from "@/domain/types";
import { SQUAD_NFT_ABI, SQUAD_NFT_ADDRESS, isSquadContractConfigured } from "@/lib/base/config";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";

const PLAYER_IDS = Array.from({ length: 11 }, (_, i) => i + 1);

export function useUserSquadHoldings(address: `0x${string}` | undefined) {
  const enabled = Boolean(address && isSquadContractConfigured());

  const mintedReads = useReadContracts({
    contracts: PLAYER_IDS.map((id) => ({
      address: SQUAD_NFT_ADDRESS!,
      abi: SQUAD_NFT_ABI,
      functionName: "minted" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled },
  });

  const mintedIds = useMemo(() => {
    if (!mintedReads.data) return [];
    return PLAYER_IDS.filter((id, index) => {
      const result = mintedReads.data?.[index];
      return result?.status === "success" && result.result === true;
    });
  }, [mintedReads.data]);

  const ownerReads = useReadContracts({
    contracts: mintedIds.map((id) => ({
      address: SQUAD_NFT_ADDRESS!,
      abi: SQUAD_NFT_ABI,
      functionName: "ownerOf" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: enabled && mintedIds.length > 0 },
  });

  const { data: isEarlyBeliever = false } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "earlyBeliever",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const ownedIds = useMemo(() => {
    if (!address || mintedIds.length === 0) return [];
    return mintedIds.filter((id, index) => {
      const result = ownerReads.data?.[index];
      if (!result || result.status !== "success") return false;
      return (result.result as string).toLowerCase() === address.toLowerCase();
    });
  }, [address, mintedIds, ownerReads.data]);

  const mintOrderReads = useReadContracts({
    contracts: ownedIds.map((id) => ({
      address: SQUAD_NFT_ADDRESS!,
      abi: SQUAD_NFT_ABI,
      functionName: "mintOrderOf" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: enabled && ownedIds.length > 0 },
  });

  const holdings: SquadHolding[] = useMemo(() => {
    return ownedIds.map((id, index) => {
      const player = FOUNDING_SQUAD.find((p) => p.id === id);
      const orderResult = mintOrderReads.data?.[index];
      const mintOrder =
        orderResult?.status === "success" ? Number(orderResult.result as bigint) : 0;
      return {
        player: player ?? FOUNDING_SQUAD[0],
        mintOrder,
      };
    });
  }, [ownedIds, mintOrderReads.data]);

  return {
    holdings,
    ownedCount: ownedIds.length,
    isEarlyBeliever,
    isLoading: mintedReads.isLoading || (mintedIds.length > 0 && ownerReads.isLoading),
    isConfigured: isSquadContractConfigured(),
  };
}
