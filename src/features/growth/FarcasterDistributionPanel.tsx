import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle2, Circle, Download, ExternalLink, Loader2, Radio } from "lucide-react";
import { CalendarDayMemeCard } from "@/features/growth/CalendarDayMemeCard";
import { useShareCardDownload } from "@/features/share/useShareCardDownload";
import { EXPORT_COLORS } from "@/lib/share/export-colors";
import {
  isDistributionComplete,
  loadDistributionStatus,
  patchDistributionStatus,
  type DistributionStatus,
} from "@/lib/growth/distribution-status";
import type { ViralCalendarDay } from "@/lib/growth/viral-calendar";
import { farcasterComposeUrl, xComposeUrl } from "@/lib/profile/social-links";

type StepId = keyof Pick<DistributionStatus, "farcasterPosted" | "xPosted" | "pngDownloaded">;

const STEPS: { id: StepId; label: string; hint: string }[] = [
  {
    id: "farcasterPosted",
    label: "Cast on Farcaster",
    hint: "Long cast + builder tags · primary channel",
  },
  {
    id: "pngDownloaded",
    label: "Download meme PNG",
    hint: "Attach to X post — no link in tweet",
  },
  {
    id: "xPosted",
    label: "Post on X",
    hint: "Short copy + meme card screenshot",
  },
];

export function FarcasterDistributionPanel({
  day,
  onStatusChange,
}: {
  day: ViralCalendarDay;
  onStatusChange?: (status: DistributionStatus) => void;
}) {
  const [status, setStatus] = useState<DistributionStatus>(() => loadDistributionStatus(day.date));
  const { cardRef, download, exporting, error } = useShareCardDownload();

  useEffect(() => {
    setStatus(loadDistributionStatus(day.date));
  }, [day.date]);

  const refresh = useCallback(
    (patch: Partial<DistributionStatus>) => {
      const next = patchDistributionStatus(day.date, patch);
      setStatus(next);
      onStatusChange?.(next);
    },
    [day.date, onStatusChange],
  );

  const complete = isDistributionComplete(status);

  return (
    <aside className="overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <div className="border-b border-border/40 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          Today&apos;s distribution · semi-auto helper
        </div>
        <h2 className="mt-2 font-display text-lg font-bold">{day.theme}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {complete
            ? "All channels done for today. Stack the streak tomorrow."
            : "Follow the loop — Farcaster first, then X with PNG."}
        </p>
      </div>

      <div className="space-y-3 px-5 py-4 sm:px-6">
        {STEPS.map((step) => {
          const done = status[step.id];
          return (
            <div
              key={step.id}
              className={`flex gap-3 rounded-xl border px-3 py-3 ${
                done ? "border-primary/30 bg-primary/5" : "border-border/50 bg-background/40"
              }`}
            >
              {done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{step.label}</div>
                <div className="text-xs text-muted-foreground">{step.hint}</div>
              </div>
              {!done && (
                <button
                  type="button"
                  onClick={() => refresh({ [step.id]: true })}
                  className="shrink-0 self-center rounded-lg border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide hover:border-primary/50"
                >
                  Done
                </button>
              )}
            </div>
          );
        })}

        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={farcasterComposeUrl(day.farcasterPost)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => refresh({ farcasterPosted: true })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
          >
            <Radio className="h-3.5 w-3.5" />
            Open Warpcast
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={() =>
              void download(`calendar-day-${day.dayNumber}`, () => refresh({ pngDownloaded: true }))
            }
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download PNG
          </button>
          <a
            href={xComposeUrl(day.xPost)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => refresh({ xPosted: true })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:text-primary"
          >
            Post on X
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="font-mono text-[10px] uppercase text-muted-foreground">
          In-app: {day.productAction}
        </div>
      </div>

      {/* Off-screen capture target — isolated from page oklch theme */}
      <div
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          opacity: 0,
          pointerEvents: "none",
          color: "#ffffff",
          backgroundColor: EXPORT_COLORS.bgInner,
        }}
        aria-hidden
      >
        <CalendarDayMemeCard ref={cardRef} day={day} />
      </div>
    </aside>
  );
}

export function DistributionReminderBanner({ day }: { day: ViralCalendarDay }) {
  const [status, setStatus] = useState<DistributionStatus>(() => loadDistributionStatus(day.date));

  useEffect(() => {
    setStatus(loadDistributionStatus(day.date));
  }, [day.date]);

  if (isDistributionComplete(status)) return null;

  const pending = STEPS.filter((s) => !status[s.id]).length;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
      <Bell className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>
        <strong className="text-foreground">{pending} distribution step(s)</strong> left for today —{" "}
        {day.theme}
      </span>
      <a href="#distribution-helper" className="font-semibold text-primary hover:underline">
        Open helper ↓
      </a>
    </div>
  );
}
