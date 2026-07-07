import { ExternalLink, Target, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";
import { FOOTER_BASESCAN } from "@/lib/legal/footer-links";

export function SquadSoldOutPanel({ totalSupply = 847 }: { totalSupply?: number }) {
  return (
    <div className="space-y-8">
      <div className="glass-neon rounded-2xl border-primary/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
              <Trophy className="h-4 w-4" />
              Founding squad · sold out
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold">All {totalSupply} packs minted</h3>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              The blind-pack curve closed. Every edition has a minter. Trade on secondary markets,
              stack perks on profile, or predict the next matchday with BCC.
            </p>
          </div>
          <div className="text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="text-3xl font-display font-bold text-primary">
              {totalSupply}/{totalSupply}
            </div>
            <div className="mt-1">Complete</div>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-primary/70 to-primary" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#predict"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] transition hover:brightness-110"
          >
            <Target className="h-4 w-4" />
            Predict next matchday
          </a>
          <a
            href={FOOTER_BASESCAN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20"
          >
            <ExternalLink className="h-4 w-4" />
            View squad on BaseScan
          </a>
          <Link
            to="/proof"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40"
          >
            Onchain proof →
          </Link>
        </div>
      </div>

      <div>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          The founding XI · IPFS art
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {FOUNDING_SQUAD.map((player) => (
            <div
              key={player.id}
              className="overflow-hidden rounded-xl glass transition hover:-translate-y-0.5"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {player.img ? (
                  <img
                    src={player.img}
                    alt={player.name}
                    width={320}
                    height={400}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent px-2 pb-2 pt-8">
                  <div className="font-display text-xs font-bold">{player.name}</div>
                  <div className="font-mono text-[9px] text-muted-foreground">#{player.id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
