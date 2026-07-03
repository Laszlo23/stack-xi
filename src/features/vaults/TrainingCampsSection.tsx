import { useState } from "react";
import { SectionHead } from "@/components/layout/SectionHead";
import type { TrainingCamp } from "@/domain/types";
import { RISK_TIER_LABELS } from "@/domain/constants";
import { formatUsd } from "@/lib/mock/protocol-data";
import { useProtocol } from "@/hooks/use-protocol-state";

function accentVar(accent: TrainingCamp["accent"]) {
  if (accent === "electric") return "var(--electric)";
  if (accent === "magenta") return "var(--magenta)";
  return "var(--neon)";
}

function CampCard({ camp }: { camp: TrainingCamp }) {
  const { depositToCamp, deposits } = useProtocol();
  const [amount, setAmount] = useState("100");
  const color = accentVar(camp.accent);
  const myDeposit = deposits.filter((d) => d.campId === camp.id).reduce((s, d) => s + d.amount, 0);

  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {RISK_TIER_LABELS[camp.tier]} · Club Liquidity Squad
          </div>
          <h3 className="mt-1 font-display text-xl font-bold">{camp.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{camp.tagline}</p>
        </div>
        <span
          className="rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase"
          style={{ borderColor: `${color}66`, color }}
        >
          {camp.riskLabel.split("·")[0].trim()}
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{camp.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">TVL</div>
          <div className="mt-1 font-display text-lg font-bold">{formatUsd(camp.tvl)}</div>
        </div>
        <div className="glass rounded-xl p-3">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">APY</div>
          <div className="mt-1 font-display text-lg font-bold" style={{ color }}>
            {camp.apy}%
          </div>
        </div>
      </div>

      {myDeposit > 0 && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-xs text-primary">
          Your deposit: {formatUsd(myDeposit)} mock USDC
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm outline-none focus:border-primary"
          placeholder="USDC amount"
        />
        <button
          type="button"
          onClick={() => depositToCamp(camp.id, Number(amount) || 0)}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[0_0_20px_var(--neon)] hover:brightness-110"
        >
          Deposit
        </button>
      </div>
    </div>
  );
}

export function TrainingCampsSection({ compact }: { compact?: boolean }) {
  const { camps, totalDeposited } = useProtocol();

  return (
    <section id="vaults" className={compact ? "" : "border-y border-border/60 bg-surface/40 py-20"}>
      <div className={compact ? "" : "mx-auto max-w-7xl px-4 sm:px-6"}>
        <SectionHead
          eyebrow="Club Liquidity Squad · Training Camps"
          title={
            <>
              Back the club. <span className="text-gradient">Earn culture yield.</span>
            </>
          }
          sub="Deposit mock USDC into tranched vaults. Yield flows from trading fees, prediction markets, and meme cycles."
        />

        {totalDeposited > 0 && (
          <div className="mt-6 inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs text-primary">
            Total deposited this session: {formatUsd(totalDeposited)} mock USDC
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {camps.map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
        </div>
      </div>
    </section>
  );
}
