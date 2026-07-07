import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMatchStats } from "@/hooks/use-match-stats";
import { getCrowdSplit, type CrowdSplit } from "@/lib/predict/crowd-pressure";
import { PEPE_CROWD_QUOTE_COUNT, PEPE_CROWD_QUOTES_FALLBACK } from "@/lib/story/pepe-crowd-quotes";

const QUOTE_ROTATE_MS = 7_500;

function useCrowdQuotes(): string[] {
  const { t } = useTranslation();
  return useMemo(() => {
    const raw = t("crowdPressure.quotes", { returnObjects: true });
    if (Array.isArray(raw) && raw.every((entry) => typeof entry === "string")) {
      return raw;
    }
    return [...PEPE_CROWD_QUOTES_FALLBACK];
  }, [t]);
}

export function CrowdPressureBar({ matchId }: { matchId: string }) {
  const { t, i18n } = useTranslation();
  const quotes = useCrowdQuotes();
  const quoteCount = quotes.length || PEPE_CROWD_QUOTE_COUNT;
  const { data: stats } = useMatchStats(matchId);

  const [crowd, setCrowd] = useState<CrowdSplit>(() => getCrowdSplit(matchId));
  const [quoteIndex, setQuoteIndex] = useState(
    () => Math.floor(Date.now() / QUOTE_ROTATE_MS) % quoteCount,
  );
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    if (stats) {
      setCrowd({ home: stats.homePct, away: stats.awayPct });
      return;
    }
    const interval = setInterval(() => {
      const jitter = Math.round(Math.sin(Date.now() / 4000) * 3);
      setCrowd(getCrowdSplit(matchId, jitter));
    }, 3200);
    return () => clearInterval(interval);
  }, [matchId, stats]);

  useEffect(() => {
    setQuoteIndex(0);
    setQuoteVisible(true);
  }, [i18n.language, quoteCount]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setQuoteVisible(false);
      timeoutId = setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quoteCount);
        setQuoteVisible(true);
      }, 280);
    }, QUOTE_ROTATE_MS);
    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [quoteCount]);

  const quote = quotes[quoteIndex % quoteCount] ?? quotes[0] ?? "";

  return (
    <div className="mt-6 rounded-xl border border-border/50 bg-background/40 p-4">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="text-muted-foreground">{t("crowdPressure.title")}</span>
        <span className="animate-pulse text-primary">{t("crowdPressure.live")}</span>
      </div>

      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
          style={{ width: `${crowd.home}%` }}
        />
        <div
          className="bg-gradient-to-r from-accent/60 to-accent transition-all duration-700"
          style={{ width: `${crowd.away}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between font-mono text-xs">
        <span className="text-primary">
          {t("crowdPressure.homeSide", { percent: crowd.home })}
        </span>
        <span className="text-accent">
          {t("crowdPressure.awaySide", { percent: crowd.away })}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3">
        <span className="mt-0.5 shrink-0 text-lg" aria-hidden>
          🐸
        </span>
        <p
          className={`min-h-[2.75rem] text-left text-sm leading-relaxed text-foreground transition-all duration-300 ${
            quoteVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          {quote}
        </p>
      </div>
    </div>
  );
}
