import { useState } from "react";
import { SectionHead } from "@/components/layout/SectionHead";
import type { MatchMarket, PositionSide } from "@/domain/types";
import { POSITION_SIDE_LABELS } from "@/domain/constants";
import { formatUsd, sideToTeam } from "@/lib/mock/protocol-data";
import { useProtocol } from "@/hooks/use-protocol-state";

function statusBadge(status: MatchMarket["status"]) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-primary">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live
      </span>
    );
  }
  if (status === "settled") return <span className="text-muted-foreground">Settled</span>;
  return <span className="text-accent">Upcoming</span>;
}

function ProbBar({ label, value, active }: { label: string; value: number; active?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className={active ? "text-primary" : ""}>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: active
              ? "var(--gradient-neon)"
              : "linear-gradient(90deg, var(--electric), transparent)",
          }}
        />
      </div>
    </div>
  );
}

function MarketCard({ market }: { market: MatchMarket }) {
  const { openPosition } = useProtocol();
  const [stake, setStake] = useState("50");
  const [selectedSide, setSelectedSide] = useState<PositionSide | null>(null);
  const disabled = market.status === "settled";

  const sides: PositionSide[] = ["long", "short", "draw"];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{market.stage}</span>
        {statusBadge(market.status)}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <TeamBlock name={market.home} />
        <div className="font-display text-2xl font-bold text-muted-foreground">VS</div>
        <TeamBlock name={market.away} right />
      </div>

      <p className="mt-4 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-xs italic text-muted-foreground">
        {market.narrative}
      </p>

      <div className="mt-5 space-y-3">
        <ProbBar
          label={`LONG ${market.home}`}
          value={market.homeProb}
          active={selectedSide === "long"}
        />
        <ProbBar
          label={`SHORT ${market.away}`}
          value={market.awayProb}
          active={selectedSide === "short"}
        />
        <ProbBar label="DRAW" value={market.drawProb} active={selectedSide === "draw"} />
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>Volume {formatUsd(market.volume)}</span>
        <span>{market.kickoff}</span>
      </div>

      {!disabled && (
        <div className="mt-5 space-y-3 border-t border-border/60 pt-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Open position
          </div>
          <div className="flex gap-2">
            {sides.map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setSelectedSide(selectedSide === side ? null : side)}
                className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold transition ${
                  selectedSide === side
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_var(--neon)]"
                    : "border-border bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-primary"
                }`}
              >
                {POSITION_SIDE_LABELS[side]}
                <div className="mt-0.5 truncate text-[10px] font-normal opacity-80">
                  {side === "draw" ? "Draw" : sideToTeam(side, market)}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={!selectedSide}
              onClick={() => {
                if (selectedSide) openPosition(market.id, selectedSide, Number(stake) || 0);
              }}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[0_0_20px_var(--neon)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamBlock({ name, right }: { name: string; right?: boolean }) {
  const isClub = name === "STACK XI";
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${right ? "flex-row-reverse text-right" : ""}`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg font-black text-sm ${
          isClub
            ? "bg-primary text-primary-foreground shadow-[0_0_16px_var(--neon)]"
            : "bg-secondary text-foreground"
        }`}
      >
        {isClub ? "XI" : name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-sm font-bold">{name}</div>
        <div className="font-mono text-[10px] uppercase text-muted-foreground">
          {isClub ? "club" : "market"}
        </div>
      </div>
    </div>
  );
}

export function MatchTradingRoom({ compact }: { compact?: boolean }) {
  const { markets } = useProtocol();

  return (
    <section id="markets" className={compact ? "" : "mx-auto max-w-7xl px-4 py-20 sm:px-6"}>
      <SectionHead
        eyebrow="Matchday Trading Room · Match Perps"
        title={
          <>
            Trade belief, <span className="text-gradient">not assets.</span>
          </>
        }
        sub="Every World Cup match is a market. LONG a team, SHORT the rival, or ride the draw. Probability shifts like a perp terminal."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </section>
  );
}
