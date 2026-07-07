import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, setAppLocale, type AppLocale } from "@/i18n";

export function useLocale() {
  const { i18n } = useTranslation();

  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(i18n.language)
    ? (i18n.language as AppLocale)
    : "en";

  const changeLocale = useCallback((next: AppLocale) => {
    setAppLocale(next);
  }, []);

  return { locale, changeLocale, locales: SUPPORTED_LOCALES };
}
