import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function StoryTeaser() {
  const { t } = useTranslation();

  return (
    <section className="border-t border-border/40 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/15 text-4xl">
            🐸
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold leading-snug sm:text-2xl">
              {t("home.storyTeaser.line1")}
            </p>
            <p className="mt-2 text-muted-foreground">{t("home.storyTeaser.line2")}</p>
            <p className="mt-1 text-primary">{t("home.storyTeaser.line3")}</p>
            <Link
              to="/story"
              className="mt-4 inline-flex text-sm font-bold text-primary hover:underline"
            >
              {t("home.storyTeaser.cta")}
            </Link>
          </div>
          <img
            src="/beforefallpepepengubeer.jpg"
            alt=""
            className="hidden h-32 w-48 shrink-0 rounded-xl object-cover opacity-80 sm:block"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
