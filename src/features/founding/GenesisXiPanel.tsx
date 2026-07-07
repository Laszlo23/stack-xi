import { ExternalLink, Sparkles } from "lucide-react";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";
import { FOOTER_BASESCAN } from "@/lib/legal/footer-links";

/** Read-only gallery for the original 11/11 genesis squad (v1 contract) */
export function GenesisXiPanel() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl border border-primary/20 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
              <Sparkles className="h-4 w-4" />
              Genesis XI · Legend tier
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold">The original 11</h3>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              One-of-one founding cards from the first contract. Genesis holders keep permanent
              legend perks (+25% prediction boost, top merch tier) even after community packs launch.
            </p>
          </div>
          <div className="text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="text-3xl font-display font-bold text-primary">11/11</div>
            <div className="mt-1">Minted</div>
          </div>
        </div>
        <a
          href={FOOTER_BASESCAN}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          View genesis contract <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {FOUNDING_SQUAD.map((player) => (
          <div
            key={player.id}
            className="overflow-hidden rounded-xl glass border border-primary/10"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              {player.img ? (
                <img
                  src={player.img}
                  alt={player.name}
                  width={320}
                  height={400}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-90"
                />
              ) : null}
              <div className="absolute left-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 font-mono text-[9px] font-bold text-primary-foreground">
                GENESIS
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent px-2 pb-2 pt-8">
                <div className="font-display text-xs font-bold">{player.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
