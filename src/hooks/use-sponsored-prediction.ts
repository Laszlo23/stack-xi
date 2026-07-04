import { useQuery } from "@tanstack/react-query";
import { useReadContracts } from "wagmi";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import {
  PREDICTION_SPONSOR_ABI,
  PREDICTION_SPONSOR_ADDRESS,
  SPONSORED_PREDICTION_MAX,
  isSponsorConfigured,
} from "@/lib/base/config";

export type SponsorEligibilityStatus = {
  socialEligible: boolean;
  farcasterConnected: boolean;
  xConnected: boolean;
  onChainAllowed: boolean | null;
  canUseSponsored: boolean;
  reason: string;
};

const DEFAULT_STATUS: SponsorEligibilityStatus = {
  socialEligible: false,
  farcasterConnected: false,
  xConnected: false,
  onChainAllowed: null,
  canUseSponsored: false,
  reason: "Connect Farcaster (verified FID) or link your X account on Profile first.",
};

async function fetchSponsorEligibility(address: string): Promise<SponsorEligibilityStatus> {
  const res = await fetch(`/api/sponsor/eligibility?address=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error("Failed to load sponsor eligibility");
  return (await res.json()) as SponsorEligibilityStatus;
}

export function useSponsoredPrediction() {
  const { address } = useBaseWallet();
  const configured = isSponsorConfigured();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: configured
      ? [
          {
            address: PREDICTION_SPONSOR_ADDRESS!,
            abi: PREDICTION_SPONSOR_ABI,
            functionName: "remainingSlots",
          },
          ...(address
            ? [
                {
                  address: PREDICTION_SPONSOR_ADDRESS!,
                  abi: PREDICTION_SPONSOR_ABI,
                  functionName: "isEligible" as const,
                  args: [address] as const,
                },
                {
                  address: PREDICTION_SPONSOR_ADDRESS!,
                  abi: PREDICTION_SPONSOR_ABI,
                  functionName: "hasUsedSponsored" as const,
                  args: [address] as const,
                },
              ]
            : []),
        ]
      : [],
    query: { enabled: configured },
  });

  const {
    data: socialGate,
    isLoading: socialLoading,
    refetch: refetchSocial,
  } = useQuery({
    queryKey: ["sponsor-eligibility", address],
    queryFn: () => fetchSponsorEligibility(address!),
    enabled: configured && Boolean(address),
  });

  const remainingSlots = configured ? Number(data?.[0]?.result ?? 0n) : 0;
  const onChainEligible = configured && address ? Boolean(data?.[1]?.result) : false;
  const hasUsed = configured && address ? Boolean(data?.[2]?.result) : false;
  const gate = socialGate ?? DEFAULT_STATUS;
  const isEligible = onChainEligible && gate.socialEligible;

  return {
    isConfigured: configured,
    isLoading: isLoading || socialLoading,
    remainingSlots,
    maxSlots: SPONSORED_PREDICTION_MAX,
    isEligible,
    onChainEligible,
    hasUsed,
    socialGate: gate,
    refetch: async () => {
      await Promise.all([refetch(), refetchSocial()]);
    },
  };
}

export function useSponsoredPredictionOptional() {
  return useSponsoredPrediction();
}
