import { useTranslation } from "react-i18next";

export function CultureScoreExplainer() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {t("home.culture.eyebrow")}
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{t("home.culture.title")}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("home.culture.body")}</p>
        <p className="mt-2 max-w-2xl text-sm text-primary">{t("home.culture.rewards")}</p>
      </div>
    </section>
  );
}
