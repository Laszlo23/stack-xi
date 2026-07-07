import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLeaderboard } from "@/hooks/use-leaderboard";

export function LeaderboardPreview() {
  const { t } = useTranslation();
  const { data } = useLeaderboard(5);
  const entries = data?.entries ?? [];

  return (
    <section className="py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="glass rounded-2xl border border-border/50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold">
              🏆 {t("home.leaderboard.title")}
            </h2>
            <Link
              to="/leaderboard"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110"
            >
              {t("home.leaderboard.beatThem")}
            </Link>
          </div>

          <ol className="mt-6 space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.handle}
                className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-primary">#{entry.rank}</span>
                  <span className="font-semibold">{entry.handle}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{entry.xp} XP</span>
              </li>
            ))}
            <li className="flex items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-muted-foreground">#?</span>
                <span className="font-semibold text-primary">{t("home.leaderboard.you")}</span>
              </div>
              <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
                {t("home.leaderboard.join")}
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
