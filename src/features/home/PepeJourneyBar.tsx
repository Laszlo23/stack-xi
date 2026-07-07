import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import {
  getNextPepeJourneyTier,
  getPepeJourneyTier,
  PEPE_JOURNEY_TIERS,
} from "@/lib/growth/pepe-journey";

export function PepeJourneyBar() {
  const { t } = useTranslation();
  const memberTasks = useMemberTasksOptional();
  const xp = memberTasks?.progress.totalXp ?? 0;
  const tier = getPepeJourneyTier(xp);
  const next = getNextPepeJourneyTier(xp);
  const tierIdx = PEPE_JOURNEY_TIERS.findIndex((entry) => entry.id === tier.id);
  const progressToNext = next
    ? Math.min(100, Math.round(((xp - tier.minXp) / (next.minXp - tier.minXp)) * 100))
    : 100;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="glass rounded-2xl border border-border/50 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("home.journey.eyebrow")}
            </div>
            <h3 className="mt-1 font-display text-xl font-bold">
              🐸 {tier.label}
            </h3>
            {next ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t("home.journey.nextUnlock", {
                  xp: next.minXp - xp,
                  tier: next.label,
                })}
              </p>
            ) : (
              <p className="mt-1 text-sm text-primary">{t("home.journey.maxTier")}</p>
            )}
          </div>
          <Link
            to="/profile"
            className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            {t("home.journey.viewProfile")}
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PEPE_JOURNEY_TIERS.map((entry, idx) => {
            const reached = xp >= entry.minXp;
            const current = entry.id === tier.id;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wide ${
                  current
                    ? "border-primary bg-primary/15 text-primary"
                    : reached
                      ? "border-primary/25 text-primary/80"
                      : "border-border/50 text-muted-foreground"
                }`}
              >
                <span>🐸</span>
                <span className="hidden sm:inline">{entry.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>{xp} XP</span>
            <span>{next ? `${next.minXp} XP` : "MAX"}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
