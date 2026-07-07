import { Link } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClaimableCount } from "@/hooks/use-claimable-count";

export function FloatingActionCTAs() {
  const { t } = useTranslation();
  const claimableCount = useClaimableCount();

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-40 flex flex-col gap-2 lg:bottom-6">
      <Link
        to="/"
        hash="predict"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] hover:brightness-110"
      >
        <Target className="h-4 w-4" />
        {t("home.hero.ctaPredict")}
      </Link>
      {claimableCount > 0 && (
        <Link
          to="/profile"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-4 py-2.5 text-sm font-bold text-primary backdrop-blur hover:bg-primary/25"
        >
          {t("cta.claim", { count: claimableCount })}
        </Link>
      )}
    </div>
  );
}
