import { Link } from "@tanstack/react-router";
import { ExternalLink, Loader2, RefreshCw, Target } from "lucide-react";
import { predictionTxUrl, useUserPredictions } from "@/hooks/use-user-predictions";

function formatWhen(timestamp: number | null): string {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MyPredictionsPanel() {
  const { rows, isLoading, error, refetch, hasPredictions } = useUserPredictions();

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Target className="h-3.5 w-3.5" />
            Your predictions
          </div>
          <h2 className="mt-1 font-display text-xl font-bold">Onchain match picks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every stake on the prediction pool — pulled from Base and your local receipts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary/50 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </button>
      </div>

      {isLoading && !hasPredictions && (
        <p className="mt-4 text-sm text-muted-foreground">Loading your prediction history…</p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {!isLoading && !error && !hasPredictions && (
        <div className="mt-4 rounded-xl border border-border/50 bg-muted/10 px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground">No predictions yet for this wallet.</p>
          <Link
            to="/"
            hash="predict"
            className="mt-3 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            Make your first pick →
          </Link>
        </div>
      )}

      {hasPredictions && (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-border/50 bg-background/40 px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-display font-bold">{row.matchLabel}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Pick: <span className="font-mono text-foreground">{row.pickLabel}</span>
                    {row.stakeLabel && (
                      <>
                        {" "}
                        · Stake:{" "}
                        <span className="font-mono text-primary">{row.stakeLabel}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">
                    {formatWhen(row.timestamp)}
                    {row.source === "local" && " · local receipt"}
                  </div>
                </div>
                <a
                  href={predictionTxUrl(row.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                >
                  {row.txHash.slice(0, 10)}…
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/" hash="predict" className="font-semibold text-primary hover:underline">
          New prediction →
        </Link>
        <Link to="/proof" className="text-muted-foreground hover:text-primary hover:underline">
          Full onchain proof hub
        </Link>
      </div>
    </section>
  );
}
