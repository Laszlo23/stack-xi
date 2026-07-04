import { useCallback, useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useSendTransaction, useWriteContract } from "wagmi";
import { BCC_TOKEN_ADDRESS, ERC20_ABI, USDC_ADDRESS, USDC_DECIMALS } from "@/lib/base/config";
import { fetchZeroXPrice, fetchZeroXQuote } from "@/lib/swap/zerox-api";
import {
  BCC_TOKEN,
  DEFAULT_SWAP_SLIPPAGE,
  ETH_PLACEHOLDER,
  ETH_TOKEN,
  USDC_TOKEN,
  type SwapPreset,
} from "@/lib/swap/swap-config";
import type { ZeroXPriceResponse } from "@/lib/swap/zerox-types";

function sellTokenForPreset(preset: SwapPreset): `0x${string}` {
  return preset === "eth-bcc" ? ETH_PLACEHOLDER : USDC_ADDRESS;
}

function sellDecimalsForPreset(preset: SwapPreset): number {
  return preset === "eth-bcc" ? ETH_TOKEN.decimals : USDC_TOKEN.decimals;
}

export function useZeroXSwap(preset: SwapPreset, sellAmountInput: string) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const [price, setPrice] = useState<ZeroXPriceResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | null>(null);

  const sellToken = sellTokenForPreset(preset);
  const sellDecimals = sellDecimalsForPreset(preset);
  const isEth = preset === "eth-bcc";

  let sellAmount: bigint | null = null;
  try {
    if (sellAmountInput && Number(sellAmountInput) > 0) {
      sellAmount = parseUnits(sellAmountInput, sellDecimals);
    }
  } catch {
    sellAmount = null;
  }

  const { data: allowance = 0n } = useReadContract({
    address: isEth ? undefined : USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      address && price?.issues?.allowance?.spender
        ? [address, price.issues.allowance.spender as `0x${string}`]
        : undefined,
    query: {
      enabled: Boolean(!isEth && address && price?.issues?.allowance?.spender),
    },
  });

  useEffect(() => {
    if (!address || !sellAmount || sellAmount <= 0n) {
      setPrice(null);
      setPriceError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setPriceLoading(true);
      setPriceError(null);
      void fetchZeroXPrice({
        sellToken,
        buyToken: BCC_TOKEN_ADDRESS,
        sellAmount: sellAmount.toString(),
        taker: address,
        slippageBps: DEFAULT_SWAP_SLIPPAGE * 100,
      })
        .then((data) => {
          if (!controller.signal.aborted) setPrice(data);
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            setPrice(null);
            setPriceError(err instanceof Error ? err.message : "Price unavailable");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setPriceLoading(false);
        });
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [address, sellAmount, sellToken]);

  const buyAmountLabel =
    price?.buyAmount != null
      ? `${Number(formatUnits(BigInt(price.buyAmount), BCC_TOKEN.decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 })} BCC`
      : "—";

  const needsApproval =
    !isEth &&
    price?.issues?.allowance?.spender != null &&
    price.issues.allowance.required != null &&
    allowance < BigInt(price.issues.allowance.required);

  const executeSwap = useCallback(async () => {
    if (!address || !sellAmount || sellAmount <= 0n) return;

    setSwapping(true);
    setSwapError(null);

    try {
      const quote = await fetchZeroXQuote({
        sellToken,
        buyToken: BCC_TOKEN_ADDRESS,
        sellAmount: sellAmount.toString(),
        taker: address,
        slippageBps: DEFAULT_SWAP_SLIPPAGE * 100,
      });

      const spender = quote.issues?.allowance?.spender as `0x${string}` | undefined;
      const required = quote.issues?.allowance?.required;

      if (!isEth && spender && required && allowance < BigInt(required)) {
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, BigInt(required)],
        });
      }

      const hash = await sendTransactionAsync({
        to: quote.transaction.to,
        data: quote.transaction.data,
        value: quote.transaction.value ? BigInt(quote.transaction.value) : undefined,
        gas: quote.transaction.gas ? BigInt(quote.transaction.gas) : undefined,
      });

      setLastTxHash(hash);
      setPrice(null);
    } catch (err) {
      setSwapError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setSwapping(false);
    }
  }, [address, sellAmount, sellToken, isEth, allowance, writeContractAsync, sendTransactionAsync]);

  return {
    price,
    priceLoading,
    priceError,
    buyAmountLabel,
    needsApproval,
    swapping,
    swapError,
    lastTxHash,
    executeSwap,
    sellAmount,
  };
}
