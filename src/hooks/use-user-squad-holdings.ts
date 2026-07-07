import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import type { SquadHolding } from "@/domain/types";
import {
  SQUAD_NFT_ABI,
  SQUAD_NFT_ADDRESS,
  isSquadContractConfigured,
  isSquadV2Configured,
} from "@/lib/base/config";
import { useSquadV2Packs } from "@/hooks/use-squad-v2-packs";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";

const PLAYER_IDS = Array.from({ length: 11 }, (_, i) => i + 1);

export function useUserSquadHoldings(address: `0x${string}` | undefined) {
  const v1Enabled = Boolean(address && isSquadContractConfigured());
  const { revealedPacks: v2Revealed, isLoading: v2Loading } = useSquadV2Packs(address);

  const mintedReads = useReadContracts({
    contracts: PLAYER_IDS.map((id) => ({
      address: SQUAD_NFT_ADDRESS!,
      abi: SQUAD_NFT_ABI,
      functionName: "minted" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: v1Enabled },
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
    query: { enabled: v1Enabled && mintedIds.length > 0 },
  });

  const { data: isEarlyBelieverV1 = false } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "earlyBeliever",
    args: address ? [address] : undefined,
    query: { enabled: v1Enabled },
  });

  const ownedGenesisIds = useMemo(() => {
    if (!address || mintedIds.length === 0) return [];
    return mintedIds.filter((id, index) => {
      const result = ownerReads.data?.[index];
      if (!result || result.status !== "success") return false;
      return (result.result as string).toLowerCase() === address.toLowerCase();
    });
  }, [address, mintedIds, ownerReads.data]);

  const mintOrderReads = useReadContracts({
    contracts: ownedGenesisIds.map((id) => ({
      address: SQUAD_NFT_ADDRESS!,
      abi: SQUAD_NFT_ABI,
      functionName: "mintOrderOf" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: v1Enabled && ownedGenesisIds.length > 0 },
  });

  const holdings: SquadHolding[] = useMemo(() => {
    const genesis: SquadHolding[] = ownedGenesisIds.map((id, index) => {
      const player = FOUNDING_SQUAD.find((p) => p.id === id);
      const orderResult = mintOrderReads.data?.[index];
      const mintOrder =
        orderResult?.status === "success" ? Number(orderResult.result as bigint) : 0;
      return {
        player: player ?? FOUNDING_SQUAD[0],
        mintOrder,
        isGenesis: true,
      };
    });

    const v2: SquadHolding[] = v2Revealed.map((pack) => {
      const player = FOUNDING_SQUAD.find((p) => p.id === pack.playerId);
      return {
        player: player ?? FOUNDING_SQUAD[0],
        mintOrder: Number(pack.mintOrder),
        edition: pack.edition,
        tokenId: pack.tokenId,
      };
    });

    return [...genesis, ...v2];
  }, [ownedGenesisIds, mintOrderReads.data, v2Revealed]);

  const ownedCount = holdings.length;

  return {
    holdings,
    ownedCount,
    genesisCount: ownedGenesisIds.length,
    v2Count: v2Revealed.length,
    isEarlyBeliever: isEarlyBelieverV1,
    isLoading:
      mintedReads.isLoading ||
      (mintedIds.length > 0 && ownerReads.isLoading) ||
      (isSquadV2Configured() && v2Loading),
    isConfigured: isSquadContractConfigured() || isSquadV2Configured(),
  };
}
