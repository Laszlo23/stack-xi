import { Link } from "@tanstack/react-router";
import { Coins, Megaphone, Share2, Target } from "lucide-react";
import { ShareActions } from "@/features/story/ShareActions";
import { getActiveMarket } from "@/lib/story/match-markets";
import { buildSharePost } from "@/lib/growth/share-copy";
import { PREDICTION_PAYOUT_COPY } from "@/lib/predict/match-settlement";

const PROMO_LINES = [
  "Belgium 4-1 USA in Seattle — all three hosts out in the R16.",
  "Messi vs Salah in Atlanta today. Lock BCC on STACK XI.",
  "Picked Spain or Belgium? Claim pool share on profile — treasury sends BCC to your wallet.",
  "Culture > solo grind 🐸⚽",
] as const;

export function WorldCupPromoBanner() {
  const match = getActiveMarket();
  const shareText = buildSharePost(
    [
      `Next STACK XI pick: ${match.home} vs ${match.away} · ${match.kickoffLabel}`,
      "Predict on Base. Claim winnings on profile after the whistle.",
      "Pepe doesn't chase — Luck does 🐸⚽",
    ],
    { path: "/#predict", tagSeed: 42 },
  );

  return (
    <section className="border-b border-border/60 bg-gradient-to-r from-accent/10 via-primary/5 to-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass-neon rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
                <Megaphone className="h-3.5 w-3.5" />
                Matchday promo
              </div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                Predict. Share. Claim your pool share.
              </h2>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {PROMO_LINES.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">{PREDICTION_PAYOUT_COPY.howItWorks}</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link
                to="/"
                hash="predict"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110"
              >
                <Target className="h-4 w-4" />
                Predict {match.home} vs {match.away}
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                <Coins className="h-4 w-4" />
                Claim winnings →
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
              <Share2 className="h-3.5 w-3.5" />
              Spread the watch party
            </div>
            <ShareActions text={shareText} compact />
          </div>
        </div>
      </div>
    </section>
  );
}
