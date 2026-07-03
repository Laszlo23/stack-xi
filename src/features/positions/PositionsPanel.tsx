import { Link } from "@tanstack/react-router";
import { SectionHead } from "@/components/layout/SectionHead";
import { EXPOSURE_LABELS, POSITION_SIDE_LABELS } from "@/domain/constants";
import { useProtocol } from "@/hooks/use-protocol-state";

export function PositionsPanel({ compact }: { compact?: boolean }) {
  const { positions } = useProtocol();
  const openPositions = positions.filter((p) => p.status === "open");
  const totalPnl = openPositions.reduce((sum, p) => sum + p.pnl, 0);
  const totalExposure = openPositions.reduce((sum, p) => sum + p.stake, 0);

  return (
    <section
      id="positions"
      className={compact ? "" : "border-t border-border/60 bg-surface/40 py-20"}
    >
      <div className={compact ? "" : "mx-auto max-w-7xl px-4 sm:px-6"}>
        <SectionHead
          eyebrow="Trading Terminal · Positions"
          title={
            <>
              Your culture <span className="text-gradient">exposure.</span>
            </>
          }
          sub="Open match bets, simulated PnL, and risk tier — a trading terminal for football narratives."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Open Positions", String(openPositions.length), "active"],
            ["Total Stake", `$${totalExposure.toFixed(0)}`, "mock USDC"],
            ["Unrealized PnL", `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(1)}`, "simulated"],
          ].map(([label, value, sub]) => (
            <div key={label} className="glass rounded-xl p-4">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
              <div className="mt-1 font-display text-2xl font-bold">{value}</div>
              <div className="text-[10px] text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border/60">
          <div className="grid grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr_0.6fr] gap-2 border-b border-border/60 bg-background/60 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground max-md:hidden">
            <span>Market</span>
            <span>Side</span>
            <span>Stake</span>
            <span>PnL</span>
            <span>Exposure</span>
          </div>

          {positions.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              No positions yet.{" "}
              <Link to="/markets" className="text-primary hover:underline">
                Open a match perp →
              </Link>
            </div>
          ) : (
            positions.map((pos) => (
              <div
                key={pos.id}
                className="grid gap-2 border-b border-border/40 px-4 py-4 last:border-b-0 max-md:space-y-2 md:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr_0.6fr] md:items-center"
              >
                <div>
                  <div className="font-display text-sm font-bold">{pos.marketLabel}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    Entry {pos.entryProb}% · {pos.openedAt}
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-primary">
                  {POSITION_SIDE_LABELS[pos.side]}
                </div>
                <div className="font-mono text-sm">${pos.stake}</div>
                <div
                  className={`font-mono text-sm font-bold ${pos.pnl >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {pos.pnl >= 0 ? "+" : ""}
                  {pos.pnl.toFixed(1)}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {EXPOSURE_LABELS[pos.exposure]}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
