import { ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { SquadHolding } from "@/domain/types";
import { BASESCAN_URL, SQUAD_NFT_ADDRESS } from "@/lib/base/config";

function HoldingCard({ holding }: { holding: SquadHolding }) {
  const { player, mintOrder } = holding;
  const accentColor =
    player.accent === "neon"
      ? "var(--neon)"
      : player.accent === "electric"
        ? "var(--electric)"
        : "var(--magenta)";

  return (
    <div className="group overflow-hidden rounded-2xl glass transition hover:-translate-y-1 hover:border-primary/40">
      <div className="relative aspect-[3/4] overflow-hidden">
        {player.img ? (
          <img
            src={player.img}
            alt={player.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-muted text-4xl">⚽</div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 50%, oklch(0.12 0.02 240 / 0.95))",
          }}
        />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="font-display font-bold">{player.name}</div>
          <div className="text-xs text-muted-foreground">{player.role}</div>
          {mintOrder > 0 && (
            <div className="mt-1 font-mono text-[10px] text-primary">Mint #{mintOrder}</div>
          )}
        </div>
        <span
          className="absolute left-2 top-2 rounded border px-1.5 py-0.5 font-mono text-[10px]"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          #{String(player.id).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export function SquadHoldingsPanel({
  holdings,
  isLoading,
  isConfigured,
}: {
  holdings: SquadHolding[];
  isLoading: boolean;
  isConfigured: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            My squad
          </div>
          <h2 className="font-display text-2xl font-bold">Founding NFTs you own</h2>
        </div>
        {SQUAD_NFT_ADDRESS && (
          <a
            href={`${BASESCAN_URL}/address/${SQUAD_NFT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            View contract
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {!isConfigured && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Squad contract not configured.
        </p>
      )}

      {isLoading && isConfigured && (
        <p className="text-sm text-muted-foreground">Loading on-chain holdings…</p>
      )}

      {!isLoading && holdings.length === 0 && isConfigured && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">No squad NFTs in this wallet yet.</p>
          <Link
            to="/"
            hash="squad"
            className="mt-4 inline-flex cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Mint from 770 BCC →
          </Link>
        </div>
      )}

      {holdings.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {holdings.map((holding) => (
            <HoldingCard key={holding.player.id} holding={holding} />
          ))}
        </div>
      )}
    </section>
  );
}
