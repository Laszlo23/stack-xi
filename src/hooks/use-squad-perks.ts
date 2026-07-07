import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import {
  SQUAD_NFT_ABI,
  SQUAD_NFT_ADDRESS,
  SQUAD_NFT_V2_ABI,
  SQUAD_NFT_V2_ADDRESS,
  isSquadContractConfigured,
  isSquadV2Configured,
} from "@/lib/base/config";
import { computeSquadPerks, type PerkSnapshot } from "@/lib/squad/perk-tiers";
import { merchCodeForTier } from "@/lib/squad/merch-codes";

const GENESIS_PLAYER_IDS = Array.from({ length: 11 }, (_, i) => BigInt(i + 1));

export function useSquadPerks(address: `0x${string}` | undefined) {
  const genesisConfigured = isSquadContractConfigured();
  const v2Configured = isSquadV2Configured();

  const genesisOwnerReads = useReadContracts({
    contracts: GENESIS_PLAYER_IDS.map((playerId) => ({
      address: SQUAD_NFT_ADDRESS!,
      abi: SQUAD_NFT_ABI,
      functionName: "ownerOf" as const,
      args: [playerId] as const,
    })),
    query: {
      enabled: Boolean(address && genesisConfigured),
      staleTime: 120_000,
    },
  });

  const { data: v2Balance = 0n } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && v2Configured) },
  });

  const { data: isEarlyBeliever = false } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "earlyBeliever",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && v2Configured) },
  });

  const tokenIndexReads = useReadContracts({
    contracts: Array.from({ length: Number(v2Balance) }, (_, i) => ({
      address: SQUAD_NFT_V2_ADDRESS!,
      abi: SQUAD_NFT_V2_ABI,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(i)] as const,
    })),
    query: { enabled: Boolean(address && v2Configured && v2Balance > 0n) },
  });

  const tokenIds = useMemo(() => {
    return (tokenIndexReads.data ?? [])
      .map((r) => (r.status === "success" ? r.result : null))
      .filter((id): id is bigint => id != null);
  }, [tokenIndexReads.data]);

  const tokenDetailReads = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) => [
      {
        address: SQUAD_NFT_V2_ADDRESS!,
        abi: SQUAD_NFT_V2_ABI,
        functionName: "revealed" as const,
        args: [tokenId] as const,
      },
      {
        address: SQUAD_NFT_V2_ADDRESS!,
        abi: SQUAD_NFT_V2_ABI,
        functionName: "tokenPlayerId" as const,
        args: [tokenId] as const,
      },
    ]),
    query: { enabled: v2Configured && tokenIds.length > 0 },
  });

  const { data: jokerBalance = 0n } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "jokerBalance",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && v2Configured) },
  });

  const perks: PerkSnapshot = useMemo(() => {
    const lower = address?.toLowerCase();
    let genesisCount = 0;
    if (lower && genesisOwnerReads.data) {
      for (const row of genesisOwnerReads.data) {
        if (row.status === "success" && row.result.toLowerCase() === lower) genesisCount++;
      }
    }

    const uniquePlayers = new Set<number>();
    let v2RevealedCount = 0;
    const details = tokenDetailReads.data ?? [];
    for (let i = 0; i < tokenIds.length; i++) {
      const revealedRow = details[i * 2];
      const playerRow = details[i * 2 + 1];
      if (revealedRow?.status !== "success" || !revealedRow.result) continue;
      v2RevealedCount++;
      if (playerRow?.status === "success") {
        const playerId = Number(playerRow.result);
        if (playerId >= 1 && playerId <= 11) uniquePlayers.add(playerId);
      }
    }

    return computeSquadPerks({
      genesisCount,
      v2RevealedCount,
      v2UniquePlayers: uniquePlayers.size,
      isEarlyBeliever,
    });
  }, [
    address,
    genesisOwnerReads.data,
    tokenIds.length,
    tokenDetailReads.data,
    isEarlyBeliever,
  ]);

  const merchCode = merchCodeForTier(perks.tierId);

  return {
    perks,
    merchCode,
    jokerBalance,
    isLoading:
      genesisOwnerReads.isLoading || tokenIndexReads.isLoading || tokenDetailReads.isLoading,
  };
}
