import { Globe } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import type { AppLocale } from "@/i18n";

const LABELS: Record<AppLocale, string> = {
  en: "EN",
  de: "DE",
  tr: "TR",
  fr: "FR",
  es: "ES",
};

export function LanguageSwitcher() {
  const { locale, changeLocale, locales } = useLocale();

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="locale-select">
        Language
      </label>
      <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/80 px-2 py-1">
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          id="locale-select"
          value={locale}
          onChange={(e) => changeLocale(e.target.value as AppLocale)}
          className="bg-transparent font-mono text-[10px] uppercase tracking-wider text-foreground outline-none sm:text-xs"
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {LABELS[code]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
