import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Zap } from "lucide-react";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useBccBalance } from "@/hooks/use-bcc-balance";
import { BCC_SYMBOL } from "@/lib/base/config";
import { DALLAS_SCHEDULE } from "@/lib/story/dallas-schedule";

const ROUND_16 = DALLAS_SCHEDULE.find((m) => m.id === "m8")!;
const BASE_POOL_BCC = 124_500;

function AnimatedPool({ value, pulse }: { value: number; pulse: boolean }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!pulse) {
      setDisplay(value);
      return;
    }
    const start = display;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      setDisplay(Math.round(start + (end - start) * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last displayed value on pulse
  }, [value, pulse]);

  return (
    <span
      className={`font-display text-3xl font-bold text-primary ${pulse ? "defi-pool-pulse" : ""}`}
    >
      {display.toLocaleString()} {BCC_SYMBOL}
    </span>
  );
}

export function PredictToEarnBlock() {
  const { isConnected, connectWallet, isConnecting, address } = useBaseWallet();
  const { formatted } = useBccBalance(address);
  const [pick, setPick] = useState<"home" | "away">("home");
  const [stakeInput, setStakeInput] = useState("100");
  const [poolTotal, setPoolTotal] = useState(BASE_POOL_BCC);
  const [poolPulse, setPoolPulse] = useState(false);
  const [locked, setLocked] = useState(false);

  const homePct = pick === "home" ? 54 : 46;
  const awayPct = 100 - homePct;

  function handleLock() {
    const stake = Number.parseFloat(stakeInput) || 0;
    if (stake <= 0) return;
    setLocked(true);
    setPoolPulse(true);
    setPoolTotal((p) => p + Math.round(stake));
    setTimeout(() => {
      setPoolPulse(false);
      setLocked(false);
    }, 800);
  }

  return (
    <article className="defi-tilt-card glass rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">Block 01</div>
        <BccTokenChip compact />
      </div>
      <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Predict-to-Earn Pool</h3>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Stake {BCC_SYMBOL} on match outcomes. Winners share the culture pool. Losers fuel the lore.
      </p>
      {isConnected && (
        <p className="mt-2 font-mono text-xs text-primary">
          Your balance: {formatted} {BCC_SYMBOL}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPick("home")}
          className={`rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition ${
            pick === "home"
              ? "border-primary bg-primary/15 text-primary shadow-[0_0_20px_oklch(0.88_0.28_145/0.25)]"
              : "border-border/60 text-muted-foreground hover:border-primary/40"
          }`}
        >
          {ROUND_16.home}
        </button>
        <button
          type="button"
          onClick={() => setPick("away")}
          className={`rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition ${
            pick === "away"
              ? "border-accent bg-accent/15 text-accent shadow-[0_0_20px_oklch(0.75_0.22_240/0.25)]"
              : "border-border/60 text-muted-foreground hover:border-accent/40"
          }`}
        >
          {ROUND_16.away}
        </button>
      </div>

      <div className="mt-6">
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Enter {BCC_SYMBOL} stake
        </label>
        <input
          type="number"
          min="1"
          step="1"
          value={stakeInput}
          onChange={(e) => setStakeInput(e.target.value)}
          className="mt-2 w-full max-w-xs rounded-xl border border-border/60 bg-background/60 px-4 py-3 font-mono text-sm outline-none ring-primary/30 focus:ring-2"
          placeholder="100"
        />
      </div>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="font-mono text-[10px] uppercase text-muted-foreground">Total BCC pool</div>
        <AnimatedPool value={poolTotal} pulse={poolPulse} />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
          <span>Crowd shift · {ROUND_16.stage}</span>
          <span className="animate-pulse text-primary">Live</span>
        </div>
        <div className="flex h-4 overflow-hidden rounded-full bg-muted">
          <div
            className="defi-odds-bar bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
            style={{ width: `${homePct}%` }}
          />
          <div
            className="defi-odds-bar bg-gradient-to-r from-accent/60 to-accent transition-all duration-700"
            style={{ width: `${awayPct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
          <span>{homePct}%</span>
          <span>{awayPct}%</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={locked || isConnecting}
          onClick={() => {
            if (!isConnected) void connectWallet();
            else handleLock();
          }}
          className="defi-energy-btn inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] transition hover:brightness-110 disabled:opacity-60"
        >
          {isConnecting || locked ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {isConnected ? "Lock Prediction" : "Connect Base Wallet"}
        </button>
        <Link
          to="/"
          hash="predict"
          className="rounded-xl border border-primary/40 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          Full predict flow →
        </Link>
        <Link
          to="/"
          hash="squad"
          search={{ tab: "swap" }}
          className="rounded-xl border border-accent/40 px-6 py-3 text-sm font-semibold text-accent hover:bg-accent/10"
        >
          Get {BCC_SYMBOL} →
        </Link>
      </div>
      <p className="mt-3 font-mono text-[10px] text-muted-foreground">
        BCC culture pool · onchain BCC predictions on home predict section
      </p>
    </article>
  );
}
