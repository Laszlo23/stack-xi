import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, Check, ChevronDown, Clock, Copy, Sparkles, Target } from "lucide-react";
import { ShareActions } from "@/features/story/ShareActions";
import {
  CALENDAR_RANGE_LABEL,
  VIRAL_CALENDAR_WEEKS,
  getCalendarDayProgress,
  getTodayCalendarWeek,
  type ViralCalendarDay,
  type ViralCalendarWeek,
} from "@/lib/growth/viral-calendar";
import {
  DistributionReminderBanner,
  FarcasterDistributionPanel,
} from "@/features/growth/FarcasterDistributionPanel";
import { CampaignSharePanel } from "@/features/growth/CampaignSharePanel";
import { AirdropAnnouncementBanner } from "@/features/growth/AirdropAnnouncementBanner";
import { farcasterComposeUrl, xComposeUrl } from "@/lib/profile/social-links";

function DayCard({ day, isToday }: { day: ViralCalendarDay; isToday: boolean }) {
  const [open, setOpen] = useState(isToday);
  const [copied, setCopied] = useState<"fc" | "x" | null>(null);

  async function copyText(text: string, kind: "fc" | "x") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition ${
        isToday
          ? "border-primary/50 bg-primary/5 shadow-[0_0_40px_oklch(0.88_0.28_145/0.15)]"
          : "glass border-border/60"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
      >
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-lg font-bold ${
            isToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {day.dayNumber}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
            <span className={isToday ? "text-primary" : "text-muted-foreground"}>
              {day.dateLabel}
            </span>
            {isToday && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Today
              </span>
            )}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">{day.theme}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{day.hook}</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-border/40 px-5 pb-6 pt-2 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[140px_1fr]">
            <div className="overflow-hidden rounded-xl border border-border/50">
              <img
                src={day.pepeImage}
                alt=""
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="space-y-4">
              <MetaRow icon={Target} label="Match context" value={day.matchContext} />
              <MetaRow icon={Clock} label="Post window" value={day.postWindow} />
              <MetaRow icon={Sparkles} label="In-app action" value={day.productAction} />

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  Farcaster · primary
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {day.farcasterPost}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyText(day.farcasterPost, "fc")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/50"
                  >
                    {copied === "fc" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </button>
                  <a
                    href={farcasterComposeUrl(day.farcasterPost)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    Cast it
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-background/40 p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  X · short · no link
                </div>
                <p className="mt-2 text-sm leading-relaxed">{day.xPost}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyText(day.xPost, "x")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/50"
                  >
                    {copied === "x" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy
                  </button>
                  <a
                    href={xComposeUrl(day.xPost)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:text-primary"
                  >
                    Post on X
                  </a>
                </div>
              </div>

              <div className="font-mono text-[10px] uppercase text-muted-foreground">
                Honor tags: {day.builderTags.join(" · ")}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <div className="font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
        <div className="text-foreground">{value}</div>
      </div>
    </div>
  );
}

function WeekSection({ week, todayKey }: { week: ViralCalendarWeek; todayKey?: string }) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold">{week.title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {week.rangeLabel}
        </span>
      </div>
      <div className="space-y-4">
        {week.days.map((day) => (
          <DayCard key={day.id} day={day} isToday={day.date === todayKey} />
        ))}
      </div>
    </section>
  );
}

export function ViralPostCalendarPage() {
  const { today, week, dayIndex, totalDays } = getCalendarDayProgress();
  const todayKey = today?.date;
  const defaultWeekId = week?.id ?? getTodayCalendarWeek()?.id ?? "knockout";
  const [activeWeekId, setActiveWeekId] = useState<ViralCalendarWeek["id"]>(defaultWeekId);

  const activeWeek = useMemo(
    () => VIRAL_CALENDAR_WEEKS.find((w) => w.id === activeWeekId) ?? VIRAL_CALENDAR_WEEKS[0],
    [activeWeekId],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <header>
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Calendar className="h-3.5 w-3.5" />
          Distribution · {CALENDAR_RANGE_LABEL}
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          14-Day Viral Post Calendar
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Two weeks of copy-paste Farcaster casts and X memes — knockout push then semifinal arc.
          Distribution is the product.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="glass-neon rounded-xl px-4 py-3 font-mono text-xs">
            Day {dayIndex || "—"} of {totalDays}
            {today && <span className="ml-2 text-primary">· {today.theme} today</span>}
          </div>
          <Link
            to="/"
            hash="predict"
            className="rounded-xl border border-primary/40 px-4 py-3 text-xs font-bold text-primary hover:bg-primary/10"
          >
            Open predict flow →
          </Link>
          <Link
            to="/partners"
            className="rounded-xl border border-border/60 px-4 py-3 text-xs font-bold text-foreground hover:border-primary/40 hover:text-primary"
          >
            Partner with us →
          </Link>
        </div>
      </header>

      <div className="mt-8 space-y-6">
        <AirdropAnnouncementBanner compact />
        <CampaignSharePanel compact />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {VIRAL_CALENDAR_WEEKS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setActiveWeekId(w.id)}
            className={`rounded-xl border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition ${
              activeWeekId === w.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground hover:border-primary/40"
            }`}
          >
            {w.title}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Daily loop:</strong> Farcaster first (long cast +
        builder tags + site URL) → download PNG → X (short copy + URL + tags) → in-app action from
        each day card.
      </div>

      {today && (
        <div className="mt-6">
          <DistributionReminderBanner day={today} />
        </div>
      )}

      {today && (
        <div id="distribution-helper" className="mt-6">
          <FarcasterDistributionPanel day={today} />
        </div>
      )}

      <div className="mt-10">
        <WeekSection week={activeWeek} todayKey={todayKey} />
      </div>

      {today && (
        <div className="mt-10">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Quick share · today&apos;s Farcaster draft
          </div>
          <ShareActions text={today.farcasterPost} />
        </div>
      )}
    </div>
  );
}
