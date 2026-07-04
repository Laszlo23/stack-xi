import { Link } from "@tanstack/react-router";
import { ArrowRight, Layers } from "lucide-react";
import { DeFiLayerBackground } from "./DeFiLayerBackground";

export function DeFiLayerTeaser() {
  return (
    <section id="defi-teaser" className="relative overflow-hidden border-y border-primary/20">
      <DeFiLayerBackground />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="glass-neon max-w-3xl rounded-2xl p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Layers className="h-3.5 w-3.5" />
            Onchain game layer
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            STACK XI <span className="text-gradient">DeFi Layer</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Where prediction, liquidity, and BCC culture merge onchain — sports broadcast energy,
            not a banking dashboard.
          </p>
          <Link
            to="/defi"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_28px_var(--neon)] transition hover:brightness-110"
          >
            Enter the DeFi layer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
