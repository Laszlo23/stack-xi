import { getActiveMatchday, getNextMatchday } from "@/lib/story/dallas-schedule";
import { getMatchdayStory, PEPE_ORIGIN_STORY } from "@/lib/story/matchday-stories";
import { PepeBubble } from "@/features/story/PepeBubble";
import { SharePostCard } from "@/features/story/ShareActions";
import { BuilderShoutOutStrip } from "@/features/story/BuilderShoutOutStrip";

export function MatchdayStorySection() {
  const match = getActiveMatchday();
  const story = getMatchdayStory(match);
  const next = getNextMatchday(match);

  return (
    <section id="story" className="border-y border-border/60 bg-surface/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            When Luck Started Chasing Me
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Pepe&apos;s origin</h2>
        </div>

        {PEPE_ORIGIN_STORY.map((beat) => (
          <PepeBubble key={beat.id} beat={beat} large={beat.id === "switch"} />
        ))}

        <div className="glass-neon overflow-hidden rounded-2xl">
          <div className="relative aspect-[21/9] max-h-56 w-full overflow-hidden sm:max-h-72">
            <img
              src="/gaolpepe.jpg"
              alt="Pepe goal celebration"
              className="h-full w-full object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <p className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-widest text-primary">
              Today&apos;s vibe · goal energy
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>{match.stage}</span>
              <span className="text-primary">{match.kickoffLabel}</span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold">{story.title}</h3>
            <p className="mt-2 text-lg text-primary">
              {match.home} vs {match.away}
            </p>
            <div className="mt-6 space-y-4">
              {story.beats.map((beat) => (
                <PepeBubble key={beat.id} beat={beat} />
              ))}
            </div>
          </div>
        </div>

        <SharePostCard text={story.sharePost} matchLabel={`${match.home} vs ${match.away}`} />

        <BuilderShoutOutStrip />

        {next && (
          <p className="text-center font-mono text-sm text-muted-foreground">
            Next story drops for{" "}
            <span className="text-primary">
              {next.home} vs {next.away}
            </span>{" "}
            · {next.kickoffLabel}
          </p>
        )}
      </div>
    </section>
  );
}
