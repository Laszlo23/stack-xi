import { Trophy } from "lucide-react";
import { PredictionShareCard } from "./PredictionShareCard";
import { getMockReceiptsForMatch, isTopLuckTier } from "@/lib/predict/prediction-receipts";

export function PredictionReceiptPanel({
  home,
  away,
  stage,
}: {
  home: string;
  away: string;
  stage: string;
}) {
  const summary = getMockReceiptsForMatch(`${stage} · ${home} vs ${away}`, home, away);
  const winners = summary.receipts.filter(
    (r) => r.isWinner && isTopLuckTier(r.rank, summary.receipts.length),
  );

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Trophy className="h-4 w-4" />
          Prediction receipts
        </div>
        <h3 className="mt-2 font-display text-xl font-bold">
          Top {summary.topLuckPercent}% earn LUCK
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Result: <strong className="text-foreground">{summary.winnerTeam}</strong> · Leaderboard
          updates after final whistle (MVP).
        </p>

        <ol className="mt-6 space-y-2">
          {summary.receipts.map((r) => (
            <li
              key={r.rank}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-xs ${
                r.isWinner && isTopLuckTier(r.rank, summary.receipts.length)
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/40"
              }`}
            >
              <span>
                #{r.rank} {r.handle} · {r.pick} · {r.stakeLabel}
              </span>
              <span className="text-primary">+{r.luckEarned} LUCK</span>
            </li>
          ))}
        </ol>
      </div>

      {winners[0] && (
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Winner share card · status flex only
          </div>
          <PredictionShareCard
            home={home}
            away={away}
            pick={winners[0].pick}
            stakeLabel={winners[0].stakeLabel.replace("$", "")}
            pepeSrc="/gaolpepe.jpg"
          />
        </div>
      )}
    </div>
  );
}
