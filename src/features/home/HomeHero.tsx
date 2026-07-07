import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { getActiveMarketKind } from "@/lib/story/match-markets";

export function HomeHero() {
  const { t } = useTranslation();
  const isAustrianMarket = getActiveMarketKind() === "austrian_bundesliga";

  return (
    <div className="relative z-10 max-w-xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        {isAustrianMarket ? t("home.hero.badgeLeague") : t("home.hero.badge")}
      </div>

      <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
        {isAustrianMarket ? (
          <>
            {t("home.hero.headlineLeague")}
            <span className="text-gradient"> {t("home.hero.headlineLeagueAccent")}</span>
          </>
        ) : (
          <>
            {t("home.hero.headline")}
            <span className="text-gradient"> {t("home.hero.headlineAccent")}</span>
          </>
        )}
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
        {t("home.hero.subheadline")}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#predict"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] transition hover:brightness-110"
        >
          <span aria-hidden>🐸</span>
          {t("home.hero.ctaPredict")}
        </a>
        <Link
          to="/story"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-6 py-3.5 text-sm font-bold text-primary transition hover:bg-primary/15"
        >
          <span aria-hidden>⚽</span>
          {t("home.hero.ctaStory")}
        </Link>
      </div>
    </div>
  );
}
