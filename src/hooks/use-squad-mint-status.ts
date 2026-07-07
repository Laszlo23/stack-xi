import { useReadContract } from "wagmi";
import {
  SQUAD_NFT_V2_ABI,
  SQUAD_NFT_V2_ADDRESS,
  SQUAD_V2_MAX_SUPPLY,
  BASE_CHAIN_ID,
  isSquadV2Configured,
} from "@/lib/base/config";

export function useSquadMintStatus() {
  const v2Configured = isSquadV2Configured();

  const { data: mintCount = 0n, isLoading } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "mintCount",
    chainId: BASE_CHAIN_ID,
    query: { enabled: v2Configured },
  });

  const isSoldOut = v2Configured && mintCount >= BigInt(SQUAD_V2_MAX_SUPPLY);

  return {
    mintCount,
    maxSupply: SQUAD_V2_MAX_SUPPLY,
    isSoldOut,
    isConfigured: v2Configured,
    isLoading: v2Configured && isLoading,
    isV2: true,
  };
}
