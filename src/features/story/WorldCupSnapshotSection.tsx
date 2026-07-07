import { Link } from "@tanstack/react-router";
import { WORLD_CUP_SNAPSHOT } from "@/lib/story/world-cup-2026-snapshot";

export function WorldCupSnapshotSection() {
  const {
    asOf,
    phase,
    winnerPick,
    finalDate,
    quarterfinalists,
    confirmedQuarterfinals,
    recentResults,
    todayFixtures,
    nextHighlight,
    bracketNote,
  } = WORLD_CUP_SNAPSHOT;

  return (
    <section className="border-y border-border/60 bg-surface/30 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              World Cup 2026 · live bracket
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{phase}</h2>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Updated {asOf} · Final {finalDate}
            </p>
          </div>
          <p className="max-w-sm text-right font-mono text-xs text-accent">{bracketNote}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="glass-neon rounded-2xl p-5 lg:col-span-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Quarterfinalists so far
            </div>
            <ul className="mt-4 space-y-2">
              {quarterfinalists.map((team) => (
                <li
                  key={team}
                  className={`font-display text-lg font-bold ${
                    team === winnerPick ? "text-primary" : "text-foreground"
                  }`}
                >
                  {team}
                  {team === winnerPick && (
                    <span className="ml-2 font-mono text-[10px] font-normal uppercase text-primary">
                      · Leonardo&apos;s pick
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-border/40 pt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Confirmed QF ties
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
                {confirmedQuarterfinals.map((tie) => (
                  <li key={tie}>{tie}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 lg:col-span-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Live window · Jul 6–7
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {todayFixtures.map((fixture) => (
                <li key={fixture} className="text-foreground/90">
                  {fixture}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-xs text-accent">{nextHighlight}</p>
            <Link
              to="/"
              hash="predict"
              className="mt-4 inline-flex text-xs font-bold text-primary hover:underline"
            >
              Lock next pick with BCC →
            </Link>
          </div>

          <div className="glass rounded-2xl p-5 lg:col-span-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Latest results
            </div>
            <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto text-sm text-foreground/85">
              {recentResults.map((result) => (
                <li key={result} className="border-b border-border/20 pb-2 last:border-0">
                  {result}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
