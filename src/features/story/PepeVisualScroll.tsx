import type { CSSProperties } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { PEPE_VISUAL_CHAPTERS, type PepeVisualChapter } from "@/lib/story/pepe-visual-chapters";
import { ShareActions } from "@/features/story/ShareActions";

const ACCENT_GLOW: Record<PepeVisualChapter["accent"], string> = {
  neon: "from-primary/40 via-primary/10 to-transparent shadow-[0_0_60px_oklch(0.88_0.28_145/0.35)]",
  electric:
    "from-accent/40 via-accent/10 to-transparent shadow-[0_0_60px_oklch(0.75_0.22_240/0.35)]",
  magenta:
    "from-[oklch(0.72_0.28_340)]/40 via-[oklch(0.72_0.28_340)]/10 to-transparent shadow-[0_0_60px_oklch(0.72_0.28_340/0.35)]",
};

function VisualChapter({ chapter, index }: { chapter: PepeVisualChapter; index: number }) {
  const { ref, visible } = useScrollReveal(0.18);
  const imageFirst = chapter.imagePosition === "left";
  const delay = `${index * 80}ms`;

  return (
    <article
      ref={ref}
      className="relative min-h-[88vh] py-12 sm:min-h-[92vh] sm:py-16"
      style={{ "--chapter-delay": delay } as CSSProperties}
    >
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 ${
          imageFirst ? "" : "lg:[direction:rtl]"
        }`}
      >
        <div
          className={`pepe-visual-image-wrap ${visible ? "pepe-visual-in" : "pepe-visual-out"} ${
            imageFirst ? "lg:[direction:ltr]" : "lg:[direction:ltr]"
          }`}
          style={{ transitionDelay: delay }}
        >
          <div
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 bg-gradient-to-br ${ACCENT_GLOW[chapter.accent]}`}
          >
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 z-10 animate-scan bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-40" />
            <span className="absolute left-4 top-4 z-20 rounded-full glass-neon px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              Ch.{chapter.chapter}
            </span>
            <img
              src={chapter.image}
              alt={chapter.alt}
              width={1200}
              height={900}
              loading={index < 2 ? "eager" : "lazy"}
              className="pepe-visual-img aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">
                STACK XI · visual lore
              </p>
            </div>
          </div>
        </div>

        <div
          className={`space-y-5 ${imageFirst ? "" : "lg:[direction:ltr]"} ${
            visible ? "pepe-visual-text-in" : "pepe-visual-text-out"
          }`}
          style={{ transitionDelay: `calc(${delay} + 120ms)` }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Pepe matchday cinema · {chapter.chapter}/06
          </div>
          <h3 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {chapter.title}
          </h3>
          <p className="text-lg leading-relaxed text-foreground/90">{chapter.line}</p>
          {chapter.sub && (
            <p className="text-sm italic leading-relaxed text-muted-foreground">{chapter.sub}</p>
          )}
          <ShareActions text={chapter.sharePost} compact />
        </div>
      </div>

      {index < PEPE_VISUAL_CHAPTERS.length - 1 && (
        <div className="pointer-events-none absolute bottom-0 left-1/2 hidden h-16 w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 to-transparent lg:block" />
      )}
    </article>
  );
}

export function PepeVisualScroll() {
  return (
    <section id="visual-story" className="relative overflow-hidden border-y border-border/60">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.88_0.28_145/0.08),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-6 pt-16 sm:px-6 sm:pt-20">
        <div className="max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Scroll the lore · image edition
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
            Pepe plays soccer. <span className="text-gradient">The feed watches.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six chapters. Beer, penguins, headers, goals, and a legend card. Every panel is one-tap
            shareable on X and Farcaster.
          </p>
        </div>
      </div>

      <div className="relative">
        {PEPE_VISUAL_CHAPTERS.map((chapter, index) => (
          <VisualChapter key={chapter.id} chapter={chapter} index={index} />
        ))}
      </div>

      <div className="pb-20 pt-4 text-center">
        <a
          href="#story"
          className="inline-flex rounded-full glass-neon px-6 py-3 text-sm font-bold text-primary transition hover:brightness-110"
        >
          Continue to today&apos;s matchday story ↓
        </a>
      </div>
    </section>
  );
}
