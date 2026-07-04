import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { BCC_SYMBOL, BCC_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/base/config";

export function useBccBalance(address?: `0x${string}`) {
  const { data: balance = 0n, isLoading: balanceLoading } = useReadContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: decimals = 18 } = useReadContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  const { data: symbol = BCC_SYMBOL } = useReadContract({
    address: BCC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
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
    isLoading: balanceLoading,
  };
}
