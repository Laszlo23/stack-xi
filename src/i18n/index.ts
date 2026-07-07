import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import tr from "./locales/tr.json";

export const SUPPORTED_LOCALES = ["en", "de", "tr", "fr", "es"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = "stackxi:locale";

function detectInitialLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
    return stored as AppLocale;
  }
  const browser = navigator.language.slice(0, 2);
  if ((SUPPORTED_LOCALES as readonly string[]).includes(browser)) {
    return browser as AppLocale;
  }
  return "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    tr: { translation: tr },
    fr: { translation: fr },
    es: { translation: es },
  },
  lng: detectInitialLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setAppLocale(locale: AppLocale): void {
  void i18n.changeLanguage(locale);
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }
}

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
