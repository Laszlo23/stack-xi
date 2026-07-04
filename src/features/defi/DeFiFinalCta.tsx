import { Link } from "@tanstack/react-router";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { BCC_SYMBOL } from "@/lib/base/config";
import { BccSwapPanel } from "@/features/swap/BccSwapPanel";

export function DeFiFinalCta() {
  const { isConnected, connectWallet, isConnecting } = useConnectBaseWallet();

  return (
    <section className="defi-final-cta relative overflow-hidden border-t border-primary/30 py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.88_0.28_145/0.15),transparent_70%)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="font-display text-2xl font-bold leading-snug sm:text-3xl">
          Pepe doesn&apos;t chase liquidity.{" "}
          <span className="text-gradient">He plays inside {BCC_SYMBOL}.</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={isConnecting || isConnected}
            onClick={() => void connectWallet()}
            className="defi-energy-btn rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_28px_var(--neon)] hover:brightness-110 disabled:opacity-70"
          >
            {isConnected
              ? "Wallet connected"
              : isConnecting
                ? "Connecting…"
                : "Connect Base Wallet"}
          </button>
          <Link
            to="/"
            hash="predict"
            className="rounded-xl border border-primary/40 px-6 py-3 text-sm font-bold text-primary hover:bg-primary/10"
          >
            Join Prediction
          </Link>
          <Link
            to="/"
            hash="squad"
            search={{ tab: "swap" }}
            className="rounded-xl border border-accent/40 px-6 py-3 text-sm font-bold text-accent hover:bg-accent/10"
          >
            Get {BCC_SYMBOL}
          </Link>
          <Link
            to="/partners"
            className="rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground hover:border-primary/50 hover:text-primary"
          >
            Partner with us
          </Link>
        </div>

        <div className="mt-10 text-left">
          <BccSwapPanel compact />
        </div>
      </div>
    </section>
  );
}
