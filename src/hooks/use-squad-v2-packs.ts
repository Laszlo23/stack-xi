import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import {
  SQUAD_NFT_V2_ABI,
  SQUAD_NFT_V2_ADDRESS,
  BASE_CHAIN_ID,
  isSquadV2Configured,
} from "@/lib/base/config";

export type SealedPack = {
  tokenId: bigint;
  mintOrder: bigint;
};

export type RevealedPack = SealedPack & {
  playerId: number;
  edition: number;
};

export function useSquadV2Packs(address: `0x${string}` | undefined) {
  const enabled = Boolean(address && isSquadV2Configured());

  const { data: balance = 0n, refetch: refetchBalance } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: BASE_CHAIN_ID,
    query: { enabled },
  });

  const indexReads = useReadContracts({
    contracts: Array.from({ length: Number(balance) }, (_, i) => ({
      address: SQUAD_NFT_V2_ADDRESS!,
      abi: SQUAD_NFT_V2_ABI,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(i)] as const,
    })),
    query: { enabled: enabled && balance > 0n },
  });

  const tokenIds = useMemo(() => {
    return (indexReads.data ?? [])
      .map((r) => (r.status === "success" ? r.result : null))
      .filter((id): id is bigint => id != null);
  }, [indexReads.data]);

  const detailReads = useReadContracts({
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
        functionName: "mintOrderOf" as const,
        args: [tokenId] as const,
      },
      {
        address: SQUAD_NFT_V2_ADDRESS!,
        abi: SQUAD_NFT_V2_ABI,
        functionName: "tokenPlayerId" as const,
        args: [tokenId] as const,
      },
      {
        address: SQUAD_NFT_V2_ADDRESS!,
        abi: SQUAD_NFT_V2_ABI,
        functionName: "editionOf" as const,
        args: [tokenId] as const,
      },
    ]),
    query: { enabled: enabled && tokenIds.length > 0 },
  });

  const { sealedPacks, revealedPacks } = useMemo(() => {
    const sealed: SealedPack[] = [];
    const revealed: RevealedPack[] = [];
    const details = detailReads.data ?? [];

    tokenIds.forEach((tokenId, i) => {
      const revealedRow = details[i * 4];
      const orderRow = details[i * 4 + 1];
      const playerRow = details[i * 4 + 2];
      const editionRow = details[i * 4 + 3];
      const mintOrder =
        orderRow?.status === "success" ? (orderRow.result as bigint) : 0n;

      if (revealedRow?.status === "success" && revealedRow.result) {
        revealed.push({
          tokenId,
          mintOrder,
          playerId: playerRow?.status === "success" ? Number(playerRow.result) : 0,
          edition: editionRow?.status === "success" ? Number(editionRow.result) : 0,
        });
      } else {
        sealed.push({ tokenId, mintOrder });
      }
    });

    return { sealedPacks: sealed, revealedPacks: revealed };
  }, [tokenIds, detailReads.data]);

  const { data: jokerBalance = 0n, refetch: refetchJokers } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "jokerBalance",
    args: address ? [address] : undefined,
    chainId: BASE_CHAIN_ID,
    query: { enabled },
  });

  return {
    balance,
    sealedPacks,
    revealedPacks,
    jokerBalance,
    isLoading: indexReads.isLoading || detailReads.isLoading,
    refetch: async () => {
      await refetchBalance();
      await refetchJokers();
    },
  };
}
