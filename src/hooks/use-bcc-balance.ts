import { formatUnits } from "viem";
import { base } from "viem/chains";
import { useReadContract } from "wagmi";
import { useResolvedWalletAddress } from "@/hooks/use-resolved-wallet-address";
import { BCC_SYMBOL, BCC_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/base/config";

export function useBccBalance(explicitAddress?: `0x${string}`) {
  const resolvedAddress = useResolvedWalletAddress();
  const address = explicitAddress ?? resolvedAddress;

  const { data: balance = 0n, isLoading: balanceLoading, isFetching, refetch } = useReadContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: Boolean(address),
      staleTime: 15_000,
      refetchOnWindowFocus: true,
    },
  });

  const { data: decimals = 18 } = useReadContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
    chainId: base.id,
  });

  const { data: symbol = BCC_SYMBOL } = useReadContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
    chainId: base.id,
  });

  const formatted =
    address && balance !== undefined
      ? Number(formatUnits(balance, decimals)).toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })
      : "0";

  return {
    balance,
    decimals,
    symbol,
    formatted,
    isLoading: balanceLoading || isFetching,
    refetch,
  };
}
