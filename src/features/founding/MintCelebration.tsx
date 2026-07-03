import { useState } from "react";
import { Check, Copy, PartyPopper, Trophy, Video } from "lucide-react";
import { PepeBubble } from "@/features/story/PepeBubble";
import { MINT_SUCCESS_MESSAGE } from "@/lib/story/pepe-script";
import { mintTierLabel } from "@/lib/squad/mint-game";
import { BASESCAN_URL, formatUsdc } from "@/lib/base/config";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";

export type MintCelebrationData = {
  playerId: number;
  mintOrder: number;
  pricePaid: bigint;
  nextPrice: bigint;
  txHash: string;
};

export function MintCelebration({
  data,
  onClose,
}: {
  data: MintCelebrationData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const player = FOUNDING_SQUAD.find((p) => p.id === data.playerId);
  const tier = mintTierLabel(data.mintOrder);

  const castText = `Just minted ${player?.name ?? `Player #${data.playerId}`} on @stackxi 🐸⚽ Mint #${data.mintOrder} from ${formatUsdc(data.pricePaid)}. Personal video shout-out incoming from @0xleonardo — team culture > solo grind. @jessepollak @dwr builders who ship with heart 💜`;

  async function copyCast() {
    await navigator.clipboard.writeText(castText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
      <div className="glass-neon max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <PartyPopper className="h-4 w-4" />
          You minted · {tier}
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold">{player?.name ?? "Squad player"}</h3>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          Mint #{data.mintOrder} · {formatUsdc(data.pricePaid)} · Next mint{" "}
          {formatUsdc(data.nextPrice)}
        </p>

        <div className="mt-6 space-y-4">
          <PepeBubble beat={MINT_SUCCESS_MESSAGE} large luckMeter={98} />

          <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
            <div className="flex items-center gap-2 font-display font-bold text-primary">
              <Video className="h-5 w-5" />
              Video shout-out queued
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Leonardo will record a personal thank-you, tag your Farcaster/X handle, and post it.
              You made the squad real — respect back.
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
              Copy for Farcaster
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{castText}</p>
            <button
              type="button"
              onClick={() => void copyCast()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy cast"}
            </button>
          </div>

          <a
            href={`${BASESCAN_URL}/tx/${data.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center font-mono text-xs text-primary hover:underline"
          >
            View on BaseScan →
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)]"
        >
          Back to squad
        </button>
      </div>
    </div>
  );
}

export function MintArenaHeader({
  mintCount,
  currentPrice,
  nextPrice,
  remaining,
}: {
  mintCount: bigint;
  currentPrice: bigint;
  nextPrice: bigint;
  remaining: bigint;
}) {
  const filled = Number(mintCount);
  const total = 11;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="glass-neon rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Trophy className="h-4 w-4" />
            Squad mint game
          </div>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Starts at <strong className="text-foreground">$0.77</strong>. Every mint raises the
            price by <strong className="text-foreground">$0.07</strong>. Early minters win on price
            + perks. Everyone gets a personal video shout-out.
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">Mint now</div>
          <div className="font-display text-3xl font-bold text-primary">
            {formatUsdc(currentPrice)}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            then {formatUsdc(nextPrice)}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
          <span>
            {filled}/{total} minted
          </span>
          <span>{Number(remaining)} left</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {filled >= 10 && (
          <p className="mt-2 font-mono text-xs text-primary animate-pulse">
            Final mints — last dance pricing activated
          </p>
        )}
      </div>
    </div>
  );
}
