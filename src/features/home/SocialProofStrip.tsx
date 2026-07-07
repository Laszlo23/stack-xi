import { useTranslation } from "react-i18next";
import { useActivityFeed } from "@/hooks/use-activity-feed";

export function SocialProofStrip() {
  const { t } = useTranslation();
  const { data } = useActivityFeed(6);

  const totalPredictions = data?.totalPredictions ?? 14_238;
  const picks = data?.items.filter((i) => i.kind === "prediction" || i.kind === "streak" || i.kind === "tier_unlock") ?? [];

  return (
    <section className="border-t border-border/40 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("home.social.eyebrow")}
          </div>
          <p className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {totalPredictions.toLocaleString()}{" "}
            <span className="text-gradient">{t("home.social.predictions")}</span>
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {t("home.social.latestPicks")}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {picks.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm"
              >
                <span aria-hidden>{item.emoji}</span>
                <span className="font-semibold text-primary">{item.handle}</span>
                <span className="text-muted-foreground">{item.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
