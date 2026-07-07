import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { HomeHero } from "@/features/home/HomeHero";
import { LivePredictionProduct } from "@/features/home/LivePredictionProduct";
import { SocialProofStrip } from "@/features/home/SocialProofStrip";
import { LeaderboardPreview } from "@/features/home/LeaderboardPreview";
import { StoryTeaser } from "@/features/home/StoryTeaser";
import { HomeActivityFeed } from "@/features/home/HomeActivityFeed";
import { useDailyHomeContent } from "@/hooks/use-daily-home-content";
import { useClaimableCount } from "@/hooks/use-claimable-count";

const HASH_REDIRECTS: Record<string, string> = {
  "pepe-origin": "/story",
  "visual-story": "/story/visual",
  story: "/story",
  squad: "/squad",
  defi: "/defi",
  decentraland: "/feed",
};

export function PredictionHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const claimableCount = useClaimableCount();
  const daily = useDailyHomeContent();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sessionStorage.getItem("stackxi:tg-deeplink") === "predict") {
      sessionStorage.removeItem("stackxi:tg-deeplink");
      window.location.hash = "predict";
      return;
    }

    const hash = window.location.hash.replace("#", "");
    const redirect = HASH_REDIRECTS[hash];
    if (redirect) {
      void navigate({ to: redirect, replace: true });
    }
  }, [navigate]);

  return (
    <div className="scroll-smooth">
      <section className="relative min-h-[70vh] overflow-hidden sm:min-h-[75vh]">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center sm:items-center sm:justify-end">
          <img
            src="/pepeheadball.jpg"
            alt=""
            aria-hidden
            className="pepe-hero-float max-h-[45vh] w-auto max-w-[min(100%,640px)] object-cover opacity-40 sm:max-h-[80vh] sm:opacity-55"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <HomeHero />
          {daily.xpBonus && (
            <p className="mt-6 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
              {daily.xpBonus}
            </p>
          )}
        </div>
      </section>

      {claimableCount > 0 && (
        <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
          <p className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-center font-mono text-xs text-primary">
            {t("hero.claimableBanner", { count: claimableCount })}{" "}
            <Link to="/profile" className="font-bold underline">
              {t("home.journey.viewProfile")}
            </Link>
          </p>
        </div>
      )}

      <LivePredictionProduct />
      <SocialProofStrip />
      <LeaderboardPreview />
      <StoryTeaser />
      <HomeActivityFeed />
    </div>
  );
}

/** @deprecated Use PredictionHomePage — kept for imports during migration */
export const PepeScrollExperience = PredictionHomePage;
