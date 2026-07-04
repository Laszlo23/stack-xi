import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useReadContract } from "wagmi";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { MintArenaHeader } from "@/features/founding/MintCelebration";
import {
  BCC_BASESCAN_URL,
  BCC_UNIT,
  MINT_BASE_PRICE_BCC,
  MINT_PRICE_INCREMENT_BCC,
  SQUAD_NFT_ABI,
  SQUAD_NFT_ADDRESS,
  formatBcc,
  isSquadContractConfigured,
} from "@/lib/base/config";
import { currentMintPrice, nextMintPrice } from "@/lib/squad/mint-game";

export function BondingCurveBlock() {
  const enabled = isSquadContractConfigured();

  const { data: mintCount = 0n } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "mintCount",
    query: { enabled },
  });

  const { data: onChainCurrentPrice } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "currentMintPrice",
    query: { enabled },
  });

  const { data: onChainNextPrice } = useReadContract({
    address: SQUAD_NFT_ADDRESS,
    abi: SQUAD_NFT_ABI,
    functionName: "nextMintPrice",
    query: { enabled },
  });

  const currentPrice = onChainCurrentPrice ?? currentMintPrice(mintCount);
  const nextPrice = onChainNextPrice ?? nextMintPrice(mintCount);
  const filled = Number(mintCount);
  const steps = Array.from({ length: 12 }, (_, i) => {
    const price = MINT_BASE_PRICE_BCC + MINT_PRICE_INCREMENT_BCC * BigInt(Math.min(i, 11));
    return { step: i, price: Number(price / BCC_UNIT) };
  });

  return (
    <article className="defi-tilt-card-reverse glass rounded-2xl p-6 sm:p-8">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent">Block 02</div>
      <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Founding Squad Curve</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Mint fees route into the BCC culture treasury. Liquidity depth grows with every founding
        player.
      </p>
      <div className="mt-4">
        <BccTokenChip compact />
      </div>
      <a
        href={BCC_BASESCAN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
      >
        BCC on BaseScan
        <ExternalLink className="h-3 w-3" />
      </a>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="defi-curve-panel rounded-xl border border-border/40 bg-background/40 p-4">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">Bonding curve</div>
          <p className="mt-1 font-display text-lg font-bold text-primary">
            {formatBcc(MINT_BASE_PRICE_BCC)} → +{formatBcc(MINT_PRICE_INCREMENT_BCC)} per mint
          </p>
          <svg viewBox="0 0 320 160" className="mt-4 w-full" aria-hidden>
            <defs>
              <linearGradient id="curveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.88 0.28 145 / 0.2)" />
                <stop offset="100%" stopColor="oklch(0.88 0.28 145 / 0.9)" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="url(#curveGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              className="defi-curve-line"
              points={steps
                .map((s, i) => {
                  const x = 20 + (i / 11) * 280;
                  const y = 140 - (s.price / steps[11].price) * 110;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            {steps.map((s, i) => {
              if (i !== filled && i !== filled + 1) return null;
              const x = 20 + (i / 11) * 280;
              const y = 140 - (s.price / steps[11].price) * 110;
              return (
                <circle key={s.step} cx={x} cy={y} r="6" className="defi-curve-dot fill-primary" />
              );
            })}
          </svg>
          <p className="mt-2 text-center font-mono text-[10px] uppercase text-muted-foreground">
            Early believers define valuation
          </p>
        </div>

        <div>
          {enabled ? (
            <MintArenaHeader
              mintCount={mintCount}
              currentPrice={currentPrice}
              nextPrice={nextPrice}
              remaining={11n - mintCount}
            />
          ) : (
            <div className="glass-neon rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">Squad contract not configured.</p>
            </div>
          )}
        </div>
      </div>

      <Link
        to="/"
        hash="squad"
        className="defi-energy-btn mt-8 inline-flex rounded-xl border border-primary/50 bg-primary/10 px-6 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
      >
        Mint Squad Position →
      </Link>
    </article>
  );
}
