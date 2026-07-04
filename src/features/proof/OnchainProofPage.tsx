import { ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { ZeroXSwapWidget } from "@/features/swap/ZeroXSwapWidget";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import {
  BASESCAN_URL,
  BCC_SYMBOL,
  BCC_TOKEN_ADDRESS,
  DEXSCREENER_BOOST_URL,
  PREDICTION_POOL_ADDRESS,
  SQUAD_NFT_ADDRESS,
} from "@/lib/base/config";
import { loadMemberProgress } from "@/lib/profile/task-storage";
import { SITE_LINKS } from "@/lib/site/links";

const CONTRACTS = [
  { label: "BCC Token", address: BCC_TOKEN_ADDRESS, scanPath: "token" },
  { label: "StackXISquad NFT", address: SQUAD_NFT_ADDRESS, scanPath: "address" },
  { label: "PredictionPool", address: PREDICTION_POOL_ADDRESS, scanPath: "address" },
] as const;

function DexScreenerBoostChecklist() {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
        DexScreener boost checklist
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>✓ BCC pool live on Base (Clanker V4)</li>
        <li>□ Submit paid boost at DexScreener</li>
        <li>□ Add social links + banner on token page</li>
        <li>□ Cross-post pool link on Farcaster / X</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={SITE_LINKS.bccDexScreener}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Open DexScreener chart
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href={DEXSCREENER_BOOST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          Boost docs
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export function OnchainProofPage() {
  const { address, isConnected, connectWallet, isConnecting } = useBaseWallet();
  const progress = address ? loadMemberProgress(address) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
      <div>
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <ShieldCheck className="h-4 w-4" />
          Onchain proof hub
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          BCC culture layer · verified on Base
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Contract registry, live liquidity, in-app swap, and your mint + prediction receipts — all
          tied to {BCC_SYMBOL} on Base.
        </p>
        <p className="mt-2 max-w-2xl text-xs text-muted-foreground/80">
          Note: NFT tokenURI metadata on BaseScan may still reference the legacy stackxi.xyz host
          until a future contract redeploy. Off-chain squad pages and proofs live on this domain.
        </p>
        <div className="mt-4">
          <BccTokenChip />
        </div>
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Contract registry</h2>
        <ul className="mt-4 space-y-3">
          {CONTRACTS.map((c) => (
            <li
              key={c.label}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 font-mono text-xs"
            >
              <span className="text-muted-foreground">{c.label}</span>
              {c.address?.startsWith("0x") ? (
                <a
                  href={`${BASESCAN_URL}/${c.scanPath}/${c.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary hover:underline"
                >
                  {c.address}
                </a>
              ) : (
                <span className="text-destructive">Not configured</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a
            href={SITE_LINKS.bccClanker}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Clanker →
          </a>
          <a
            href={SITE_LINKS.bccBaseApp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Base App →
          </a>
          <a
            href={SITE_LINKS.bccUniswap}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Uniswap →
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold">Live liquidity</h2>
        <DexScreenerBoostChecklist />
        <div className="overflow-hidden rounded-2xl border border-border/50">
          <iframe
            title="BCC DexScreener chart"
            src={`${SITE_LINKS.bccDexScreener}?embed=1&theme=dark`}
            className="h-[420px] w-full border-0"
            loading="lazy"
          />
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Buy {BCC_SYMBOL}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Embedded 0x swap — routes through Clanker V4 pool.
        </p>
        <div className="mt-6">
          <ZeroXSwapWidget />
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold">Your onchain proofs</h2>
        {!isConnected ? (
          <button
            type="button"
            onClick={() => void connectWallet()}
            disabled={isConnecting}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {isConnecting ? "Connecting…" : "Connect wallet to view receipts"}
          </button>
        ) : (
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="font-mono text-[10px] uppercase text-muted-foreground">Squad mints</h3>
              {progress?.mintTxIds.length ? (
                <ul className="mt-2 space-y-2">
                  {progress.mintTxIds.map((m) => (
                    <li
                      key={m.txId}
                      className="flex flex-wrap justify-between gap-2 rounded-lg border border-border/40 px-3 py-2 font-mono text-xs"
                    >
                      <span>Player #{m.playerId}</span>
                      <a
                        href={`${BASESCAN_URL}/tx/${m.txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {m.txId.slice(0, 10)}…
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No mint receipts yet.{" "}
                  <Link to="/" hash="squad" className="text-primary hover:underline">
                    Mint squad →
                  </Link>
                </p>
              )}
            </div>
            <div>
              <h3 className="font-mono text-[10px] uppercase text-muted-foreground">Predictions</h3>
              {progress?.predictionTxIds.length ? (
                <ul className="mt-2 space-y-2">
                  {progress.predictionTxIds.map((txId) => (
                    <li
                      key={txId}
                      className="rounded-lg border border-border/40 px-3 py-2 font-mono text-xs"
                    >
                      <a
                        href={`${BASESCAN_URL}/tx/${txId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-primary hover:underline"
                      >
                        {txId}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No prediction receipts yet.{" "}
                  <Link to="/" hash="predict" className="text-primary hover:underline">
                    Predict →
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
