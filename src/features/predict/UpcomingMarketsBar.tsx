import { usePredictionSession } from "@/hooks/use-prediction-session";
import { formatCountdown, getPredictionWindow } from "@/lib/predict/match-window";
import { getOpenPredictionMarkets } from "@/lib/story/match-markets";

export function UpcomingMarketsBar() {
  const markets = getOpenPredictionMarkets();
  const { session, selectMarket } = usePredictionSession();

  if (markets.length <= 1) return null;

  function scrollToPredict() {
    document.getElementById("predict")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="mb-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
        Open markets
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a matchday — predictions lock at kickoff.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {markets.map((m) => {
          const window = getPredictionWindow(m);
          const active = session?.matchId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                selectMarket(m.id);
                scrollToPredict();
              }}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              <div className="font-semibold">
                {m.home} vs {m.away}
              </div>
              <div className="mt-0.5 font-mono text-[10px] opacity-80">
                {m.stage} · {formatCountdown(window.msUntilClose)} left
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
