import { SectionHead } from "@/components/layout/SectionHead";
import type { FoundingPlayer } from "@/domain/types";
import { FOUNDING_SQUAD } from "@/lib/mock/squad-data";

function PlayerCard({ player }: { player: FoundingPlayer }) {
  const accentColor =
    player.accent === "neon"
      ? "var(--neon)"
      : player.accent === "electric"
        ? "var(--electric)"
        : "var(--magenta)";
  const rarityBg =
    player.rarity === "Mythic"
      ? "bg-[oklch(0.72_0.28_340)]/20 text-[oklch(0.85_0.2_340)] border-[oklch(0.72_0.28_340)]/50"
      : player.rarity === "Legendary"
        ? "bg-primary/15 text-primary border-primary/40"
        : player.rarity === "Rare"
          ? "bg-accent/15 text-accent border-accent/40"
          : "bg-muted text-muted-foreground border-border";

  return (
    <div className="group relative overflow-hidden rounded-2xl glass transition hover:-translate-y-1 hover:shadow-[0_0_40px_oklch(0.88_0.28_145/0.35)]">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />
      <div className="flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-muted-foreground">#{String(player.id).padStart(2, "0")}</span>
        <span className={`rounded border px-1.5 py-0.5 ${rarityBg}`}>{player.rarity}</span>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden">
        {player.img ? (
          <img
            src={player.img}
            alt={player.name}
            width={640}
            height={800}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${accentColor} / 0.25, transparent 70%), linear-gradient(180deg, oklch(0.18 0.03 240), oklch(0.12 0.02 240))`,
            }}
          >
            <div className="text-6xl opacity-30" style={{ color: accentColor }}>
              ⚽
            </div>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 55%, oklch(0.12 0.02 240 / 0.95))",
          }}
        />
        {!player.unlocked && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
            <div className="rounded-lg border border-border bg-background/70 px-3 py-1.5 font-mono text-xs">
              🔒 LOCKED
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-3 right-3">
          <div className="font-display text-sm font-bold leading-tight sm:text-base">
            {player.name}
          </div>
          <div className="text-xs text-muted-foreground">{player.role}</div>
        </div>
      </div>

      <div className="space-y-2 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Form</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full"
                  style={{
                    width: `${player.form}%`,
                    background: `linear-gradient(90deg, ${accentColor}, var(--neon))`,
                  }}
                />
              </div>
              <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>
                {player.form}
              </span>
            </div>
          </div>
          <button
            type="button"
            disabled={!player.unlocked}
            className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
          >
            {player.unlocked ? "Mint" : "Soon"}
          </button>
        </div>

        {player.unlocked && (
          <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
            <div className="rounded border border-border/60 bg-background/40 p-1.5 text-center">
              <div className="text-muted-foreground">Win</div>
              <div className="font-bold text-primary">{player.winRate}%</div>
            </div>
            <div className="rounded border border-border/60 bg-background/40 p-1.5 text-center">
              <div className="text-muted-foreground">Yield</div>
              <div className="font-bold">{player.yieldEarned}</div>
            </div>
            <div className="rounded border border-border/60 bg-background/40 p-1.5 text-center">
              <div className="text-muted-foreground">Score</div>
              <div className="font-bold">{player.participationScore}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FoundingSquadSection() {
  return (
    <section id="founding" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHead
        eyebrow="Founding Squad · Performance NFTs"
        title={
          <>
            Eleven founders. <span className="text-gradient">One chain league.</span>
          </>
        }
        sub="First mint = founding squad. Governance power, fee share multiplier, early market access, and legend status evolution."
      />

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {FOUNDING_SQUAD.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  );
}
