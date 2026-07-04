import { BCC_SYMBOL } from "@/lib/base/config";

const FLOWS = [
  { label: "Player Rewards (BCC)", pct: 60, color: "var(--neon)" },
  { label: "Builder Treasury (BCC)", pct: 20, color: "var(--electric)" },
  { label: "Creator Rewards (BCC)", pct: 10, color: "var(--magenta)" },
  { label: "BCC Burn / Deflation", pct: 10, color: "oklch(0.55 0.02 240)" },
] as const;

export function TreasuryFlowBlock() {
  return (
    <article className="glass rounded-2xl p-6 sm:p-8">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--electric)]">
        Block 05
      </div>
      <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">BCC Treasury Flow</h3>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Matchday {BCC_SYMBOL} distribution — every pool pulse routes conviction through the squad
        culture layer.
      </p>

      <div className="defi-treasury-diagram relative mx-auto mt-10 max-w-lg py-8">
        <div className="defi-treasury-core mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-primary/50 bg-primary/10 font-display text-xs font-bold text-primary shadow-[0_0_32px_oklch(0.88_0.28_145/0.35)]">
          BCC
          <br />
          Pool
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {FLOWS.map((flow, i) => (
            <div
              key={flow.label}
              className="defi-flow-node relative rounded-xl border border-border/50 bg-background/50 px-4 py-3"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <span
                className="defi-flow-particle absolute -top-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
                style={{ background: flow.color, animationDelay: `${i * 0.35}s` }}
              />
              <div className="font-mono text-[10px] uppercase text-muted-foreground">
                {flow.pct}%
              </div>
              <div className="font-display text-sm font-bold">{flow.label}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
