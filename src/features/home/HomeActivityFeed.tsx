import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useActivityFeed } from "@/hooks/use-activity-feed";

export function HomeActivityFeed() {
  const { t } = useTranslation();
  const { data, isLoading } = useActivityFeed(8);
  const items = data?.items ?? [];

  return (
    <section className="border-t border-border/40 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold">{t("home.activity.title")}</h2>
          <Link to="/feed" className="text-xs font-semibold text-primary hover:underline">
            {t("home.activity.viewAll")}
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border/40 rounded-2xl border border-border/50 bg-background/40">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-muted/20" />
            ))}
          {!isLoading &&
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span aria-hidden>{item.emoji}</span>
                <span className="font-semibold text-primary">{item.handle}</span>
                <span className="text-muted-foreground">{item.message}</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
