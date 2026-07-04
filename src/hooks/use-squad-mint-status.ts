import { useReadContract } from "wagmi";
import { SQUAD_NFT_ABI, SQUAD_NFT_ADDRESS, isSquadContractConfigured } from "@/lib/base/config";
import { TOTAL_SQUAD_PLAYERS } from "@/lib/squad/mint-game";

export function useSquadMintStatus() {
  const configured = isSquadContractConfigured();

  const { data: mintCount = 0n, isLoading } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "mintCount",
    query: { enabled: configured },
  });

  const isSoldOut = configured && mintCount >= BigInt(TOTAL_SQUAD_PLAYERS);

  return {
    mintCount,
    isSoldOut,
    isConfigured: configured,
    isLoading: configured && isLoading,
  };
}
