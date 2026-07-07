import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useReadContract } from "wagmi";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { MintArenaHeader } from "@/features/founding/MintCelebration";
import {
  BCC_BASESCAN_URL,
  BCC_UNIT,
  SQUAD_NFT_V2_ABI,
  SQUAD_NFT_V2_ADDRESS,
  SQUAD_V2_BASE_PRICE_BCC,
  SQUAD_V2_MAX_SUPPLY,
  SQUAD_V2_PRICE_INCREMENT_BCC,
  formatBcc,
  isSquadV2Configured,
} from "@/lib/base/config";
import { v2CurrentMintPrice, v2NextMintPrice } from "@/lib/squad/mint-game";

export function BondingCurveBlock() {
  const enabled = isSquadV2Configured();

  const { data: mintCount = 0n } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "mintCount",
    query: { enabled },
  });

  const { data: onChainCurrentPrice } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "currentMintPrice",
    query: { enabled },
  });

  const { data: onChainNextPrice } = useReadContract({
    address: SQUAD_NFT_V2_ADDRESS,
    abi: SQUAD_NFT_V2_ABI,
    functionName: "nextMintPrice",
    query: { enabled },
  });

  const currentPrice = onChainCurrentPrice ?? v2CurrentMintPrice(mintCount);
  const nextPrice = onChainNextPrice ?? v2NextMintPrice(mintCount);
  const filled = Number(mintCount);
  const steps = Array.from({ length: 12 }, (_, i) => {
    const price =
      SQUAD_V2_BASE_PRICE_BCC + SQUAD_V2_PRICE_INCREMENT_BCC * BigInt(Math.min(i * 70, 770));
    return { step: i, price: Number(price / BCC_UNIT) };
  });

  return (
    <article className="defi-tilt-card-reverse glass rounded-2xl p-6 sm:p-8">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent">Block 02</div>
      <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Blind Pack Curve</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        847 sealed packs, 77 editions per player. Mint fees route into the BCC culture treasury.
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
            {formatBcc(SQUAD_V2_BASE_PRICE_BCC)} → +{formatBcc(SQUAD_V2_PRICE_INCREMENT_BCC)} per
            pack
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
          </svg>
          <p className="mt-2 text-center font-mono text-[10px] uppercase text-muted-foreground">
            First 77 minters = early believer + joker
          </p>
        </div>

        <div>
          {enabled ? (
            <MintArenaHeader
              mintCount={mintCount}
              currentPrice={currentPrice}
              nextPrice={nextPrice}
              remaining={BigInt(SQUAD_V2_MAX_SUPPLY) - mintCount}
              maxSupply={SQUAD_V2_MAX_SUPPLY}
            />
          ) : (
            <div className="glass-neon rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">Squad v2 contract not configured.</p>
            </div>
          )}
        </div>
      </div>

      <Link
        to="/squad"
        className="defi-energy-btn mt-8 inline-flex rounded-xl border border-primary/50 bg-primary/10 px-6 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
      >
        Mint sealed pack →
      </Link>
    </article>
  );
}
