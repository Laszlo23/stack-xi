import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { BCC_SYMBOL, formatBcc } from "@/lib/base/config";

type BccBuyAdvisorProps = {
  intent: "mint" | "predict";
  requiredAmount: bigint;
  onSuggestBuy?: (usdcAmount: string) => void;
};

const BUFFER_BPS = 1100n;

export function BccBuyAdvisor({ intent, requiredAmount, onSuggestBuy }: BccBuyAdvisorProps) {
  const { bccBalance } = useBaseWallet();

  const { shortfall, suggestedUsdc } = useMemo(() => {
    const gap = requiredAmount > bccBalance ? requiredAmount - bccBalance : 0n;
    const buffered = (gap * BUFFER_BPS) / 1000n;
    const bccHuman = Number(buffered) / 1e18;
    const usdc = gap > 0n ? String(Math.max(5, Math.ceil(bccHuman * 10) / 10)) : "10";
    return { shortfall: gap, suggestedUsdc: usdc };
  }, [bccBalance, requiredAmount]);

  if (shortfall <= 0n) return null;

  const action = intent === "mint" ? "mint your squad player" : "lock your prediction stake";

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        BCC buy advisor
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        To {action}, buy at least{" "}
        <span className="font-mono font-bold text-foreground">{formatBcc(shortfall)}</span>{" "}
        {BCC_SYMBOL}. We suggest ~{suggestedUsdc} USDC (+10% buffer for slippage).
      </p>
      {onSuggestBuy && (
        <button
          type="button"
          onClick={() => onSuggestBuy(suggestedUsdc)}
          className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
        >
          Prefill {suggestedUsdc} USDC swap →
        </button>
      )}
    </div>
  );
}
