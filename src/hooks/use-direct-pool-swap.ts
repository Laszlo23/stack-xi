import { useCallback, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useResolvedWalletAddress } from "@/hooks/use-resolved-wallet-address";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ERC20_ABI, USDC_ADDRESS } from "@/lib/base/config";
import {
  AERODROME_ROUTER_ABI,
  AERODROME_ROUTER_ADDRESS,
  aerodromeRoutesForPreset,
  minAmountOut,
  swapDeadline,
} from "@/lib/swap/aerodrome-config";
import {
  BCC_TOKEN,
  DEFAULT_SWAP_SLIPPAGE,
  ETH_TOKEN,
  USDC_TOKEN,
  type SwapPreset,
} from "@/lib/swap/swap-config";

function sellDecimalsForPreset(preset: SwapPreset): number {
  return preset === "eth-bcc" ? ETH_TOKEN.decimals : USDC_TOKEN.decimals;
}

export function useDirectPoolSwap(preset: SwapPreset, sellAmountInput: string) {
  const { isConnected } = useAccount();
  const address = useResolvedWalletAddress();
  const { writeContractAsync } = useWriteContract();

  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | null>(null);

  const sellDecimals = sellDecimalsForPreset(preset);
  const isEth = preset === "eth-bcc";
  const routes = useMemo(() => aerodromeRoutesForPreset(preset), [preset]);

  let sellAmount: bigint | null = null;
  try {
    if (sellAmountInput && Number(sellAmountInput) > 0) {
      sellAmount = parseUnits(sellAmountInput, sellDecimals);
    }
  } catch {
    sellAmount = null;
  }

  const { data: quoteAmounts, isFetching: quoteLoading, error: quoteReadError } = useReadContract({
    address: AERODROME_ROUTER_ADDRESS,
    abi: AERODROME_ROUTER_ABI,
    functionName: "getAmountsOut",
    args: sellAmount && sellAmount > 0n ? [sellAmount, routes] : undefined,
    query: {
      enabled: Boolean(sellAmount && sellAmount > 0n),
      staleTime: 15_000,
    },
  });

  const buyAmount =
    quoteAmounts && quoteAmounts.length > 0 ? quoteAmounts[quoteAmounts.length - 1] : null;
  const quoteError =
    sellAmount && sellAmount > 0n && quoteReadError
      ? quoteReadError instanceof Error
        ? quoteReadError.message
        : "Quote unavailable"
      : null;

  const { data: allowance = 0n, refetch: refetchAllowance } = useReadContract({
    address: isEth ? undefined : USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, AERODROME_ROUTER_ADDRESS] : undefined,
    query: {
      enabled: Boolean(!isEth && address),
    },
  });

  const buyAmountLabel =
    buyAmount != null
      ? `${Number(formatUnits(buyAmount, BCC_TOKEN.decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 })} BCC`
      : "—";

  const needsApproval = !isEth && sellAmount != null && sellAmount > 0n && allowance < sellAmount;

  const executeSwap = useCallback(async () => {
    if (!isConnected || !address || !sellAmount || sellAmount <= 0n || buyAmount == null || buyAmount <= 0n) {
      return;
    }

    setSwapping(true);
    setSwapError(null);

    try {
      const amountOutMin = minAmountOut(buyAmount, DEFAULT_SWAP_SLIPPAGE);
      const deadline = swapDeadline();

      if (!isEth && allowance < sellAmount) {
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [AERODROME_ROUTER_ADDRESS, sellAmount],
        });
        await refetchAllowance();
      }

      if (isEth) {
        const hash = await writeContractAsync({
          address: AERODROME_ROUTER_ADDRESS,
          abi: AERODROME_ROUTER_ABI,
          functionName: "swapExactETHForTokens",
          args: [amountOutMin, routes, address, deadline],
          value: sellAmount,
        });
        setLastTxHash(hash);
      } else {
        const hash = await writeContractAsync({
          address: AERODROME_ROUTER_ADDRESS,
          abi: AERODROME_ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [sellAmount, amountOutMin, routes, address, deadline],
        });
        setLastTxHash(hash);
      }
    } catch (err) {
      setSwapError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setSwapping(false);
    }
  }, [
    isConnected,
    address,
    sellAmount,
    buyAmount,
    isEth,
    allowance,
    routes,
    writeContractAsync,
    refetchAllowance,
  ]);

  return {
    price: buyAmount != null ? { buyAmount: buyAmount.toString() } : null,
    priceLoading: quoteLoading,
    priceError: quoteError,
    buyAmountLabel,
    needsApproval,
    swapping,
    swapError,
    lastTxHash,
    executeSwap,
    sellAmount,
  };
}
