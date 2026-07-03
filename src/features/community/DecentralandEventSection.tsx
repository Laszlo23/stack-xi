import { Glasses, Users } from "lucide-react";
import { DCL_EVENT } from "@/lib/story/pepe-script";

export function DecentralandEventSection() {
  return (
    <section id="decentraland" className="border-y border-border/60 bg-surface/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Glasses className="h-4 w-4" />
          Metaverse watch party
        </div>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{DCL_EVENT.title}</h2>
        <p className="mt-3 text-muted-foreground">
          First live event: World Cup together in Decentraland. Virtual friends, real match energy,
          predictions still open while the game runs.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-xl p-4">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Venue</div>
            <div className="mt-1 font-display font-bold">{DCL_EVENT.venue}</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {DCL_EVENT.coordinates}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Live rules</div>
            <div className="mt-1 text-sm">{DCL_EVENT.predictionsNote}</div>
          </div>
        </div>

        <a
          href={DCL_EVENT.dclUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] transition hover:brightness-110"
        >
          <Users className="h-5 w-5" />
          Enter Decentraland lounge
        </a>
      </div>
    </section>
  );
}
