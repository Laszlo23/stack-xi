import { CHRONICLE_ENTRIES } from "@/lib/mock/protocol-data";
import { SectionHead } from "@/components/layout/SectionHead";

const TAG_STYLES = {
  empire: "border-accent/40 bg-accent/10 text-accent",
  underdog: "border-primary/40 bg-primary/10 text-primary",
  whale: "border-destructive/40 bg-destructive/10 text-destructive",
  chaos: "border-[oklch(0.72_0.28_340)]/40 bg-[oklch(0.72_0.28_340)]/10 text-[oklch(0.85_0.2_340)]",
};

export function ChainLeagueChronicle() {
  return (
    <section className="border-y border-border/60 bg-surface/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          eyebrow="The Chain League Chronicles"
          title={
            <>
              Every match is a <span className="text-gradient">saga.</span>
            </>
          }
          sub="Not prediction markets — narrative participation. Belief, memes, and momentum as the underlying asset."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CHRONICLE_ENTRIES.map((entry) => (
            <article key={entry.id} className="glass rounded-2xl p-5">
              <span
                className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${TAG_STYLES[entry.tag]}`}
              >
                {entry.tag}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold">{entry.headline}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{entry.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
