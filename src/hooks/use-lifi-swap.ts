import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConfig, useAccount } from "wagmi";
import { getAccount } from "wagmi/actions";
import {
  convertQuoteToRoute,
  formatUnits,
  parseUnits,
  type Route,
  type LiFiStep,
} from "@lifi/sdk";
import {
  BASE_CHAIN_ID,
  LIFI_ALLOWED_CHAIN_IDS,
  LIFI_NATIVE_TOKEN,
  LIFI_USDC_BY_CHAIN,
  type LifiAllowedChainId,
} from "@/lib/swap/lifi-config";
import { executeLifiSwap } from "@/lib/swap/lifi-execute";
import { fetchLifiQuote, LIFI_QUOTE_PREVIEW_ADDRESS } from "@/lib/swap/lifi-quote-client";
import { LIFI_CHAIN_LABELS } from "@/lib/swap/lifi-wagmi-chains";

export type LifiFromToken = "usdc" | "eth";

const TOKEN_DECIMALS: Record<LifiFromToken, number> = {
  usdc: 6,
  eth: 18,
};

const DEFAULT_SLIPPAGE = 0.03;

function fromTokenAddress(chainId: LifiAllowedChainId, token: LifiFromToken): string {
  if (token === "eth") return LIFI_NATIVE_TOKEN;
  return LIFI_USDC_BY_CHAIN[chainId];
}

function formatReceiveAmount(amount: string | undefined, decimals = 18): string {
  if (!amount || amount === "0") return "—";
  try {
    const formatted = formatUnits(BigInt(amount), decimals);
    const num = Number.parseFloat(formatted);
    if (!Number.isFinite(num)) return "—";
    if (num >= 1_000_000) {
      return `${num.toLocaleString(undefined, { maximumFractionDigits: 0 })} BCC`;
    }
    if (num >= 1_000) {
      return `${num.toLocaleString(undefined, { maximumFractionDigits: 0 })} BCC`;
    }
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} BCC`;
  } catch {
    return "—";
  }
}

export function useLifiSwap(defaultFromAmount = "25") {
  const wagmiConfig = useConfig();
  const { address, isConnected } = useAccount();

  const [fromChainId, setFromChainId] = useState<LifiAllowedChainId>(BASE_CHAIN_ID as LifiAllowedChainId);
  const [fromToken, setFromToken] = useState<LifiFromToken>("usdc");
  const [fromAmountInput, setFromAmountInput] = useState(defaultFromAmount);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [toAmount, setToAmount] = useState<string | null>(null);
  const [quoteStep, setQuoteStep] = useState<LiFiStep | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionLabel, setExecutionLabel] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [lastTxLink, setLastTxLink] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const sellSymbol = fromToken === "eth" ? "ETH" : "USDC";
  const buyAmountLabel = quoteLoading ? "Fetching…" : formatReceiveAmount(toAmount ?? undefined);
  const isBaseSwap = fromChainId === BASE_CHAIN_ID;

  useEffect(() => {
    setFromAmountInput(defaultFromAmount);
  }, [defaultFromAmount]);

  const fetchQuote = useCallback(
    async (quoteAddress?: string) => {
      abortRef.current?.abort();

      const amount = fromAmountInput.trim();
      if (!amount || Number.parseFloat(amount) <= 0) {
        setToAmount(null);
        setRoute(null);
        setQuoteStep(null);
        setQuoteError(null);
        return null;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const fromAmount = parseUnits(amount, TOKEN_DECIMALS[fromToken]).toString();
        const quote = await fetchLifiQuote(
          {
            fromChain: fromChainId,
            fromToken: fromTokenAddress(fromChainId, fromToken),
            fromAmount,
            fromAddress: quoteAddress ?? address ?? LIFI_QUOTE_PREVIEW_ADDRESS,
            toAddress: quoteAddress ?? address ?? LIFI_QUOTE_PREVIEW_ADDRESS,
            slippage: DEFAULT_SLIPPAGE,
          },
          controller.signal,
        );

        if (controller.signal.aborted) return null;

        const nextRoute = convertQuoteToRoute(quote);
        setQuoteStep(quote);
        setRoute(nextRoute);
        setToAmount(quote.estimate.toAmount);
        return quote;
      } catch (error) {
        if (controller.signal.aborted) return null;
        const message =
          error instanceof Error ? error.message : "Could not fetch quote";
        setQuoteError(message);
        setToAmount(null);
        setRoute(null);
        setQuoteStep(null);
        return null;
      } finally {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      }
    },
    [address, fromAmountInput, fromChainId, fromToken],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchQuote();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [fetchQuote]);

  const executeSwap = useCallback(async () => {
    const account = getAccount(wagmiConfig);
    const signer = account.address;
    if (!account.isConnected || !signer) {
      setSwapError("Connect your wallet to swap");
      return;
    }

    setExecuting(true);
    setSwapError(null);
    setLastTxLink(null);
    setExecutionLabel("Fetching fresh quote…");

    try {
      const freshQuote = await fetchQuote(signer);
      if (!freshQuote) {
        throw new Error("Could not refresh quote — try again");
      }

      const { explorerUrl } = await executeLifiSwap({
        wagmiConfig,
        step: freshQuote,
        onProgress: setExecutionLabel,
      });

      setLastTxLink(explorerUrl);
      setExecutionLabel("Swap complete");
      await fetchQuote(signer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Swap failed";
      setSwapError(message);
    } finally {
      setExecuting(false);
    }
  }, [fetchQuote, wagmiConfig]);

  const chainOptions = useMemo(
    () =>
      LIFI_ALLOWED_CHAIN_IDS.map((id) => ({
        id,
        label: LIFI_CHAIN_LABELS[id],
      })),
    [],
  );

  const hasValidAmount = Number.parseFloat(fromAmountInput) > 0;
  const hasQuote = Boolean(route && toAmount && !quoteError);
  const canSign = isConnected;

  return {
    isConnected,
    canSign,
    address,
    fromChainId,
    setFromChainId,
    fromToken,
    setFromToken,
    fromAmountInput,
    setFromAmountInput,
    sellSymbol,
    buyAmountLabel,
    quoteLoading,
    quoteError,
    executing,
    executionLabel,
    swapError,
    lastTxLink,
    hasQuote,
    hasValidAmount,
    isBaseSwap,
    canSwap: hasQuote && hasValidAmount && canSign && !quoteLoading && !executing,
    executeSwap,
    chainOptions,
    quoteStep,
  };
}
