import { SectionHead } from "@/components/layout/SectionHead";
import { ORACLE_FEED } from "@/lib/mock/protocol-data";

const EVENT_ICONS: Record<string, string> = {
  kickoff: "▶",
  goal: "⚽",
  halftime: "◐",
  fulltime: "■",
  var: "📺",
};

export function RefereeFeed({ compact }: { compact?: boolean }) {
  return (
    <section id="oracle" className={compact ? "" : "mx-auto max-w-7xl px-4 py-20 sm:px-6"}>
      <SectionHead
        eyebrow="The Referee Protocol · Match Engine"
        title={
          <>
            Decentralized match oracle <span className="text-gradient">(simulated).</span>
          </>
        }
        sub="Live match events trigger settlement, update NFT stats, and move culture yield across the chain league."
      />

      <div className="mt-8 glass-neon rounded-2xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground">Oracle feed</span>
          <span className="inline-flex items-center gap-1 text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Streaming
          </span>
        </div>

        <div className="space-y-0 divide-y divide-border/40">
          {ORACLE_FEED.map((event) => (
            <div key={event.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-background/60 font-mono text-sm">
                {EVENT_ICONS[event.type] ?? "·"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>{event.timestamp}</span>
                  {event.minute > 0 && <span>{event.minute}&apos;</span>}
                  <span className="rounded border border-border px-1.5 py-0.5">{event.type}</span>
                </div>
                <p className="mt-1 text-sm">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
